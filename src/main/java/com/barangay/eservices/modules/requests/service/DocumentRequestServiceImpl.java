package com.barangay.eservices.modules.requests.service;

import com.barangay.eservices.dto.PaginatedResponse;
import com.barangay.eservices.exception.BadRequestException;
import com.barangay.eservices.exception.ResourceNotFoundException;
import com.barangay.eservices.modules.appointments.entity.Appointment;
import com.barangay.eservices.modules.appointments.entity.AppointmentSlot;
import com.barangay.eservices.modules.appointments.entity.AppointmentStatus;
import com.barangay.eservices.modules.appointments.repository.AppointmentRepository;
import com.barangay.eservices.modules.appointments.service.AppointmentService;
import com.barangay.eservices.modules.audit.service.AuditLogService;
import com.barangay.eservices.modules.catalog.entity.ServiceItem;
import com.barangay.eservices.modules.catalog.entity.ServiceRequirement;
import com.barangay.eservices.modules.catalog.repository.ServiceItemRepository;
import com.barangay.eservices.modules.catalog.repository.ServiceRequirementRepository;
import com.barangay.eservices.modules.notifications.entity.NotificationType;
import com.barangay.eservices.modules.notifications.service.NotificationService;
import com.barangay.eservices.modules.requests.dto.*;
import com.barangay.eservices.modules.requests.entity.DocumentRequest;
import com.barangay.eservices.modules.requests.entity.RequestFile;
import com.barangay.eservices.modules.requests.entity.RequestStatus;
import com.barangay.eservices.modules.requests.mapper.RequestMapper;
import com.barangay.eservices.modules.requests.repository.DocumentRequestRepository;
import com.barangay.eservices.modules.requests.repository.RequestFileRepository;
import com.barangay.eservices.modules.users.entity.User;
import com.barangay.eservices.modules.users.repository.UserRepository;
import com.barangay.eservices.security.SecurityUtil;
import com.barangay.eservices.util.DateUtil;
import com.barangay.eservices.util.FileStorageService;
import com.barangay.eservices.util.ReferenceGenerator;
import com.barangay.eservices.util.SqlSearchUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.barangay.eservices.util.FileValidationUtil;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DocumentRequestServiceImpl implements DocumentRequestService {

    @Autowired
    private DocumentRequestRepository requestRepository;
    @Autowired
    private RequestFileRepository fileRepository;
    @Autowired
    private ServiceItemRepository serviceItemRepository;
    @Autowired
    private ServiceRequirementRepository requirementRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private AppointmentRepository appointmentRepository;
    @Autowired
    private AppointmentService appointmentService;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private AuditLogService auditLogService;
    @Autowired
    private FileStorageService fileStorageService;

    @Override
    @Transactional
    public RequestResponseDTO submitRequest(RequestCreateDTO requestDTO, List<MultipartFile> files, List<Long> requirementIds) {
        Long residentId = SecurityUtil.getCurrentUserId();
        User resident = userRepository.findById(residentId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", residentId));

        ServiceItem serviceItem = serviceItemRepository.findById(requestDTO.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", requestDTO.getServiceId()));

        if (!Boolean.TRUE.equals(serviceItem.getIsActive())) {
            throw new BadRequestException("This document service is currently unavailable or inactive.");
        }

        // 1. Prevent duplicate concurrent active applications
        List<RequestStatus> activeStatuses = Arrays.asList(
                RequestStatus.SUBMITTED,
                RequestStatus.UNDER_REVIEW,
                RequestStatus.ACCEPTED,
                RequestStatus.PROCESSING,
                RequestStatus.NEEDS_CORRECTION,
                RequestStatus.READY_FOR_RELEASE
        );
        Optional<DocumentRequest> existingActive = requestRepository.findFirstByResidentIdAndServiceItemIdAndCurrentStatusInOrderByCreatedAtDesc(
                residentId, serviceItem.getId(), activeStatuses);
        if (existingActive.isPresent()) {
            throw new BadRequestException(String.format(
                    "You already have an active application (%s) for '%s' currently in status [%s]. Please track its progress or wait until it is completed.",
                    existingActive.get().getReferenceNumber(),
                    serviceItem.getName(),
                    existingActive.get().getCurrentStatus()
            ));
        }

        // 2. Validate purpose length
        if (requestDTO.getPurpose() == null || requestDTO.getPurpose().trim().length() < 5) {
            throw new BadRequestException("Purpose of request is required and must be at least 5 characters long.");
        }

        // 3. Enforce Mandatory Requirements
        List<ServiceRequirement> allRequirements = serviceItem.getRequirements();
        List<ServiceRequirement> mandatoryRequirements = allRequirements.stream()
                .filter(r -> Boolean.TRUE.equals(r.getIsMandatory()))
                .collect(Collectors.toList());

        Map<Long, MultipartFile> providedFilesByReqId = new HashMap<>();
        if (files != null && requirementIds != null) {
            if (files.size() != requirementIds.size()) {
                throw new BadRequestException("Mismatch between number of uploaded files and requirement identifiers.");
            }
            for (int i = 0; i < files.size(); i++) {
                MultipartFile f = files.get(i);
                Long reqId = requirementIds.get(i);
                if (f != null && !f.isEmpty() && reqId != null) {
                    providedFilesByReqId.put(reqId, f);
                }
            }
        }

        for (ServiceRequirement mandatoryReq : mandatoryRequirements) {
            if (!providedFilesByReqId.containsKey(mandatoryReq.getId())) {
                throw new BadRequestException(String.format(
                        "Missing mandatory document: '%s' is required to process your application.",
                        mandatoryReq.getRequirementName()
                ));
            }
        }

        // 4. Security Validate each uploaded file (extension, MIME, magic bytes, size)
        for (Map.Entry<Long, MultipartFile> entry : providedFilesByReqId.entrySet()) {
            Long reqId = entry.getKey();
            MultipartFile file = entry.getValue();

            ServiceRequirement matchedReq = allRequirements.stream()
                    .filter(r -> r.getId().equals(reqId))
                    .findFirst()
                    .orElseThrow(() -> new BadRequestException("Invalid requirement ID: " + reqId + " does not belong to service " + serviceItem.getName()));

            FileValidationUtil.validateFile(file, matchedReq.getRequirementName());
        }

        // 5. Validate and Reserve appointment slot atomically
        AppointmentSlot slot = appointmentService.reserveSlot(requestDTO.getSlotId());
        if (slot.getSlotDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Cannot schedule an appointment slot in the past.");
        }
        if (slot.getSlotDate().getDayOfWeek() == DayOfWeek.SATURDAY || slot.getSlotDate().getDayOfWeek() == DayOfWeek.SUNDAY) {
            throw new BadRequestException("Appointments cannot be scheduled on weekends.");
        }

        // 6. Create Document Request
        DocumentRequest request = new DocumentRequest();
        String refNo = ReferenceGenerator.generateRequestReference();
        while (requestRepository.existsByReferenceNumber(refNo)) {
            refNo = ReferenceGenerator.generateRequestReference();
        }
        request.setReferenceNumber(refNo);
        request.setResident(resident);
        request.setServiceItem(serviceItem);
        request.setPurpose(requestDTO.getPurpose().trim());
        request.setSubmittedDataJson(requestDTO.getSubmittedDataJson());
        request.setCurrentStatus(RequestStatus.SUBMITTED);

        // 7. Create Appointment (linked to reserved slot)
        Appointment appointment = new Appointment();
        appointment.setResident(resident);
        appointment.setSlot(slot);
        appointment.setAppointmentDate(slot.getSlotDate());
        appointment.setAppointmentTime(slot.getStartTime());
        appointment.setStatus(AppointmentStatus.PENDING_CONFIRMATION);
        appointment.setNotes("Scheduled appointment for " + serviceItem.getName());
        request.setAppointment(appointment);

        // 8. Initial history log
        request.addHistory(null, RequestStatus.SUBMITTED, "Application submitted online", resident);

        // 9. Save request
        DocumentRequest savedRequest = requestRepository.save(request);

        // 10. Handle file attachments & store safely
        for (Map.Entry<Long, MultipartFile> entry : providedFilesByReqId.entrySet()) {
            Long reqId = entry.getKey();
            MultipartFile file = entry.getValue();

            FileStorageService.StoredFile stored = fileStorageService.storeFile(file);
            RequestFile requestFile = new RequestFile();
            requestFile.setDocumentRequest(savedRequest);
            requestFile.setOriginalFileName(stored.getOriginalFileName());
            requestFile.setStoredFileName(stored.getStoredFileName());
            requestFile.setStoragePath(stored.getStoragePath());
            requestFile.setFileType(stored.getFileType());
            requestFile.setFileSize(stored.getFileSize());

            requirementRepository.findById(reqId).ifPresent(requestFile::setRequirement);
            fileRepository.save(requestFile);
        }

        // 7. Send notification to resident
        String notifMsg = String.format("Your request for %s has been submitted. Reference Number: %s. Appointment requested on %s at %s. Please wait for staff review.",
                serviceItem.getName(),
                refNo,
                DateUtil.formatDate(slot.getSlotDate()),
                DateUtil.formatTime(slot.getStartTime()));
        notificationService.sendNotification(resident, "Request Submitted Successfully", notifMsg, NotificationType.SUBMISSION_CONFIRMATION, refNo);

        // 8. Audit log
        auditLogService.logAction(resident, "REQUEST_SUBMITTED", "DocumentRequest", savedRequest.getId().toString(),
                "Reference: " + refNo + ", Service: " + serviceItem.getName());

        return RequestMapper.toResponseDTO(requestRepository.findById(savedRequest.getId()).orElse(savedRequest));
    }

    @Override
    @Transactional(readOnly = true)
    public RequestResponseDTO getRequestById(Long id) {
        DocumentRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DocumentRequest", "id", id));
        return RequestMapper.toResponseDTO(request);
    }

    @Override
    @Transactional(readOnly = true)
    public RequestResponseDTO getRequestByReference(String referenceNumber) {
        DocumentRequest request = requestRepository.findByReferenceNumber(referenceNumber)
                .orElseThrow(() -> new ResourceNotFoundException("DocumentRequest", "referenceNumber", referenceNumber));
        return RequestMapper.toResponseDTO(request);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<RequestResponseDTO> getMyRequests(Pageable pageable) {
        Long residentId = SecurityUtil.getCurrentUserId();
        Page<DocumentRequest> page = requestRepository.findByResidentId(residentId, pageable);
        List<RequestResponseDTO> dtoList = page.getContent().stream()
                .map(RequestMapper::toResponseDTO)
                .collect(Collectors.toList());

        return new PaginatedResponse<>(
                dtoList,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<RequestResponseDTO> getAllRequests(String status, Long serviceId, String search, Pageable pageable) {
        RequestStatus enumStatus = null;
        if (status != null && !status.trim().isEmpty()) {
            enumStatus = RequestStatus.valueOf(status.toUpperCase());
        }

        String sanitizedSearch = SqlSearchUtil.escapeLikeWildcards(search);
        Page<DocumentRequest> page = requestRepository.findFilteredRequests(enumStatus, serviceId, sanitizedSearch, pageable);
        List<RequestResponseDTO> dtoList = page.getContent().stream()
                .map(RequestMapper::toResponseDTO)
                .collect(Collectors.toList());

        return new PaginatedResponse<>(
                dtoList,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    @Override
    @Transactional
    public RequestResponseDTO reviewRequest(Long id, StaffReviewActionDTO reviewAction) {
        DocumentRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DocumentRequest", "id", id));

        Long staffId = SecurityUtil.getCurrentUserId();
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", staffId));
        request.setAssignedStaff(staff);

        RequestStatus previousStatus = request.getCurrentStatus();
        String action = reviewAction.getAction().toUpperCase();

        if ("ACCEPT".equals(action)) {
            request.setCurrentStatus(RequestStatus.ACCEPTED);
            if (reviewAction.getRemarks() != null) {
                request.setRemarks(reviewAction.getRemarks());
            }

            // Confirm appointment
            if (request.getAppointment() != null) {
                request.getAppointment().setStatus(AppointmentStatus.CONFIRMED);
                appointmentRepository.save(request.getAppointment());
            }

            request.addHistory(previousStatus, RequestStatus.ACCEPTED,
                    "Application accepted by " + staff.getFullName() + ". Appointment confirmed.", staff);

            // Notify resident with appointment details and requirements to bring
            String dateStr = request.getAppointment() != null ? DateUtil.formatDate(request.getAppointment().getAppointmentDate()) : "Scheduled date";
            String timeStr = request.getAppointment() != null ? DateUtil.formatTime(request.getAppointment().getAppointmentTime()) : "Scheduled time";
            String notifMsg = String.format("Your request for %s (Ref: %s) has been ACCEPTED! Your appointment is confirmed on %s at %s. Please bring your original valid ID and required documents, and preparation for fee: PHP %.2f.",
                    request.getServiceItem().getName(),
                    request.getReferenceNumber(),
                    dateStr,
                    timeStr,
                    request.getServiceItem().getFee());
            notificationService.sendNotification(request.getResident(), "Application Accepted & Appointment Confirmed",
                    notifMsg, NotificationType.APPOINTMENT_CONFIRMED, request.getReferenceNumber());

            auditLogService.logAction(staff, "REQUEST_ACCEPTED", "DocumentRequest", request.getId().toString(),
                    "Accepted request " + request.getReferenceNumber());

        } else if ("REQUEST_CORRECTION".equals(action)) {
            request.setCurrentStatus(RequestStatus.NEEDS_CORRECTION);
            request.setCorrectionNotes(reviewAction.getCorrectionNotes());
            if (reviewAction.getRemarks() != null) {
                request.setRemarks(reviewAction.getRemarks());
            }

            request.addHistory(previousStatus, RequestStatus.NEEDS_CORRECTION,
                    "Corrections requested: " + reviewAction.getCorrectionNotes(), staff);

            String notifMsg = String.format("Action Needed: Your request %s for %s requires corrections: %s. Please log in to update and resubmit.",
                    request.getReferenceNumber(),
                    request.getServiceItem().getName(),
                    reviewAction.getCorrectionNotes());
            notificationService.sendNotification(request.getResident(), "Corrections Needed for Application",
                    notifMsg, NotificationType.NEEDS_CORRECTION, request.getReferenceNumber());

            auditLogService.logAction(staff, "REQUEST_CORRECTION_REQUESTED", "DocumentRequest", request.getId().toString(),
                    "Requested corrections for " + request.getReferenceNumber());

        } else if ("REJECT".equals(action)) {
            request.setCurrentStatus(RequestStatus.REJECTED);
            request.setRejectionReason(reviewAction.getRejectionReason());
            if (reviewAction.getRemarks() != null) {
                request.setRemarks(reviewAction.getRemarks());
            }

            // Scheduling rule: Rejection frees reserved appointment capacity!
            if (request.getAppointment() != null) {
                request.getAppointment().setStatus(AppointmentStatus.CANCELLED);
                request.getAppointment().setCancellationReason("Request rejected: " + reviewAction.getRejectionReason());
                appointmentRepository.save(request.getAppointment());
                if (request.getAppointment().getSlot() != null) {
                    appointmentService.releaseSlot(request.getAppointment().getSlot().getId());
                }
            }

            request.addHistory(previousStatus, RequestStatus.REJECTED,
                    "Application rejected. Reason: " + reviewAction.getRejectionReason(), staff);

            String notifMsg = String.format("Your request %s for %s was not approved. Reason: %s. Reserved appointment slot has been released.",
                    request.getReferenceNumber(),
                    request.getServiceItem().getName(),
                    reviewAction.getRejectionReason());
            notificationService.sendNotification(request.getResident(), "Application Rejected",
                    notifMsg, NotificationType.REJECTED, request.getReferenceNumber());

            auditLogService.logAction(staff, "REQUEST_REJECTED", "DocumentRequest", request.getId().toString(),
                    "Rejected " + request.getReferenceNumber() + ": " + reviewAction.getRejectionReason());

        } else {
            throw new BadRequestException("Invalid review action: " + action);
        }

        DocumentRequest updated = requestRepository.save(request);
        return RequestMapper.toResponseDTO(updated);
    }

    @Override
    @Transactional
    public RequestResponseDTO resubmitCorrections(Long id, CorrectionResubmitDTO resubmitDTO, List<MultipartFile> files, List<Long> requirementIds) {
        DocumentRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DocumentRequest", "id", id));

        Long residentId = SecurityUtil.getCurrentUserId();
        if (!request.getResident().getId().equals(residentId)) {
            throw new BadRequestException("You are not authorized to update this request");
        }

        if (request.getCurrentStatus() != RequestStatus.NEEDS_CORRECTION) {
            throw new BadRequestException("Request is not in NEEDS_CORRECTION status");
        }

        if (resubmitDTO.getPurpose() != null && !resubmitDTO.getPurpose().trim().isEmpty()) {
            request.setPurpose(resubmitDTO.getPurpose());
        }
        if (resubmitDTO.getSubmittedDataJson() != null) {
            request.setSubmittedDataJson(resubmitDTO.getSubmittedDataJson());
        }

        // Attach new/corrected files
        if (files != null && !files.isEmpty()) {
            for (int i = 0; i < files.size(); i++) {
                MultipartFile file = files.get(i);
                if (file != null && !file.isEmpty()) {
                    String reqName = "Resubmitted Document";
                    if (requirementIds != null && i < requirementIds.size() && requirementIds.get(i) != null) {
                        Long reqId = requirementIds.get(i);
                        reqName = requirementRepository.findById(reqId)
                                .map(ServiceRequirement::getRequirementName)
                                .orElse("Requirement " + reqId);
                    }
                    FileValidationUtil.validateFile(file, reqName);

                    FileStorageService.StoredFile stored = fileStorageService.storeFile(file);
                    RequestFile requestFile = new RequestFile();
                    requestFile.setDocumentRequest(request);
                    requestFile.setOriginalFileName(stored.getOriginalFileName());
                    requestFile.setStoredFileName(stored.getStoredFileName());
                    requestFile.setStoragePath(stored.getStoragePath());
                    requestFile.setFileType(stored.getFileType());
                    requestFile.setFileSize(stored.getFileSize());

                    if (requirementIds != null && i < requirementIds.size() && requirementIds.get(i) != null) {
                        requirementRepository.findById(requirementIds.get(i)).ifPresent(requestFile::setRequirement);
                    }

                    fileRepository.save(requestFile);
                }
            }
        }

        RequestStatus previousStatus = request.getCurrentStatus();
        request.setCurrentStatus(RequestStatus.SUBMITTED);
        request.setCorrectionNotes(null); // Clear previous correction notes

        User resident = request.getResident();
        request.addHistory(previousStatus, RequestStatus.SUBMITTED,
                "Resident resubmitted updated information and documents. " + (resubmitDTO.getRemarks() != null ? resubmitDTO.getRemarks() : ""), resident);

        DocumentRequest updated = requestRepository.save(request);

        auditLogService.logAction(resident, "REQUEST_CORRECTIONS_RESUBMITTED", "DocumentRequest", request.getId().toString(),
                "Corrections resubmitted for " + request.getReferenceNumber());

        return RequestMapper.toResponseDTO(updated);
    }

    @Override
    @Transactional
    public RequestResponseDTO cancelRequest(Long id, String reason) {
        DocumentRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DocumentRequest", "id", id));

        Long residentId = SecurityUtil.getCurrentUserId();
        User currentUser = userRepository.findById(residentId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", residentId));

        if (request.getCurrentStatus() == RequestStatus.RELEASED || request.getCurrentStatus() == RequestStatus.CANCELLED) {
            throw new BadRequestException("Request cannot be cancelled in status: " + request.getCurrentStatus());
        }

        RequestStatus previousStatus = request.getCurrentStatus();
        request.setCurrentStatus(RequestStatus.CANCELLED);
        request.setRemarks("Cancelled by user. Reason: " + reason);

        // Scheduling rule: Cancellation frees reserved appointment capacity!
        if (request.getAppointment() != null) {
            request.getAppointment().setStatus(AppointmentStatus.CANCELLED);
            request.getAppointment().setCancellationReason("Request cancelled: " + reason);
            appointmentRepository.save(request.getAppointment());
            if (request.getAppointment().getSlot() != null) {
                appointmentService.releaseSlot(request.getAppointment().getSlot().getId());
            }
        }

        request.addHistory(previousStatus, RequestStatus.CANCELLED, "Request cancelled. Reason: " + reason, currentUser);
        DocumentRequest updated = requestRepository.save(request);

        auditLogService.logAction(currentUser, "REQUEST_CANCELLED", "DocumentRequest", request.getId().toString(),
                "Cancelled " + request.getReferenceNumber() + ": " + reason);

        return RequestMapper.toResponseDTO(updated);
    }

    @Override
    @Transactional
    public RequestResponseDTO rescheduleRequest(Long id, com.barangay.eservices.modules.appointments.dto.RescheduleRequest rescheduleRequest) {
        DocumentRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DocumentRequest", "id", id));

        Long currentUserId = SecurityUtil.getCurrentUserId();
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        boolean isOwner = request.getResident().getId().equals(currentUserId);
        boolean isStaffOrAdmin = SecurityUtil.hasRole("ROLE_STAFF") || SecurityUtil.hasRole("ROLE_ADMIN") || SecurityUtil.hasRole("ROLE_APPROVER");
        if (!isOwner && !isStaffOrAdmin) {
            throw new BadRequestException("You are not authorized to reschedule this application");
        }

        if (request.getCurrentStatus() == RequestStatus.RELEASED || request.getCurrentStatus() == RequestStatus.CANCELLED || request.getCurrentStatus() == RequestStatus.REJECTED) {
            throw new BadRequestException("Cannot reschedule application in status: " + request.getCurrentStatus());
        }

        if (request.getAppointment() == null) {
            throw new BadRequestException("No appointment associated with this application to reschedule");
        }

        appointmentService.rescheduleAppointment(request.getAppointment().getId(), rescheduleRequest);

        request.addHistory(request.getCurrentStatus(), request.getCurrentStatus(),
                "Appointment rescheduled. Reason: " + (rescheduleRequest.getReason() != null ? rescheduleRequest.getReason() : "Requested by user"),
                currentUser);

        DocumentRequest updated = requestRepository.save(request);
        return RequestMapper.toResponseDTO(updated);
    }
}
