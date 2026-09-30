package com.barangay.eservices.modules.requests.dto;

public class CorrectionResubmitDTO {
    private String purpose;
    private String submittedDataJson;
    private String remarks;

    public CorrectionResubmitDTO() {}

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getSubmittedDataJson() {
        return submittedDataJson;
    }

    public void setSubmittedDataJson(String submittedDataJson) {
        this.submittedDataJson = submittedDataJson;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
