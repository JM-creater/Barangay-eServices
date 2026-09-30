package com.barangay.eservices.modules.catalog.dto;

public class RequirementDTO {
    private Long id;
    private String requirementName;
    private String description;
    private Boolean isMandatory;

    public RequirementDTO() {}

    public RequirementDTO(Long id, String requirementName, String description, Boolean isMandatory) {
        this.id = id;
        this.requirementName = requirementName;
        this.description = description;
        this.isMandatory = isMandatory;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
