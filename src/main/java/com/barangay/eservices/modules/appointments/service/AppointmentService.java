package com.barangay.eservices.modules.appointments.service;

import com.barangay.eservices.dto.PaginatedResponse;
import com.barangay.eservices.modules.appointments.dto.*;
import com.barangay.eservices.modules.appointments.entity.AppointmentSlot;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentService {
    List<SlotDTO> getAvailableSlots(LocalDate date);
    List<SlotDTO> getAvailableSlotsBetween(LocalDate startDate, LocalDate endDate);
    AppointmentSlot reserveSlot(Long slotId);
    void releaseSlot(Long slotId);
    SlotDTO createSlot(CreateSlotRequest request);
    List<SlotDTO> batchCreateSlots(BatchCreateSlotRequest request);
    AppointmentDTO rescheduleAppointment(Long appointmentId, RescheduleRequest request);
    AppointmentDTO updateAppointmentStatus(Long appointmentId, AppointmentStatusUpdateRequest request);
    List<AppointmentDTO> getMyAppointments();
    PaginatedResponse<AppointmentDTO> getAppointments(LocalDate date, String status, Pageable pageable);
    List<AppointmentDTO> getAppointmentsByDate(LocalDate date);
}
