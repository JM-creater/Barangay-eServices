package com.barangay.eservices.modules.reports.dto;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

public class DashboardStatsDTO {
    private long totalRequests;
    private long pendingReviewCount;
    private long needsCorrectionCount;
    private long acceptedCount;
    private long processingCount;
    private long readyForReleaseCount;
    private long completedReleasedCount;
    private long rejectedCount;

    private long appointmentsToday;
    private long pendingAppointmentsCount;
    private long confirmedAppointmentsCount;
    private long attendedAppointmentsCount;
    private long noShowAppointmentsCount;

    private BigDecimal totalRevenueCollected = BigDecimal.ZERO;
    private long totalRegisteredResidents;

    private Map<String, Long> requestsByService = new HashMap<>();

    public DashboardStatsDTO() {}

    public long getTotalRequests() {
        return totalRequests;
    }

    public void setTotalRequests(long totalRequests) {
        this.totalRequests = totalRequests;
    }

    public long getPendingReviewCount() {
        return pendingReviewCount;
    }

    public void setPendingReviewCount(long pendingReviewCount) {
        this.pendingReviewCount = pendingReviewCount;
    }

    public long getNeedsCorrectionCount() {
        return needsCorrectionCount;
    }

    public void setNeedsCorrectionCount(long needsCorrectionCount) {
        this.needsCorrectionCount = needsCorrectionCount;
    }

    public long getAcceptedCount() {
        return acceptedCount;
    }

    public void setAcceptedCount(long acceptedCount) {
        this.acceptedCount = acceptedCount;
    }

    public long getProcessingCount() {
        return processingCount;
    }

    public void setProcessingCount(long processingCount) {
        this.processingCount = processingCount;
    }

    public long getReadyForReleaseCount() {
        return readyForReleaseCount;
    }

    public void setReadyForReleaseCount(long readyForReleaseCount) {
        this.readyForReleaseCount = readyForReleaseCount;
    }

    public long getCompletedReleasedCount() {
        return completedReleasedCount;
    }

    public void setCompletedReleasedCount(long completedReleasedCount) {
        this.completedReleasedCount = completedReleasedCount;
    }

    public long getRejectedCount() {
        return rejectedCount;
    }

    public void setRejectedCount(long rejectedCount) {
        this.rejectedCount = rejectedCount;
    }

    public long getAppointmentsToday() {
        return appointmentsToday;
    }

    public void setAppointmentsToday(long appointmentsToday) {
        this.appointmentsToday = appointmentsToday;
    }

    public long getPendingAppointmentsCount() {
        return pendingAppointmentsCount;
    }

    public void setPendingAppointmentsCount(long pendingAppointmentsCount) {
        this.pendingAppointmentsCount = pendingAppointmentsCount;
    }

    public long getConfirmedAppointmentsCount() {
        return confirmedAppointmentsCount;
    }

    public void setConfirmedAppointmentsCount(long confirmedAppointmentsCount) {
        this.confirmedAppointmentsCount = confirmedAppointmentsCount;
    }

    public long getAttendedAppointmentsCount() {
        return attendedAppointmentsCount;
    }

    public void setAttendedAppointmentsCount(long attendedAppointmentsCount) {
        this.attendedAppointmentsCount = attendedAppointmentsCount;
    }

    public long getNoShowAppointmentsCount() {
        return noShowAppointmentsCount;
    }

    public void setNoShowAppointmentsCount(long noShowAppointmentsCount) {
        this.noShowAppointmentsCount = noShowAppointmentsCount;
    }

    public BigDecimal getTotalRevenueCollected() {
        return totalRevenueCollected;
    }

    public void setTotalRevenueCollected(BigDecimal totalRevenueCollected) {
        this.totalRevenueCollected = totalRevenueCollected;
    }

    public long getTotalRegisteredResidents() {
        return totalRegisteredResidents;
    }

    public void setTotalRegisteredResidents(long totalRegisteredResidents) {
        this.totalRegisteredResidents = totalRegisteredResidents;
    }

    public Map<String, Long> getRequestsByService() {
        return requestsByService;
    }

    public void setRequestsByService(Map<String, Long> requestsByService) {
        this.requestsByService = requestsByService;
    }
}
