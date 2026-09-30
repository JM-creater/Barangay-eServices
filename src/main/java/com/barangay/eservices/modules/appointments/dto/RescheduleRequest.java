package com.barangay.eservices.modules.appointments.dto;

import jakarta.validation.constraints.NotNull;

public class RescheduleRequest {

    @NotNull(message = "New slot ID is required")
    private Long newSlotId;

    private String reason;

    public RescheduleRequest() {}

    public RescheduleRequest(Long newSlotId, String reason) {
        this.newSlotId = newSlotId;
        this.reason = reason;
    }

    public Long getNewSlotId() {
        return newSlotId;
    }

    public void setNewSlotId(Long newSlotId) {
        this.newSlotId = newSlotId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
