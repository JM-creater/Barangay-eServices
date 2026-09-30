package com.barangay.eservices.modules.appointments.dto;

import jakarta.validation.constraints.NotBlank;

public class AppointmentStatusUpdateRequest {

    @NotBlank(message = "Status is required (CONFIRMED, ATTENDED, CANCELLED, NO_SHOW)")
    private String status;

    private String notes;

    public AppointmentStatusUpdateRequest() {}

    public AppointmentStatusUpdateRequest(String status, String notes) {
        this.status = status;
        this.notes = notes;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
