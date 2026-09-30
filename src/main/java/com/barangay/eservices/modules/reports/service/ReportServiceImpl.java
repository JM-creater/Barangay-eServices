package com.barangay.eservices.modules.reports.service;

import com.barangay.eservices.modules.appointments.entity.AppointmentStatus;
import com.barangay.eservices.modules.appointments.repository.AppointmentRepository;
import com.barangay.eservices.modules.processing.entity.DocumentRelease;
import com.barangay.eservices.modules.processing.repository.DocumentReleaseRepository;
import com.barangay.eservices.modules.reports.dto.DashboardStatsDTO;
import com.barangay.eservices.modules.reports.dto.FinancialReportDTO;
import com.barangay.eservices.modules.requests.entity.DocumentRequest;
import com.barangay.eservices.modules.requests.entity.RequestStatus;
import com.barangay.eservices.modules.requests.repository.DocumentRequestRepository;
import com.barangay.eservices.modules.users.entity.RoleName;
import com.barangay.eservices.modules.users.repository.UserRepository;
import com.barangay.eservices.util.DateUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ReportServiceImpl implements ReportService {

    @Autowired
    private DocumentRequestRepository requestRepository;
    @Autowired
    private AppointmentRepository appointmentRepository;
    @Autowired
    private DocumentReleaseRepository releaseRepository;
    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        // Requests counts
        stats.setTotalRequests(requestRepository.count());
        stats.setPendingReviewCount(requestRepository.countByCurrentStatus(RequestStatus.SUBMITTED)
                + requestRepository.countByCurrentStatus(RequestStatus.UNDER_REVIEW));
        stats.setNeedsCorrectionCount(requestRepository.countByCurrentStatus(RequestStatus.NEEDS_CORRECTION));
        stats.setAcceptedCount(requestRepository.countByCurrentStatus(RequestStatus.ACCEPTED));
        stats.setProcessingCount(requestRepository.countByCurrentStatus(RequestStatus.PROCESSING));
        stats.setReadyForReleaseCount(requestRepository.countByCurrentStatus(RequestStatus.READY_FOR_RELEASE));
        stats.setCompletedReleasedCount(requestRepository.countByCurrentStatus(RequestStatus.RELEASED));
        stats.setRejectedCount(requestRepository.countByCurrentStatus(RequestStatus.REJECTED));

        // Appointments counts
        LocalDate today = LocalDate.now();
        stats.setAppointmentsToday(appointmentRepository.countByAppointmentDate(today));
        stats.setPendingAppointmentsCount(appointmentRepository.countByStatus(AppointmentStatus.PENDING_CONFIRMATION));
        stats.setConfirmedAppointmentsCount(appointmentRepository.countByStatus(AppointmentStatus.CONFIRMED));
        stats.setAttendedAppointmentsCount(appointmentRepository.countByStatus(AppointmentStatus.ATTENDED));
        stats.setNoShowAppointmentsCount(appointmentRepository.countByStatus(AppointmentStatus.NO_SHOW));

        // Financial & Users
        BigDecimal rev = releaseRepository.calculateTotalRevenue();
        stats.setTotalRevenueCollected(rev != null ? rev : BigDecimal.ZERO);
        stats.setTotalRegisteredResidents(userRepository.findByRoleName(RoleName.ROLE_RESIDENT).size());

        // Breakdown by service
        List<Object[]> byService = requestRepository.countRequestsByService();
        Map<String, Long> serviceMap = new HashMap<>();
        for (Object[] row : byService) {
            String serviceName = (String) row[0];
            Long count = (Long) row[1];
            serviceMap.put(serviceName, count);
        }
        stats.setRequestsByService(serviceMap);

        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public FinancialReportDTO getFinancialReport(LocalDate startDate, LocalDate endDate) {
        if (startDate == null) {
            startDate = LocalDate.now().withDayOfMonth(1); // default to 1st of current month
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);

        List<DocumentRelease> releases = releaseRepository.findByReleaseDateBetweenOrderByReleaseDateDesc(start, end);

        FinancialReportDTO report = new FinancialReportDTO();
        report.setStartDate(startDate);
        report.setEndDate(endDate);

        BigDecimal total = BigDecimal.ZERO;
        long receiptsCount = 0;
        Map<String, FinancialReportDTO.ServiceRevenueBreakdownDTO> serviceMap = new HashMap<>();
        Map<String, Long> statusMap = new HashMap<>();
        Map<String, BigDecimal> dailyMap = new TreeMap<>();

        DateTimeFormatter dayFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (DocumentRelease r : releases) {
            BigDecimal amount = r.getPaymentAmount() != null ? r.getPaymentAmount() : BigDecimal.ZERO;
            String paymentStatus = r.getPaymentStatus() != null ? r.getPaymentStatus().toUpperCase() : "PAID";
            statusMap.put(paymentStatus, statusMap.getOrDefault(paymentStatus, 0L) + 1);

            if ("PAID".equals(paymentStatus)) {
                total = total.add(amount);

                if (r.getReleaseDate() != null) {
                    String dayKey = r.getReleaseDate().format(dayFormatter);
                    dailyMap.put(dayKey, dailyMap.getOrDefault(dayKey, BigDecimal.ZERO).add(amount));
                }
            }

            if (r.getOfficialReceiptNumber() != null && !r.getOfficialReceiptNumber().trim().isEmpty()) {
                receiptsCount++;
            }

            String serviceName = r.getDocumentRequest().getServiceItem().getName();
            FinancialReportDTO.ServiceRevenueBreakdownDTO breakdown = serviceMap.getOrDefault(
                    serviceName,
                    new FinancialReportDTO.ServiceRevenueBreakdownDTO(serviceName, 0, BigDecimal.ZERO)
            );
            breakdown.setTransactionCount(breakdown.getTransactionCount() + 1);
            if ("PAID".equals(paymentStatus)) {
                breakdown.setTotalAmount(breakdown.getTotalAmount().add(amount));
            }
            serviceMap.put(serviceName, breakdown);
        }

        report.setTotalRevenue(total);
        report.setTotalReceiptsIssued(receiptsCount);
        report.setServiceBreakdown(new ArrayList<>(serviceMap.values()));
        report.setStatusBreakdown(statusMap);
        report.setDailyCollections(dailyMap);

        return report;
    }

    @Override
    @Transactional(readOnly = true)
    public String generateCollectionsCsv(LocalDate startDate, LocalDate endDate) {
        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(1);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);

        List<DocumentRelease> releases = releaseRepository.findByReleaseDateBetweenOrderByReleaseDateDesc(start, end);

        StringBuilder sb = new StringBuilder();
        sb.append("Release Date,O.R. Number,Document Control No,App Reference,Service Name,Recipient Name,Amount (PHP),Payment Status,Releasing Officer,Official Approver,Remarks\n");

        for (DocumentRelease r : releases) {
            sb.append(escapeCsv(r.getReleaseDate() != null ? r.getReleaseDate().toString() : "")).append(",");
            sb.append(escapeCsv(r.getOfficialReceiptNumber() != null ? r.getOfficialReceiptNumber() : "N/A")).append(",");
            sb.append(escapeCsv(r.getIssuedDocumentNumber())).append(",");
            sb.append(escapeCsv(r.getDocumentRequest().getReferenceNumber())).append(",");
            sb.append(escapeCsv(r.getDocumentRequest().getServiceItem().getName())).append(",");
            sb.append(escapeCsv(r.getRecipientName())).append(",");
            sb.append(r.getPaymentAmount() != null ? r.getPaymentAmount().toString() : "0.00").append(",");
            sb.append(escapeCsv(r.getPaymentStatus() != null ? r.getPaymentStatus() : "PAID")).append(",");
            sb.append(escapeCsv(r.getReleasingOfficer() != null ? r.getReleasingOfficer().getFullName() : "")).append(",");
            sb.append(escapeCsv(r.getOfficialApprover() != null ? r.getOfficialApprover().getFullName() : "")).append(",");
            sb.append(escapeCsv(r.getRemarks() != null ? r.getRemarks() : "")).append("\n");
        }

        return sb.toString();
    }

    @Override
    @Transactional(readOnly = true)
    public String generateRequestsCsv(LocalDate startDate, LocalDate endDate, String statusStr) {
        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(1);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);

        List<DocumentRequest> requests;
        if (statusStr != null && !statusStr.trim().isEmpty()) {
            RequestStatus status = RequestStatus.valueOf(statusStr.toUpperCase());
            requests = requestRepository.findByCreatedAtBetweenAndCurrentStatusOrderByCreatedAtDesc(start, end, status);
        } else {
            requests = requestRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(start, end);
        }

        StringBuilder sb = new StringBuilder();
        sb.append("Reference Number,Service Name,Resident Name,Contact Number,Current Status,Purpose,Appointment Date,Appointment Time,Submission Date,Assigned Staff\n");

        for (DocumentRequest req : requests) {
            sb.append(escapeCsv(req.getReferenceNumber())).append(",");
            sb.append(escapeCsv(req.getServiceItem().getName())).append(",");
            sb.append(escapeCsv(req.getResident().getFullName())).append(",");
            sb.append(escapeCsv(req.getResident().getContactNumber() != null ? req.getResident().getContactNumber() : "")).append(",");
            sb.append(escapeCsv(req.getCurrentStatus().name())).append(",");
            sb.append(escapeCsv(req.getPurpose() != null ? req.getPurpose() : "")).append(",");
            sb.append(escapeCsv(req.getAppointment() != null ? req.getAppointment().getAppointmentDate().toString() : "")).append(",");
            sb.append(escapeCsv(req.getAppointment() != null ? req.getAppointment().getAppointmentTime().toString() : "")).append(",");
            sb.append(escapeCsv(req.getCreatedAt() != null ? req.getCreatedAt().toString() : "")).append(",");
            sb.append(escapeCsv(req.getAssignedStaff() != null ? req.getAssignedStaff().getFullName() : "Unassigned")).append("\n");
        }

        return sb.toString();
    }

    private String escapeCsv(String val) {
        if (val == null) return "\"\"";
        return "\"" + val.replace("\"", "\"\"") + "\"";
    }
}
