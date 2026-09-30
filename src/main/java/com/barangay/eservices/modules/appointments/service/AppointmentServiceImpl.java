package com.barangay.eservices.modules.appointments.service;

import com.barangay.eservices.dto.PaginatedResponse;
import com.barangay.eservices.exception.BadRequestException;
import com.barangay.eservices.exception.ResourceNotFoundException;
import com.barangay.eservices.exception.SlotFullException;
import com.barangay.eservices.modules.appointments.dto.*;
import com.barangay.eservices.modules.appointments.entity.Appointment;
import com.barangay.eservices.modules.appointments.entity.AppointmentSlot;
import com.barangay.eservices.modules.appointments.entity.AppointmentStatus;
import com.barangay.eservices.modules.appointments.mapper.AppointmentMapper;
import com.barangay.eservices.modules.appointments.repository.AppointmentRepository;
import com.barangay.eservices.modules.appointments.repository.AppointmentSlotRepository;
import com.barangay.eservices.modules.audit.service.AuditLogService;
import com.barangay.eservices.modules.users.entity.User;
import com.barangay.eservices.modules.users.repository.UserRepository;
import com.barangay.eservices.security.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentServiceImpl implements AppointmentService {

    @Autowired
    private AppointmentSlotRepository slotRepository;
    @Autowired
    private AppointmentRepository appointmentRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private AuditLogService auditLogService;
    @Autowired
    private com.barangay.eservices.modules.appointments.repository.HolidayRepository holidayRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SlotDTO> getAvailableSlots(LocalDate date) {
        return slotRepository.findBySlotDateAndIsActiveTrueOrderByStartTimeAsc(date).stream()
                .map(AppointmentMapper::toSlotDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SlotDTO> getAvailableSlotsBetween(LocalDate startDate, LocalDate endDate) {
        return slotRepository.findBySlotDateBetweenAndIsActiveTrueOrderBySlotDateAscStartTimeAsc(startDate, endDate).stream()
                .map(AppointmentMapper::toSlotDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AppointmentSlot reserveSlot(Long slotId) {
        AppointmentSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("AppointmentSlot", "id", slotId));

        if (!slot.isAvailable()) {
            throw new SlotFullException("Selected appointment slot is fully booked or unavailable");
        }

        int updated = slotRepository.reserveSlotAtomically(slotId);
        if (updated == 0) {
            throw new SlotFullException("Appointment slot was just booked by another resident. Please select another slot.");
        }

        // Return refreshed slot
        return slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("AppointmentSlot", "id", slotId));
    }

    @Override
    @Transactional
    public void releaseSlot(Long slotId) {
        slotRepository.releaseSlotAtomically(slotId);
    }

    @Override
    @Transactional
    public SlotDTO createSlot(CreateSlotRequest request) {
        slotRepository.findBySlotDateAndStartTimeAndEndTime(request.getSlotDate(), request.getStartTime(), request.getEndTime())
                .ifPresent(existing -> {
                    throw new BadRequestException("Slot already exists for the specified date and time");
                });

        AppointmentSlot slot = new AppointmentSlot(
                request.getSlotDate(),
                request.getStartTime(),
                request.getEndTime(),
                request.getMaxCapacity()
        );

        AppointmentSlot saved = slotRepository.save(slot);
        return AppointmentMapper.toSlotDTO(saved);
    }

    @Override
    @Transactional
    public List<SlotDTO> batchCreateSlots(BatchCreateSlotRequest request) {
        List<AppointmentSlot> createdSlots = new ArrayList<>();
        LocalDate currentDate = request.getStartDate();

        while (!currentDate.isAfter(request.getEndDate())) {
            // Skip weekends (Saturday and Sunday) and configured office holidays
            if (currentDate.getDayOfWeek().getValue() <= 5 && !holidayRepository.existsByHolidayDate(currentDate)) {
                for (LocalTime startTime : request.getStartTimes()) {
                    LocalTime endTime = startTime.plusMinutes(request.getDurationMinutes());
                    if (slotRepository.findBySlotDateAndStartTimeAndEndTime(currentDate, startTime, endTime).isEmpty()) {
                        AppointmentSlot slot = new AppointmentSlot(
                                currentDate,
                                startTime,
                                endTime,
                                request.getCapacityPerSlot()
                        );
                        createdSlots.add(slotRepository.save(slot));
                    }
                }
            }
            currentDate = currentDate.plusDays(1);
        }

        return createdSlots.stream()
                .map(AppointmentMapper::toSlotDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AppointmentDTO rescheduleAppointment(Long appointmentId, RescheduleRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        Long oldSlotId = appointment.getSlot().getId();
        Long newSlotId = request.getNewSlotId();

        if (oldSlotId.equals(newSlotId)) {
            throw new BadRequestException("New slot must be different from current slot");
        }

        // Secure new slot first atomically
        AppointmentSlot newSlot = reserveSlot(newSlotId);

        // Release old slot atomically
        releaseSlot(oldSlotId);

        // Update appointment details
        appointment.setSlot(newSlot);
        appointment.setAppointmentDate(newSlot.getSlotDate());
        appointment.setAppointmentTime(newSlot.getStartTime());
        appointment.setNotes((appointment.getNotes() != null ? appointment.getNotes() + "\n" : "") +
                "Rescheduled. Reason: " + (request.getReason() != null ? request.getReason() : "None"));

        Appointment updated = appointmentRepository.save(appointment);

        User currentUser = SecurityUtil.getCurrentUserId() != null 
                ? userRepository.findById(SecurityUtil.getCurrentUserId()).orElse(null) : null;
        auditLogService.logAction(currentUser, "APPOINTMENT_RESCHEDULED", "Appointment", appointment.getId().toString(),
                "Rescheduled appointment for request " + appointment.getDocumentRequest().getReferenceNumber() +
                " to " + newSlot.getSlotDate() + " " + newSlot.getStartTime());

        return AppointmentMapper.toAppointmentDTO(updated);
    }

    @Override
    @Transactional
    public AppointmentDTO updateAppointmentStatus(Long appointmentId, AppointmentStatusUpdateRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        AppointmentStatus newStatus;
        try {
            newStatus = AppointmentStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid appointment status: " + request.getStatus());
        }

        AppointmentStatus previousStatus = appointment.getStatus();
        appointment.setStatus(newStatus);
        if (request.getNotes() != null) {
            appointment.setNotes(request.getNotes());
        }

        // If cancelled, release slot capacity atomically
        if (newStatus == AppointmentStatus.CANCELLED && previousStatus != AppointmentStatus.CANCELLED) {
            releaseSlot(appointment.getSlot().getId());
        }

        Appointment updated = appointmentRepository.save(appointment);

        User currentUser = SecurityUtil.getCurrentUserId() != null 
                ? userRepository.findById(SecurityUtil.getCurrentUserId()).orElse(null) : null;
        auditLogService.logAction(currentUser, "APPOINTMENT_STATUS_UPDATED", "Appointment", appointment.getId().toString(),
                "Status updated from " + previousStatus + " to " + newStatus);

        return AppointmentMapper.toAppointmentDTO(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getMyAppointments() {
        Long residentId = SecurityUtil.getCurrentUserId();
        return appointmentRepository.findByResidentIdOrderByAppointmentDateDescAppointmentTimeDesc(residentId).stream()
                .map(AppointmentMapper::toAppointmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<AppointmentDTO> getAppointments(LocalDate date, String status, Pageable pageable) {
        AppointmentStatus enumStatus = null;
        if (status != null && !status.trim().isEmpty()) {
            enumStatus = AppointmentStatus.valueOf(status.toUpperCase());
        }

        Page<Appointment> page = appointmentRepository.findFilteredAppointments(date, enumStatus, pageable);
        List<AppointmentDTO> dtoList = page.getContent().stream()
                .map(AppointmentMapper::toAppointmentDTO)
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
    public List<AppointmentDTO> getAppointmentsByDate(LocalDate date) {
        return appointmentRepository.findByAppointmentDateOrderByAppointmentTimeAsc(date).stream()
                .map(AppointmentMapper::toAppointmentDTO)
                .collect(Collectors.toList());
    }
}
