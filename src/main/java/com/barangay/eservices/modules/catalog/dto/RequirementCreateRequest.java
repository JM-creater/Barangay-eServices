package com.barangay.eservices.modules.catalog.dto;

import jakarta.validation.constraints.NotBlank;

public class RequirementCreateRequest {

    @NotBlank(message = "Requirement name is required")
    private String requirementName;

    private String description;

    private Boolean isMandatory = true;

    public RequirementCreateRequest() {}

    public RequirementCreateRequest(String requirementName, String description, Boolean isMandatory) {
        this.requirementName = requirementName;
        this.description = description;
        this.isMandatory = isMandatory != null ? isMandatory : true;
    }

    public String getRequirementName() {
        return requirementName;
    }

    public void setRequirementName(String requirementName) {
        this.requirementName = requirementName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsMandatory() {
        return isMandatory;
    }

    public void setIsMandatory(Boolean isMandatory) {
        this.isMandatory = isMandatory;
    }
}
