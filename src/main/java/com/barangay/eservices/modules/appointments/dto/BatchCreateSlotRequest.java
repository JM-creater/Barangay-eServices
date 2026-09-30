package com.barangay.eservices.modules.appointments.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class BatchCreateSlotRequest {

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotNull(message = "Start times list is required")
    private List<LocalTime> startTimes;

    @Min(value = 15, message = "Duration must be at least 15 minutes")
    private Integer durationMinutes = 60;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacityPerSlot = 10;

    public BatchCreateSlotRequest() {}

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public List<LocalTime> getStartTimes() {
        return startTimes;
    }

    public void setStartTimes(List<LocalTime> startTimes) {
        this.startTimes = startTimes;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Integer getCapacityPerSlot() {
        return capacityPerSlot;
    }

    public void setCapacityPerSlot(Integer capacityPerSlot) {
        this.capacityPerSlot = capacityPerSlot;
    }
}
