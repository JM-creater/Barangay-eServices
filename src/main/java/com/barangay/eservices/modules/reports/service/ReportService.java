package com.barangay.eservices.modules.reports.service;

import com.barangay.eservices.modules.reports.dto.DashboardStatsDTO;
import com.barangay.eservices.modules.reports.dto.FinancialReportDTO;

import java.time.LocalDate;

public interface ReportService {
    DashboardStatsDTO getDashboardStats();
    FinancialReportDTO getFinancialReport(LocalDate startDate, LocalDate endDate);
    String generateCollectionsCsv(LocalDate startDate, LocalDate endDate);
    String generateRequestsCsv(LocalDate startDate, LocalDate endDate, String status);
}
