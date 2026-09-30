package com.barangay.eservices.modules.processing.dto;

import java.math.BigDecimal;

public class DocumentReleaseRequest {

    private BigDecimal paymentAmount;
    private String officialReceiptNumber;
    private String paymentStatus = "PAID";
    private Long officialApproverId;
    private String issuedDocumentNumber;
    private String recipientName;
    private String remarks;

    public DocumentReleaseRequest() {}

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

    public Long getOfficialApproverId() {
        return officialApproverId;
    }

    public void setOfficialApproverId(Long officialApproverId) {
        this.officialApproverId = officialApproverId;
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

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
