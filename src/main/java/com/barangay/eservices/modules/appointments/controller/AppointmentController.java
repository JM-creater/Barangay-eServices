package com.barangay.eservices.modules.appointments.controller;

import com.barangay.eservices.dto.ApiResponse;
import com.barangay.eservices.dto.PaginatedResponse;
import com.barangay.eservices.modules.appointments.dto.AppointmentDTO;
import com.barangay.eservices.modules.appointments.dto.AppointmentStatusUpdateRequest;
import com.barangay.eservices.modules.appointments.dto.RescheduleRequest;
import com.barangay.eservices.modules.appointments.dto.SlotDTO;
import com.barangay.eservices.modules.appointments.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import com.barangay.eservices.util.PaginationUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@Tag(name = "Appointments", description = "Appointment scheduling and slot management API")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @GetMapping("/available-slots")
    @Operation(summary = "Get available appointment slots for a specific date")
    public ResponseEntity<ApiResponse<List<SlotDTO>>> getAvailableSlots(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<SlotDTO> slots = appointmentService.getAvailableSlots(date);
        return ResponseEntity.ok(ApiResponse.ok(slots));
    }

    @GetMapping("/available-slots-range")
    @Operation(summary = "Get available appointment slots for a date range")
    public ResponseEntity<ApiResponse<List<SlotDTO>>> getAvailableSlotsRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<SlotDTO> slots = appointmentService.getAvailableSlotsBetween(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(slots));
    }

    @GetMapping("/my-appointments")
    @Operation(summary = "Get current resident's appointments")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getMyAppointments() {
        List<AppointmentDTO> appointments = appointmentService.getMyAppointments();
        return ResponseEntity.ok(ApiResponse.ok(appointments));
    }

    @PostMapping("/{id}/reschedule")
    @Operation(summary = "Reschedule an appointment to a new slot")
    public ResponseEntity<ApiResponse<AppointmentDTO>> reschedule(
            @PathVariable Long id,
            @Valid @RequestBody RescheduleRequest request) {
        AppointmentDTO dto = appointmentService.rescheduleAppointment(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Appointment successfully rescheduled", dto));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF', 'APPROVER', 'ADMIN')")
    @Operation(summary = "Staff/Admin list appointments with filtering and pagination")
    public ResponseEntity<ApiResponse<PaginatedResponse<AppointmentDTO>>> getAppointments(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Pageable pageable = PaginationUtil.createSafePageRequest(page, size, null);
        PaginatedResponse<AppointmentDTO> response = appointmentService.getAppointments(date, status, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/by-date")
    @PreAuthorize("hasAnyRole('STAFF', 'APPROVER', 'ADMIN')")
    @Operation(summary = "Get all appointments for a specific date (for daily calendar)")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getAppointmentsByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AppointmentDTO> list = appointmentService.getAppointmentsByDate(date);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('STAFF', 'APPROVER', 'ADMIN')")
    @Operation(summary = "Staff/Admin update appointment status (e.g. ATTENDED, NO_SHOW, CONFIRMED, CANCELLED)")
    public ResponseEntity<ApiResponse<AppointmentDTO>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentStatusUpdateRequest request) {
        AppointmentDTO dto = appointmentService.updateAppointmentStatus(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Appointment status updated", dto));
    }
}
