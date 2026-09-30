package com.barangay.eservices.modules.requests.controller;

import com.barangay.eservices.dto.ApiResponse;
import com.barangay.eservices.dto.PaginatedResponse;
import com.barangay.eservices.modules.requests.dto.CorrectionResubmitDTO;
import com.barangay.eservices.modules.requests.dto.RequestCreateDTO;
import com.barangay.eservices.modules.requests.dto.RequestResponseDTO;
import com.barangay.eservices.modules.requests.service.DocumentRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
@Tag(name = "Document Requests", description = "Resident application submission and tracking API")
public class DocumentRequestController {

    @Autowired
    private DocumentRequestService requestService;

    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    @Operation(summary = "Submit a new document application with appointment slot and file attachments")
    public ResponseEntity<ApiResponse<RequestResponseDTO>> submitRequest(
            @RequestPart("data") RequestCreateDTO requestDTO,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @RequestParam(value = "requirementIds", required = false) List<Long> requirementIds) {

        RequestResponseDTO response = requestService.submitRequest(requestDTO, files, requirementIds);
        return ResponseEntity.ok(ApiResponse.ok("Application submitted successfully", response));
    }

    @GetMapping("/my-requests")
    @Operation(summary = "Get current resident's applications")
    public ResponseEntity<ApiResponse<PaginatedResponse<RequestResponseDTO>>> getMyRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PaginatedResponse<RequestResponseDTO> response = requestService.getMyRequests(pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get application details by ID")
    public ResponseEntity<ApiResponse<RequestResponseDTO>> getRequestById(@PathVariable Long id) {
        RequestResponseDTO response = requestService.getRequestById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/track/{referenceNumber}")
    @Operation(summary = "Public tracking of application by reference number")
    public ResponseEntity<ApiResponse<RequestResponseDTO>> trackRequest(@PathVariable String referenceNumber) {
        RequestResponseDTO response = requestService.getRequestByReference(referenceNumber);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping(value = "/{id}/resubmit", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    @Operation(summary = "Resubmit application with corrected data and new attachments")
    public ResponseEntity<ApiResponse<RequestResponseDTO>> resubmitCorrections(
            @PathVariable Long id,
            @RequestPart("data") CorrectionResubmitDTO resubmitDTO,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @RequestParam(value = "requirementIds", required = false) List<Long> requirementIds) {

        RequestResponseDTO response = requestService.resubmitCorrections(id, resubmitDTO, files, requirementIds);
        return ResponseEntity.ok(ApiResponse.ok("Corrections resubmitted successfully", response));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel an application")
    public ResponseEntity<ApiResponse<RequestResponseDTO>> cancelRequest(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String reason = body.getOrDefault("reason", "Cancelled by resident");
        RequestResponseDTO response = requestService.cancelRequest(id, reason);
        return ResponseEntity.ok(ApiResponse.ok("Application cancelled successfully", response));
    }

    @PostMapping("/{id}/reschedule")
    @Operation(summary = "Reschedule application appointment to a new slot")
    public ResponseEntity<ApiResponse<RequestResponseDTO>> rescheduleRequest(
            @PathVariable Long id,
            @jakarta.validation.Valid @RequestBody com.barangay.eservices.modules.appointments.dto.RescheduleRequest request) {
        RequestResponseDTO response = requestService.rescheduleRequest(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Application appointment rescheduled successfully", response));
    }
}
