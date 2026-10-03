package com.barangay.eservices.modules.processing.controller;

import com.barangay.eservices.dto.ApiResponse;
import com.barangay.eservices.dto.PaginatedResponse;
import com.barangay.eservices.modules.processing.dto.DocumentReleaseDTO;
import com.barangay.eservices.modules.processing.dto.DocumentReleaseRequest;
import com.barangay.eservices.modules.processing.dto.PhysicalVerificationDTO;
import com.barangay.eservices.modules.processing.service.DocumentProcessingService;
import com.barangay.eservices.modules.requests.dto.RequestResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import com.barangay.eservices.util.PaginationUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/staff/processing")
@Tag(name = "Document Processing & Release", description = "Stage 3 office verification, approval signature, and document release API")
@PreAuthorize("hasAnyRole('STAFF', 'APPROVER', 'ADMIN')")
public class DocumentProcessingController {

    @Autowired
    private DocumentProcessingService processingService;

    @Autowired
    private com.barangay.eservices.modules.processing.service.DocumentTemplateService documentTemplateService;

    @PostMapping("/{requestId}/verify-in-person")
    @Operation(summary = "Verify physical identity and original requirements during office visit")
    public ResponseEntity<ApiResponse<RequestResponseDTO>> verifyInPerson(
            @PathVariable Long requestId,
            @Valid @RequestBody PhysicalVerificationDTO verification) {
        RequestResponseDTO response = processingService.verifyInPersonRequirements(requestId, verification);
        return ResponseEntity.ok(ApiResponse.ok("Verification recorded successfully", response));
    }

    @PostMapping("/{requestId}/approve-sign")
    @PreAuthorize("hasAnyRole('APPROVER', 'ADMIN')")
    @Operation(summary = "Authorized official approves and signs document")
    public ResponseEntity<ApiResponse<RequestResponseDTO>> approveAndSign(
            @PathVariable Long requestId,
            @RequestBody(required = false) Map<String, Object> body) {
        Long approverId = null;
        String notes = null;
        if (body != null) {
            if (body.get("approverId") != null) {
                approverId = Long.valueOf(body.get("approverId").toString());
            }
            if (body.get("notes") != null) {
                notes = (String) body.get("notes");
            }
        }
        RequestResponseDTO response = processingService.officialApproveAndSign(requestId, approverId, notes);
        return ResponseEntity.ok(ApiResponse.ok("Document officially approved and signed", response));
    }

    @PostMapping("/{requestId}/release")
    @Operation(summary = "Issue document, record payment/OR number, and release to resident")
    public ResponseEntity<ApiResponse<DocumentReleaseDTO>> releaseDocument(
            @PathVariable Long requestId,
            @RequestBody DocumentReleaseRequest releaseRequest) {
        DocumentReleaseDTO release = processingService.releaseDocument(requestId, releaseRequest);
        return ResponseEntity.ok(ApiResponse.ok("Document released successfully", release));
    }

    @GetMapping("/{requestId}/release-info")
    @Operation(summary = "Get release details by request ID")
    public ResponseEntity<ApiResponse<DocumentReleaseDTO>> getReleaseInfo(@PathVariable Long requestId) {
        DocumentReleaseDTO release = processingService.getReleaseByRequestId(requestId);
        return ResponseEntity.ok(ApiResponse.ok(release));
    }

    @GetMapping("/releases")
    @Operation(summary = "List all released documents")
    public ResponseEntity<ApiResponse<PaginatedResponse<DocumentReleaseDTO>>> getAllReleases(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Pageable pageable = PaginationUtil.createSafePageRequest(page, size, null);
        PaginatedResponse<DocumentReleaseDTO> response = processingService.getAllReleases(pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{requestId}/document-preview")
    @Operation(summary = "Generate draft or official certificate document preview and data")
    public ResponseEntity<ApiResponse<com.barangay.eservices.modules.processing.dto.DocumentPreviewDTO>> getDocumentPreview(
            @PathVariable Long requestId) {
        com.barangay.eservices.modules.processing.dto.DocumentPreviewDTO preview = documentTemplateService.generateDocumentPreview(requestId);
        return ResponseEntity.ok(ApiResponse.ok(preview));
    }

    @GetMapping(value = "/{requestId}/document-print", produces = org.springframework.http.MediaType.TEXT_HTML_VALUE)
    @Operation(summary = "Get print-ready official HTML document for physical printing or PDF generation")
    public ResponseEntity<String> printDocument(@PathVariable Long requestId) {
        String html = documentTemplateService.generatePrintableHtml(requestId);
        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.TEXT_HTML)
                .body(html);
    }
}
