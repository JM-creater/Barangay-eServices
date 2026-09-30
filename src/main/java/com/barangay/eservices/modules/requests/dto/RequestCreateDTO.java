package com.barangay.eservices.modules.requests.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class RequestCreateDTO {

    @NotNull(message = "Service ID is required")
    private Long serviceId;

    @NotBlank(message = "Purpose is required")
    private String purpose;

    @NotNull(message = "Appointment slot ID is required")
    private Long slotId;

    private String submittedDataJson;

    public RequestCreateDTO() {}

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public Long getSlotId() {
        return slotId;
    }

    public void setSlotId(Long slotId) {
        this.slotId = slotId;
    }

    public String getSubmittedDataJson() {
        return submittedDataJson;
    }

    public void setSubmittedDataJson(String submittedDataJson) {
        this.submittedDataJson = submittedDataJson;
    }
}
