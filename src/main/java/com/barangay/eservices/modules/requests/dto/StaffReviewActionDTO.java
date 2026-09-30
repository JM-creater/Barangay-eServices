package com.barangay.eservices.modules.requests.dto;

import jakarta.validation.constraints.NotBlank;

public class StaffReviewActionDTO {

    @NotBlank(message = "Action is required (ACCEPT, REJECT, REQUEST_CORRECTION)")
    private String action;

    private String remarks;

    private String rejectionReason;

    private String correctionNotes;

    public StaffReviewActionDTO() {}

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public String getCorrectionNotes() {
        return correctionNotes;
    }

    public void setCorrectionNotes(String correctionNotes) {
        this.correctionNotes = correctionNotes;
    }
}
