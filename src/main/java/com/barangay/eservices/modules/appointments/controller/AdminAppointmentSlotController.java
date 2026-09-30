package com.barangay.eservices.modules.appointments.controller;

import com.barangay.eservices.dto.ApiResponse;
import com.barangay.eservices.modules.appointments.dto.BatchCreateSlotRequest;
import com.barangay.eservices.modules.appointments.dto.CreateSlotRequest;
import com.barangay.eservices.modules.appointments.dto.SlotDTO;
import com.barangay.eservices.modules.appointments.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/appointment-slots")
@Tag(name = "Admin Appointment Slots", description = "Appointment capacity and slot management for Admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAppointmentSlotController {

    @Autowired
    private AppointmentService appointmentService;

    @PostMapping
    @Operation(summary = "Create an individual appointment slot")
    public ResponseEntity<ApiResponse<SlotDTO>> createSlot(@Valid @RequestBody CreateSlotRequest request) {
        SlotDTO slot = appointmentService.createSlot(request);
        return ResponseEntity.ok(ApiResponse.ok("Appointment slot created", slot));
    }

    @PostMapping("/batch")
    @Operation(summary = "Batch generate appointment slots for a date range")
    public ResponseEntity<ApiResponse<List<SlotDTO>>> batchCreateSlots(@Valid @RequestBody BatchCreateSlotRequest request) {
        List<SlotDTO> slots = appointmentService.batchCreateSlots(request);
        return ResponseEntity.ok(ApiResponse.ok("Batch created " + slots.size() + " appointment slots", slots));
    }

    @GetMapping
    @Operation(summary = "Get slots for a date range")
    public ResponseEntity<ApiResponse<List<SlotDTO>>> getSlots(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<SlotDTO> slots = appointmentService.getAvailableSlotsBetween(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(slots));
    }
}
