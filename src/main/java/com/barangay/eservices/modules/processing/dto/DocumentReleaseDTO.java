package com.barangay.eservices.modules.processing.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class DocumentReleaseDTO {
    private Long id;
    private Long requestId;
    private String referenceNumber;
    private String serviceName;
    private String releaseReferenceNo;
    private String issuedDocumentNumber;
    private String recipientName;
    private String releasingOfficerName;
    private String officialApproverName;
    private BigDecimal paymentAmount;
    private String officialReceiptNumber;
    private String paymentStatus;
    private LocalDateTime releaseDate;
    private String remarks;

    public DocumentReleaseDTO() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public String getReleaseReferenceNo() {
        return releaseReferenceNo;
    }

    public void setReleaseReferenceNo(String releaseReferenceNo) {
        this.releaseReferenceNo = releaseReferenceNo;
    }

    public String getIssuedDocumentNumber() {
        return issuedDocumentNumber;
    }

    public void setIssuedDocumentNumber(String issuedDocumentNumber) {
        this.issuedDocumentNumber = issuedDocumentNumber;
    }

    public String getRecipientName() {
        return recipientName;
    }

    public void setRecipientName(String recipientName) {
        this.recipientName = recipientName;
    }

    public String getReleasingOfficerName() {
        return releasingOfficerName;
    }

    public void setReleasingOfficerName(String releasingOfficerName) {
        this.releasingOfficerName = releasingOfficerName;
    }

    public String getOfficialApproverName() {
        return officialApproverName;
    }

    public void setOfficialApproverName(String officialApproverName) {
        this.officialApproverName = officialApproverName;
    }

    public BigDecimal getPaymentAmount() {
        return paymentAmount;
    }

    public void setPaymentAmount(BigDecimal paymentAmount) {
        this.paymentAmount = paymentAmount;
    }

    public String getOfficialReceiptNumber() {
        return officialReceiptNumber;
    }

    public void setOfficialReceiptNumber(String officialReceiptNumber) {
        this.officialReceiptNumber = officialReceiptNumber;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public LocalDateTime getReleaseDate() {
        return releaseDate;
    }

    public void setReleaseDate(LocalDateTime releaseDate) {
        this.releaseDate = releaseDate;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
