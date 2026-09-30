package com.barangay.eservices.modules.processing.dto;

import jakarta.validation.constraints.NotNull;

public class PhysicalVerificationDTO {

    @NotNull(message = "requirementsSatisfied flag is required")
    private Boolean requirementsSatisfied;

    private String notes;

    public PhysicalVerificationDTO() {}

    public PhysicalVerificationDTO(Boolean requirementsSatisfied, String notes) {
        this.requirementsSatisfied = requirementsSatisfied;
        this.notes = notes;
    }

    public Boolean getRequirementsSatisfied() {
        return requirementsSatisfied;
    }

    public void setRequirementsSatisfied(Boolean requirementsSatisfied) {
        this.requirementsSatisfied = requirementsSatisfied;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
