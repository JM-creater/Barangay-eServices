package com.barangay.eservices.modules.requests.dto;

import com.barangay.eservices.modules.appointments.dto.AppointmentDTO;
import com.barangay.eservices.modules.catalog.dto.ServiceDTO;
import com.barangay.eservices.modules.users.dto.UserDTO;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class RequestResponseDTO {
    private Long id;
    private String referenceNumber;
    private UserDTO resident;
    private ServiceDTO service;
    private String purpose;
    private String submittedDataJson;
    private UserDTO assignedStaff;
    private String currentStatus;
    private String remarks;
    private String rejectionReason;
    private String correctionNotes;
    private AppointmentDTO appointment;
    private List<FileDTO> files = new ArrayList<>();
    private List<RequestStatusHistoryDTO> history = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public RequestResponseDTO() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }

    public UserDTO getResident() {
        return resident;
    }

    public void setResident(UserDTO resident) {
        this.resident = resident;
    }

    public ServiceDTO getService() {
        return service;
    }

    public void setService(ServiceDTO service) {
        this.service = service;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getSubmittedDataJson() {
        return submittedDataJson;
    }

    public void setSubmittedDataJson(String submittedDataJson) {
        this.submittedDataJson = submittedDataJson;
    }

    public UserDTO getAssignedStaff() {
        return assignedStaff;
    }

    public void setAssignedStaff(UserDTO assignedStaff) {
        this.assignedStaff = assignedStaff;
    }

    public String getCurrentStatus() {
        return currentStatus;
    }

    public void setCurrentStatus(String currentStatus) {
        this.currentStatus = currentStatus;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public String getCorrectionNotes() {
        return correctionNotes;
    }

    public void setCorrectionNotes(String correctionNotes) {
        this.correctionNotes = correctionNotes;
    }

    public AppointmentDTO getAppointment() {
        return appointment;
    }

    public void setAppointment(AppointmentDTO appointment) {
        this.appointment = appointment;
    }

    public List<FileDTO> getFiles() {
        return files;
    }

    public void setFiles(List<FileDTO> files) {
        this.files = files;
    }

    public List<RequestStatusHistoryDTO> getHistory() {
        return history;
    }

    public void setHistory(List<RequestStatusHistoryDTO> history) {
        this.history = history;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
