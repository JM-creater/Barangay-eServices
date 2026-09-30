package com.barangay.eservices.modules.appointments.mapper;

import com.barangay.eservices.modules.appointments.dto.AppointmentDTO;
import com.barangay.eservices.modules.appointments.dto.SlotDTO;
import com.barangay.eservices.modules.appointments.entity.Appointment;
import com.barangay.eservices.modules.appointments.entity.AppointmentSlot;

public class AppointmentMapper {

    public static SlotDTO toSlotDTO(AppointmentSlot slot) {
        if (slot == null) return null;
        SlotDTO dto = new SlotDTO();
        dto.setId(slot.getId());
        dto.setSlotDate(slot.getSlotDate());
        dto.setStartTime(slot.getStartTime());
        dto.setEndTime(slot.getEndTime());
        dto.setMaxCapacity(slot.getMaxCapacity());
        dto.setBookedCount(slot.getBookedCount());
        dto.setRemainingCapacity(slot.getRemainingCapacity());
        dto.setIsAvailable(slot.isAvailable());
        dto.setIsActive(slot.getIsActive());
        return dto;
    }

    public static AppointmentDTO toAppointmentDTO(Appointment appointment) {
        if (appointment == null) return null;
        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(appointment.getId());
        if (appointment.getDocumentRequest() != null) {
            dto.setRequestId(appointment.getDocumentRequest().getId());
            dto.setReferenceNumber(appointment.getDocumentRequest().getReferenceNumber());
            if (appointment.getDocumentRequest().getServiceItem() != null) {
                dto.setServiceName(appointment.getDocumentRequest().getServiceItem().getName());
            }
        }
        if (appointment.getResident() != null) {
            dto.setResidentId(appointment.getResident().getId());
            dto.setResidentName(appointment.getResident().getFullName());
            dto.setContactNumber(appointment.getResident().getContactNumber());
        }
        if (appointment.getSlot() != null) {
            dto.setSlotId(appointment.getSlot().getId());
        }
        dto.setAppointmentDate(appointment.getAppointmentDate());
        dto.setAppointmentTime(appointment.getAppointmentTime());
        dto.setStatus(appointment.getStatus().name());
        dto.setNotes(appointment.getNotes());
        dto.setCancellationReason(appointment.getCancellationReason());
        return dto;
    }
}
