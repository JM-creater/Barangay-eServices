package com.barangay.eservices.modules.processing.entity;

import com.barangay.eservices.modules.requests.entity.DocumentRequest;
import com.barangay.eservices.modules.users.entity.User;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "document_releases")
@EntityListeners(AuditingEntityListener.class)
public class DocumentRelease {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "request_id", nullable = false, unique = true)
    private DocumentRequest documentRequest;

    @Column(name = "release_reference_no", nullable = false, unique = true, length = 60)
    private String releaseReferenceNo;

    @Column(name = "issued_document_number", nullable = false, length = 60)
    private String issuedDocumentNumber;

    @Column(name = "recipient_name", nullable = false, length = 150)
    private String recipientName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "releasing_officer_id", nullable = false)
    private User releasingOfficer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "official_approver_id")
    private User officialApprover;

    @Column(name = "payment_amount", precision = 10, scale = 2)
    private BigDecimal paymentAmount = BigDecimal.ZERO;

    @Column(name = "official_receipt_number", length = 60)
    private String officialReceiptNumber;

    @Column(name = "payment_status", length = 50)
    private String paymentStatus = "PAID";

    @Column(name = "release_date")
    private LocalDateTime releaseDate = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public DocumentRelease() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public DocumentRequest getDocumentRequest() {
        return documentRequest;
    }

    public void setDocumentRequest(DocumentRequest documentRequest) {
        this.documentRequest = documentRequest;
    }

    public String getReleaseReferenceNo() {
        return releaseReferenceNo;
    }

    public void setReleaseReferenceNo(String releaseReferenceNo) {
        this.releaseReferenceNo = releaseReferenceNo;
    }

    public String getIssuedDocumentNumber() {
        return issuedDocumentNumber;
    }

    public void setIssuedDocumentNumber(String issuedDocumentNumber) {
        this.issuedDocumentNumber = issuedDocumentNumber;
    }

    public String getRecipientName() {
        return recipientName;
    }

    public void setRecipientName(String recipientName) {
        this.recipientName = recipientName;
    }

    public User getReleasingOfficer() {
        return releasingOfficer;
    }

    public void setReleasingOfficer(User releasingOfficer) {
        this.releasingOfficer = releasingOfficer;
    }

    public User getOfficialApprover() {
        return officialApprover;
    }

    public void setOfficialApprover(User officialApprover) {
        this.officialApprover = officialApprover;
    }

    public BigDecimal getPaymentAmount() {
        return paymentAmount;
    }

    public void setPaymentAmount(BigDecimal paymentAmount) {
        this.paymentAmount = paymentAmount;
    }

    public String getOfficialReceiptNumber() {
        return officialReceiptNumber;
    }

    public void setOfficialReceiptNumber(String officialReceiptNumber) {
        this.officialReceiptNumber = officialReceiptNumber;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public LocalDateTime getReleaseDate() {
        return releaseDate;
    }

    public void setReleaseDate(LocalDateTime releaseDate) {
        this.releaseDate = releaseDate;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
