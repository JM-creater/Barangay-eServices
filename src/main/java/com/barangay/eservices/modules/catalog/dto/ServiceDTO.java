package com.barangay.eservices.modules.catalog.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ServiceDTO {
    private Long id;
    private String serviceCode;
    private String name;
    private String description;
    private BigDecimal fee;
    private Integer estimatedProcessingDays;
    private String instructions;
    private Boolean isActive;
    private List<RequirementDTO> requirements = new ArrayList<>();

    public ServiceDTO() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getServiceCode() {
        return serviceCode;
    }

    public void setServiceCode(String serviceCode) {
        this.serviceCode = serviceCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getFee() {
        return fee;
    }

    public void setFee(BigDecimal fee) {
        this.fee = fee;
    }

    public Integer getEstimatedProcessingDays() {
        return estimatedProcessingDays;
    }

    public void setEstimatedProcessingDays(Integer estimatedProcessingDays) {
        this.estimatedProcessingDays = estimatedProcessingDays;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public List<RequirementDTO> getRequirements() {
        return requirements;
    }

    public void setRequirements(List<RequirementDTO> requirements) {
        this.requirements = requirements;
    }
}
