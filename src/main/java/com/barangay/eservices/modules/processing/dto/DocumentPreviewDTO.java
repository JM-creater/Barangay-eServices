package com.barangay.eservices.modules.processing.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class DocumentPreviewDTO {

    private Long requestId;
    private String referenceNumber;
    private String serviceName;
    private String serviceCode;
    private String recipientName;
    private String address;
    private String purpose;
    private String issuedDocumentNumber;
    private String officialReceiptNumber;
    private BigDecimal paymentAmount;
    private LocalDate issueDate;
    private LocalDate validUntil;
    private String officialApproverName;
    private String officialApproverTitle;
    private String currentStatus;
    private String verificationUrl;
    private String qrCodeData;
    private String renderedHtml;

    public DocumentPreviewDTO() {
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

    public String getServiceCode() {
        return serviceCode;
    }

    public void setServiceCode(String serviceCode) {
        this.serviceCode = serviceCode;
    }

    public String getRecipientName() {
        return recipientName;
    }

    public void setRecipientName(String recipientName) {
        this.recipientName = recipientName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getIssuedDocumentNumber() {
        return issuedDocumentNumber;
    }

    public void setIssuedDocumentNumber(String issuedDocumentNumber) {
        this.issuedDocumentNumber = issuedDocumentNumber;
    }

    public String getOfficialReceiptNumber() {
        return officialReceiptNumber;
    }

    public void setOfficialReceiptNumber(String officialReceiptNumber) {
        this.officialReceiptNumber = officialReceiptNumber;
    }

    public BigDecimal getPaymentAmount() {
        return paymentAmount;
    }

    public void setPaymentAmount(BigDecimal paymentAmount) {
        this.paymentAmount = paymentAmount;
    }

    public LocalDate getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDate issueDate) {
        this.issueDate = issueDate;
    }

    public LocalDate getValidUntil() {
        return validUntil;
    }

    public void setValidUntil(LocalDate validUntil) {
        this.validUntil = validUntil;
    }

    public String getOfficialApproverName() {
        return officialApproverName;
    }

    public void setOfficialApproverName(String officialApproverName) {
        this.officialApproverName = officialApproverName;
    }

    public String getOfficialApproverTitle() {
        return officialApproverTitle;
    }

    public void setOfficialApproverTitle(String officialApproverTitle) {
        this.officialApproverTitle = officialApproverTitle;
    }

    public String getCurrentStatus() {
        return currentStatus;
    }

    public void setCurrentStatus(String currentStatus) {
        this.currentStatus = currentStatus;
    }

    public String getVerificationUrl() {
        return verificationUrl;
    }

    public void setVerificationUrl(String verificationUrl) {
        this.verificationUrl = verificationUrl;
    }

    public String getQrCodeData() {
        return qrCodeData;
    }

    public void setQrCodeData(String qrCodeData) {
        this.qrCodeData = qrCodeData;
    }

    public String getRenderedHtml() {
        return renderedHtml;
    }

    public void setRenderedHtml(String renderedHtml) {
        this.renderedHtml = renderedHtml;
    }
}
