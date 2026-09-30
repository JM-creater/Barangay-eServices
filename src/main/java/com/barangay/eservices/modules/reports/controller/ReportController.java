package com.barangay.eservices.modules.reports.controller;

import com.barangay.eservices.dto.ApiResponse;
import com.barangay.eservices.modules.reports.dto.DashboardStatsDTO;
import com.barangay.eservices.modules.reports.dto.FinancialReportDTO;
import com.barangay.eservices.modules.reports.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@Tag(name = "Reports & Analytics", description = "Workload metrics, appointment statistics, and revenue reporting API")
@PreAuthorize("hasAnyRole('STAFF', 'APPROVER', 'ADMIN')")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/dashboard-stats")
    @Operation(summary = "Get overview dashboard stats for staff and administrator")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getDashboardStats() {
        DashboardStatsDTO stats = reportService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/financial")
    @Operation(summary = "Get date-filtered financial collections report and revenue breakdown")
    public ResponseEntity<ApiResponse<FinancialReportDTO>> getFinancialReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        FinancialReportDTO report = reportService.getFinancialReport(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(report));
    }

    @GetMapping(value = "/export/collections", produces = "text/csv")
    @Operation(summary = "Export financial collection records to CSV for Barangay Treasurer and COA auditing")
    public ResponseEntity<String> exportCollectionsCsv(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        String csv = reportService.generateCollectionsCsv(startDate, endDate);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"collections_report_" + LocalDate.now() + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @GetMapping(value = "/export/requests", produces = "text/csv")
    @Operation(summary = "Export document application lifecycle records to CSV")
    public ResponseEntity<String> exportRequestsCsv(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String status) {
        String csv = reportService.generateRequestsCsv(startDate, endDate, status);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"requests_report_" + LocalDate.now() + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }
}
