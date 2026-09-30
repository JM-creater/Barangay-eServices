package com.barangay.eservices.modules.requests.entity;

import com.barangay.eservices.modules.appointments.entity.Appointment;
import com.barangay.eservices.modules.catalog.entity.ServiceItem;
import com.barangay.eservices.modules.users.entity.User;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "document_requests")
@EntityListeners(AuditingEntityListener.class)
public class DocumentRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reference_number", nullable = false, unique = true, length = 50)
    private String referenceNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "resident_id", nullable = false)
    private User resident;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceItem serviceItem;

    @Column(nullable = false)
    private String purpose;

    @Column(name = "submitted_data", columnDefinition = "JSON")
    private String submittedDataJson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_staff_id")
    private User assignedStaff;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_status", nullable = false, length = 50)
    private RequestStatus currentStatus = RequestStatus.SUBMITTED;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "correction_notes", columnDefinition = "TEXT")
    private String correctionNotes;

    @OneToOne(mappedBy = "documentRequest", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonManagedReference
    private Appointment appointment;

    @OneToMany(mappedBy = "documentRequest", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<RequestFile> files = new ArrayList<>();

    @OneToMany(mappedBy = "documentRequest", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("createdAt DESC")
    @JsonManagedReference
    private List<RequestStatusHistory> history = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public DocumentRequest() {}

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

    public User getResident() {
        return resident;
    }

    public void setResident(User resident) {
        this.resident = resident;
    }

    public ServiceItem getServiceItem() {
        return serviceItem;
    }

    public void setServiceItem(ServiceItem serviceItem) {
        this.serviceItem = serviceItem;
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

    public User getAssignedStaff() {
        return assignedStaff;
    }

    public void setAssignedStaff(User assignedStaff) {
        this.assignedStaff = assignedStaff;
    }

    public RequestStatus getCurrentStatus() {
        return currentStatus;
    }

    public void setCurrentStatus(RequestStatus currentStatus) {
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

    public Appointment getAppointment() {
        return appointment;
    }

    public void setAppointment(Appointment appointment) {
        this.appointment = appointment;
        if (appointment != null) {
            appointment.setDocumentRequest(this);
        }
    }

    public List<RequestFile> getFiles() {
        return files;
    }

    public void setFiles(List<RequestFile> files) {
        this.files = files;
    }

    public List<RequestStatusHistory> getHistory() {
        return history;
    }

    public void setHistory(List<RequestStatusHistory> history) {
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

    public void addFile(RequestFile file) {
        files.add(file);
        file.setDocumentRequest(this);
    }

    public void addHistory(RequestStatus previous, RequestStatus next, String remarks, User changedBy) {
        RequestStatusHistory historyEntry = new RequestStatusHistory(this, previous, next, remarks, changedBy);
        this.history.add(historyEntry);
    }
}
