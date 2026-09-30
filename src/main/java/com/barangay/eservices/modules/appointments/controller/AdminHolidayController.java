package com.barangay.eservices.modules.appointments.controller;

import com.barangay.eservices.dto.ApiResponse;
import com.barangay.eservices.modules.appointments.dto.CreateHolidayRequest;
import com.barangay.eservices.modules.appointments.dto.HolidayDTO;
import com.barangay.eservices.modules.appointments.service.HolidayService;
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
@RequestMapping("/api/admin/holidays")
@Tag(name = "Admin Holidays", description = "Office schedule and holiday management API")
public class AdminHolidayController {

    @Autowired
    private HolidayService holidayService;

    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF', 'APPROVER', 'ADMIN')")
    @Operation(summary = "List all holidays or filter by date range")
    public ResponseEntity<ApiResponse<List<HolidayDTO>>> getHolidays(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<HolidayDTO> holidays;
        if (startDate != null && endDate != null) {
            holidays = holidayService.getHolidaysBetween(startDate, endDate);
        } else {
            holidays = holidayService.getAllHolidays();
        }
        return ResponseEntity.ok(ApiResponse.ok(holidays));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create an office holiday or non-working day")
    public ResponseEntity<ApiResponse<HolidayDTO>> createHoliday(@Valid @RequestBody CreateHolidayRequest request) {
        HolidayDTO created = holidayService.createHoliday(request);
        return ResponseEntity.ok(ApiResponse.ok("Holiday created successfully", created));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a holiday")
    public ResponseEntity<ApiResponse<Void>> deleteHoliday(@PathVariable Long id) {
        holidayService.deleteHoliday(id);
        return ResponseEntity.ok(ApiResponse.ok("Holiday deleted successfully", null));
    }
}
