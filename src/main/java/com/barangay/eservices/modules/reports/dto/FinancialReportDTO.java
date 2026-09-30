package com.barangay.eservices.modules.reports.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class FinancialReportDTO {

    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalRevenue = BigDecimal.ZERO;
    private long totalReceiptsIssued = 0;
    private List<ServiceRevenueBreakdownDTO> serviceBreakdown = new ArrayList<>();
    private Map<String, Long> statusBreakdown = new HashMap<>();
    private Map<String, BigDecimal> dailyCollections = new HashMap<>();

    public FinancialReportDTO() {
    }

    public static class ServiceRevenueBreakdownDTO {
        private String serviceName;
        private long transactionCount;
        private BigDecimal totalAmount;

        public ServiceRevenueBreakdownDTO() {
        }

        public ServiceRevenueBreakdownDTO(String serviceName, long transactionCount, BigDecimal totalAmount) {
            this.serviceName = serviceName;
            this.transactionCount = transactionCount;
            this.totalAmount = totalAmount;
        }

        public String getServiceName() {
            return serviceName;
        }

        public void setServiceName(String serviceName) {
            this.serviceName = serviceName;
        }

        public long getTransactionCount() {
            return transactionCount;
        }

        public void setTransactionCount(long transactionCount) {
            this.transactionCount = transactionCount;
        }

        public BigDecimal getTotalAmount() {
            return totalAmount;
        }

        public void setTotalAmount(BigDecimal totalAmount) {
            this.totalAmount = totalAmount;
        }
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public long getTotalReceiptsIssued() {
        return totalReceiptsIssued;
    }

    public void setTotalReceiptsIssued(long totalReceiptsIssued) {
        this.totalReceiptsIssued = totalReceiptsIssued;
    }

    public List<ServiceRevenueBreakdownDTO> getServiceBreakdown() {
        return serviceBreakdown;
    }

    public void setServiceBreakdown(List<ServiceRevenueBreakdownDTO> serviceBreakdown) {
        this.serviceBreakdown = serviceBreakdown;
    }

    public Map<String, Long> getStatusBreakdown() {
        return statusBreakdown;
    }

    public void setStatusBreakdown(Map<String, Long> statusBreakdown) {
        this.statusBreakdown = statusBreakdown;
    }

    public Map<String, BigDecimal> getDailyCollections() {
        return dailyCollections;
    }

    public void setDailyCollections(Map<String, BigDecimal> dailyCollections) {
        this.dailyCollections = dailyCollections;
    }
}
