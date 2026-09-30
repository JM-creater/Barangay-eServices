package com.barangay.eservices.modules.appointments.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class CreateHolidayRequest {

    @NotNull(message = "Holiday date is required")
    private LocalDate holidayDate;

    @NotBlank(message = "Holiday name is required")
    private String name;

    private String type; // e.g. REGULAR, SPECIAL_NON_WORKING, LOCAL_EVENT

    private String description;

    public CreateHolidayRequest() {
    }

    public CreateHolidayRequest(LocalDate holidayDate, String name, String type, String description) {
        this.holidayDate = holidayDate;
        this.name = name;
        this.type = type;
        this.description = description;
    }

    public LocalDate getHolidayDate() {
        return holidayDate;
    }

    public void setHolidayDate(LocalDate holidayDate) {
        this.holidayDate = holidayDate;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
