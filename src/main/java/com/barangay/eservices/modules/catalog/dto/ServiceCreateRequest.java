package com.barangay.eservices.modules.catalog.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ServiceCreateRequest {

    @NotBlank(message = "Service code is required")
    private String serviceCode;

    @NotBlank(message = "Service name is required")
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Fee is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Fee cannot be negative")
    private BigDecimal fee;

    private Integer estimatedProcessingDays = 1;

    private String instructions;

    private List<RequirementCreateRequest> requirements = new ArrayList<>();

    public ServiceCreateRequest() {}

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

    public List<RequirementCreateRequest> getRequirements() {
        return requirements;
    }

    public void setRequirements(List<RequirementCreateRequest> requirements) {
        this.requirements = requirements;
    }
}
