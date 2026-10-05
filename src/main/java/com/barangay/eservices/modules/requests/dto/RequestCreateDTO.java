package com.barangay.eservices.modules.requests.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

@Schema(description = "Payload for submitting a new document request application")
public class RequestCreateDTO {

    @NotNull(message = "Service ID is required")
    @Positive(message = "Service ID must be a valid positive integer")
    @Schema(description = "ID of the barangay document service being applied for", example = "1")
    private Long serviceId;

    @NotBlank(message = "Purpose of request is required")
    @Size(min = 5, max = 500, message = "Purpose of request must be between 5 and 500 characters")
    @Schema(description = "Specific reason/purpose for requesting the document", example = "Local Employment Application")
    private String purpose;

    @NotNull(message = "Appointment slot ID is required")
    @Positive(message = "Appointment slot ID must be a valid positive integer")
    @Schema(description = "ID of the selected appointment schedule slot", example = "42")
    private Long slotId;

    @Schema(description = "Optional JSON payload containing structured applicant profile details", example = "{\"additionalNotes\":\"Urgent release requested\"}")
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
