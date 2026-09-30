package com.barangay.eservices.modules.processing.service;

import com.barangay.eservices.dto.PaginatedResponse;
import com.barangay.eservices.exception.BadRequestException;
import com.barangay.eservices.exception.ResourceNotFoundException;
import com.barangay.eservices.modules.appointments.entity.AppointmentStatus;
import com.barangay.eservices.modules.appointments.repository.AppointmentRepository;
import com.barangay.eservices.modules.audit.service.AuditLogService;
import com.barangay.eservices.modules.notifications.entity.NotificationType;
import com.barangay.eservices.modules.notifications.service.NotificationService;
import com.barangay.eservices.modules.processing.dto.DocumentReleaseDTO;
import com.barangay.eservices.modules.processing.dto.DocumentReleaseRequest;
import com.barangay.eservices.modules.processing.dto.PhysicalVerificationDTO;
import com.barangay.eservices.modules.processing.entity.DocumentRelease;
import com.barangay.eservices.modules.processing.mapper.ProcessingMapper;
import com.barangay.eservices.modules.processing.repository.DocumentReleaseRepository;
import com.barangay.eservices.modules.requests.dto.RequestResponseDTO;
import com.barangay.eservices.modules.requests.entity.DocumentRequest;
import com.barangay.eservices.modules.requests.entity.RequestStatus;
import com.barangay.eservices.modules.requests.mapper.RequestMapper;
import com.barangay.eservices.modules.requests.repository.DocumentRequestRepository;
import com.barangay.eservices.modules.users.entity.User;
import com.barangay.eservices.modules.users.repository.UserRepository;
import com.barangay.eservices.security.SecurityUtil;
import com.barangay.eservices.util.ReferenceGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DocumentProcessingServiceImpl implements DocumentProcessingService {

    @Autowired
    private DocumentRequestRepository requestRepository;
    @Autowired
    private DocumentReleaseRepository releaseRepository;
    @Autowired
    private AppointmentRepository appointmentRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private AuditLogService auditLogService;

    @Override
    @Transactional
    public RequestResponseDTO verifyInPersonRequirements(Long requestId, PhysicalVerificationDTO verification) {
        DocumentRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("DocumentRequest", "id", requestId));

        Long staffId = SecurityUtil.getCurrentUserId();
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", staffId));

        // Mark appointment as attended
        if (request.getAppointment() != null) {
            request.getAppointment().setStatus(AppointmentStatus.ATTENDED);
            appointmentRepository.save(request.getAppointment());
        }

        RequestStatus previousStatus = request.getCurrentStatus();

        if (Boolean.TRUE.equals(verification.getRequirementsSatisfied())) {
            request.setCurrentStatus(RequestStatus.PROCESSING);
            request.addHistory(previousStatus, RequestStatus.PROCESSING,
                    "In-person identity and physical documents verified successfully by " + staff.getFullName() + ". Moved to processing.", staff);

            notificationService.sendNotification(request.getResident(), "Requirements Verified",
                    "Your identity and documents for " + request.getReferenceNumber() + " were verified at the Barangay Hall. Your certificate is now processing.",
                    NotificationType.GENERAL, request.getReferenceNumber());

            auditLogService.logAction(staff, "IN_PERSON_VERIFIED", "DocumentRequest", request.getId().toString(),
                    "Physical documents verified for " + request.getReferenceNumber());
        } else {
            // Missing requirements
            String notes = verification.getNotes() != null ? verification.getNotes() : "Incomplete original documents presented";
            request.setRemarks("Missing requirements on office visit: " + notes);
            request.addHistory(previousStatus, previousStatus,
                    "Office visit verification pending: " + notes, staff);

            notificationService.sendNotification(request.getResident(), "Follow-up Required",
                    "Missing requirements noted during your visit for " + request.getReferenceNumber() + ": " + notes + ". Please arrange follow-up with barangay staff.",
                    NotificationType.GENERAL, request.getReferenceNumber());

            auditLogService.logAction(staff, "IN_PERSON_VERIFICATION_FAILED", "DocumentRequest", request.getId().toString(),
                    "Missing requirements for " + request.getReferenceNumber() + ": " + notes);
        }

        DocumentRequest updated = requestRepository.save(request);
        return RequestMapper.toResponseDTO(updated);
    }

    @Override
    @Transactional
    public RequestResponseDTO officialApproveAndSign(Long requestId, Long approverUserId, String notes) {
        DocumentRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("DocumentRequest", "id", requestId));

        User approver;
        if (approverUserId != null) {
            approver = userRepository.findById(approverUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", approverUserId));
        } else {
            Long currentUserId = SecurityUtil.getCurrentUserId();
            approver = userRepository.findById(currentUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));
        }

        RequestStatus previousStatus = request.getCurrentStatus();
        request.setCurrentStatus(RequestStatus.READY_FOR_RELEASE);

        String remark = "Officially approved and signed by " + approver.getFullName() + ". " + (notes != null ? notes : "");
        request.addHistory(previousStatus, RequestStatus.READY_FOR_RELEASE, remark, approver);

        notificationService.sendNotification(request.getResident(), "Document Ready for Release",
                "Your requested " + request.getServiceItem().getName() + " (" + request.getReferenceNumber() + ") has been officially approved and is ready for release!",
                NotificationType.READY_FOR_RELEASE, request.getReferenceNumber());

        auditLogService.logAction(approver, "OFFICIAL_APPROVED_AND_SIGNED", "DocumentRequest", request.getId().toString(),
                "Approved and signed " + request.getReferenceNumber());

        DocumentRequest updated = requestRepository.save(request);
        return RequestMapper.toResponseDTO(updated);
    }

    @Override
    @Transactional
    public DocumentReleaseDTO releaseDocument(Long requestId, DocumentReleaseRequest releaseRequest) {
        DocumentRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("DocumentRequest", "id", requestId));

        if (request.getCurrentStatus() == RequestStatus.RELEASED) {
            throw new BadRequestException("This document has already been released");
        }

        Long officerId = SecurityUtil.getCurrentUserId();
        User releasingOfficer = userRepository.findById(officerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", officerId));

        User approver = null;
        if (releaseRequest.getOfficialApproverId() != null) {
            approver = userRepository.findById(releaseRequest.getOfficialApproverId()).orElse(null);
        }

        // Generate release reference & document number
        String releaseRef = ReferenceGenerator.generateReleaseReference();
        String docNumber = releaseRequest.getIssuedDocumentNumber() != null && !releaseRequest.getIssuedDocumentNumber().trim().isEmpty()
                ? releaseRequest.getIssuedDocumentNumber()
                : ReferenceGenerator.generateDocumentControlNumber(request.getServiceItem().getServiceCode());

        String recipient = releaseRequest.getRecipientName() != null && !releaseRequest.getRecipientName().trim().isEmpty()
                ? releaseRequest.getRecipientName()
                : request.getResident().getFullName();

        BigDecimal fee = releaseRequest.getPaymentAmount() != null
                ? releaseRequest.getPaymentAmount()
                : request.getServiceItem().getFee();

        DocumentRelease release = new DocumentRelease();
        release.setDocumentRequest(request);
        release.setReleaseReferenceNo(releaseRef);
        release.setIssuedDocumentNumber(docNumber);
        release.setRecipientName(recipient);
        release.setReleasingOfficer(releasingOfficer);
        release.setOfficialApprover(approver);
        release.setPaymentAmount(fee);
        release.setOfficialReceiptNumber(releaseRequest.getOfficialReceiptNumber());
        release.setPaymentStatus(releaseRequest.getPaymentStatus() != null ? releaseRequest.getPaymentStatus() : "PAID");
        release.setReleaseDate(LocalDateTime.now());
        release.setRemarks(releaseRequest.getRemarks());

        DocumentRelease savedRelease = releaseRepository.save(release);

        // Update request status to RELEASED
        RequestStatus previousStatus = request.getCurrentStatus();
        request.setCurrentStatus(RequestStatus.RELEASED);
        request.addHistory(previousStatus, RequestStatus.RELEASED,
                "Document issued and released by " + releasingOfficer.getFullName() + ". Doc Control No: " + docNumber +
                        (releaseRequest.getOfficialReceiptNumber() != null ? ", O.R. No: " + releaseRequest.getOfficialReceiptNumber() : ""),
                releasingOfficer);

        requestRepository.save(request);

        // Notify resident
        String notifMsg = String.format("Your %s has been successfully issued and released! Document Control No: %s. Thank you for using Barangay Cansojong e-Services.",
                request.getServiceItem().getName(), docNumber);
        notificationService.sendNotification(request.getResident(), "Document Released", notifMsg,
                NotificationType.RELEASED, request.getReferenceNumber());

        auditLogService.logAction(releasingOfficer, "DOCUMENT_RELEASED", "DocumentRelease", savedRelease.getId().toString(),
                "Issued " + docNumber + " for request " + request.getReferenceNumber() + " to " + recipient);

        return ProcessingMapper.toDTO(savedRelease);
    }

    @Override
    @Transactional(readOnly = true)
    public DocumentReleaseDTO getReleaseByRequestId(Long requestId) {
        DocumentRelease release = releaseRepository.findByDocumentRequestId(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("DocumentRelease", "requestId", requestId));
        return ProcessingMapper.toDTO(release);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<DocumentReleaseDTO> getAllReleases(Pageable pageable) {
        Page<DocumentRelease> page = releaseRepository.findAllByOrderByReleaseDateDesc(pageable);
        List<DocumentReleaseDTO> dtoList = page.getContent().stream()
                .map(ProcessingMapper::toDTO)
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
}
