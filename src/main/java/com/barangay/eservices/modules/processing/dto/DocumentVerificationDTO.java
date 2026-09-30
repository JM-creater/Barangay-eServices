package com.barangay.eservices.modules.processing.dto;

import java.time.LocalDateTime;

public class DocumentVerificationDTO {

    private boolean verified;
    private String issuedDocumentNumber;
    private String releaseReferenceNo;
    private String serviceName;
    private String serviceCode;
    private String recipientName;
    private LocalDateTime releaseDate;
    private String officialReceiptNumber;
    private String officialApproverName;
    private String releasingOfficerName;
    private String status;
    private String barangayName;
    private String message;

    public DocumentVerificationDTO() {
    }

    public static DocumentVerificationDTO notFound(String controlNumber) {
        DocumentVerificationDTO dto = new DocumentVerificationDTO();
        dto.setVerified(false);
        dto.setStatus("INVALID_OR_NOT_FOUND");
        dto.setMessage("No official barangay record found for document identifier: " + controlNumber);
        return dto;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public String getIssuedDocumentNumber() {
        return issuedDocumentNumber;
    }

    public void setIssuedDocumentNumber(String issuedDocumentNumber) {
        this.issuedDocumentNumber = issuedDocumentNumber;
    }

    public String getReleaseReferenceNo() {
        return releaseReferenceNo;
    }

    public void setReleaseReferenceNo(String releaseReferenceNo) {
        this.releaseReferenceNo = releaseReferenceNo;
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

    public LocalDateTime getReleaseDate() {
        return releaseDate;
    }

    public void setReleaseDate(LocalDateTime releaseDate) {
        this.releaseDate = releaseDate;
    }

    public String getOfficialReceiptNumber() {
        return officialReceiptNumber;
    }

    public void setOfficialReceiptNumber(String officialReceiptNumber) {
        this.officialReceiptNumber = officialReceiptNumber;
    }

    public String getOfficialApproverName() {
        return officialApproverName;
    }

    public void setOfficialApproverName(String officialApproverName) {
        this.officialApproverName = officialApproverName;
    }

    public String getReleasingOfficerName() {
        return releasingOfficerName;
    }

    public void setReleasingOfficerName(String releasingOfficerName) {
        this.releasingOfficerName = releasingOfficerName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getBarangayName() {
        return barangayName;
    }

    public void setBarangayName(String barangayName) {
        this.barangayName = barangayName;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
