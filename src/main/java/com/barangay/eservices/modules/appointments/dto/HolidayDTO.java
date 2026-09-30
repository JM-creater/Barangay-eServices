package com.barangay.eservices.modules.appointments.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class HolidayDTO {

    private Long id;
    private LocalDate holidayDate;
    private String name;
    private String type;
    private String description;
    private LocalDateTime createdAt;

    public HolidayDTO() {
    }

    public HolidayDTO(Long id, LocalDate holidayDate, String name, String type, String description, LocalDateTime createdAt) {
        this.id = id;
        this.holidayDate = holidayDate;
        this.name = name;
        this.type = type;
        this.description = description;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
