package com.barangay.eservices.modules.processing.controller;

import com.barangay.eservices.dto.ApiResponse;
import com.barangay.eservices.modules.processing.dto.DocumentVerificationDTO;
import com.barangay.eservices.modules.processing.entity.DocumentRelease;
import com.barangay.eservices.modules.processing.repository.DocumentReleaseRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/public")
@Tag(name = "Public Document Verification", description = "Anti-fraud public QR and certificate verification API")
public class PublicDocumentVerificationController {

    @Autowired
    private DocumentReleaseRepository releaseRepository;

    @GetMapping("/verify-document/{controlNumber}")
    @Operation(summary = "Public verification of official barangay certificate or clearance by control number or release reference")
    public ResponseEntity<ApiResponse<DocumentVerificationDTO>> verifyDocument(@PathVariable String controlNumber) {
        if (controlNumber == null || controlNumber.trim().isEmpty() || controlNumber.trim().length() > 60) {
            return ResponseEntity.ok(ApiResponse.ok("Verification lookup completed", 
                    DocumentVerificationDTO.notFound(controlNumber != null ? controlNumber.trim() : "")));
        }

        String query = controlNumber.trim();

        // 1. Search by issuedDocumentNumber
        Optional<DocumentRelease> releaseOpt = releaseRepository.findByIssuedDocumentNumber(query);

        // 2. If not found, search by releaseReferenceNo
        if (releaseOpt.isEmpty()) {
            releaseOpt = releaseRepository.findByReleaseReferenceNo(query);
        }

        if (releaseOpt.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.ok("Verification lookup completed", DocumentVerificationDTO.notFound(query)));
        }

        DocumentRelease release = releaseOpt.get();
        DocumentVerificationDTO dto = new DocumentVerificationDTO();
        dto.setVerified(true);
        dto.setIssuedDocumentNumber(release.getIssuedDocumentNumber());
        dto.setReleaseReferenceNo(release.getReleaseReferenceNo());
        dto.setServiceName(release.getDocumentRequest().getServiceItem().getName());
        dto.setServiceCode(release.getDocumentRequest().getServiceItem().getServiceCode());
        dto.setRecipientName(release.getRecipientName());
        dto.setReleaseDate(release.getReleaseDate());
        dto.setOfficialReceiptNumber(release.getOfficialReceiptNumber());
        dto.setOfficialApproverName(release.getOfficialApprover() != null ? release.getOfficialApprover().getFullName() : "Punong Barangay");
        dto.setReleasingOfficerName(release.getReleasingOfficer() != null ? release.getReleasingOfficer().getFullName() : "Barangay Staff");
        dto.setStatus("OFFICIALLY ISSUED & VALID");
        dto.setBarangayName("Barangay Cansojong, Talisay City, Cebu");
        dto.setMessage("This document is authentic, genuine, and recorded in the official Barangay e-Services registry.");

        return ResponseEntity.ok(ApiResponse.ok("Document verified successfully", dto));
    }
}
