package com.barangay.eservices.modules.requests.controller;

import com.barangay.eservices.dto.ApiResponse;
import com.barangay.eservices.dto.PaginatedResponse;
import com.barangay.eservices.modules.requests.dto.RequestResponseDTO;
import com.barangay.eservices.modules.requests.dto.StaffReviewActionDTO;
import com.barangay.eservices.modules.requests.service.DocumentRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/staff/requests")
@Tag(name = "Staff Requests", description = "Staff application review and workflow management API")
@PreAuthorize("hasAnyRole('STAFF', 'APPROVER', 'ADMIN')")
public class StaffRequestController {

    @Autowired
    private DocumentRequestService requestService;

    @GetMapping
    @Operation(summary = "List requests with filtering (status, serviceId, search) and pagination")
    public ResponseEntity<ApiResponse<PaginatedResponse<RequestResponseDTO>>> getAllRequests(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long serviceId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PaginatedResponse<RequestResponseDTO> response = requestService.getAllRequests(status, serviceId, search, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get full application detail for review")
    public ResponseEntity<ApiResponse<RequestResponseDTO>> getRequestById(@PathVariable Long id) {
        RequestResponseDTO response = requestService.getRequestById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/{id}/review")
    @Operation(summary = "Review application: ACCEPT (confirms appointment), REQUEST_CORRECTION, or REJECT (frees slot)")
    public ResponseEntity<ApiResponse<RequestResponseDTO>> reviewRequest(
            @PathVariable Long id,
            @Valid @RequestBody StaffReviewActionDTO reviewAction) {

        RequestResponseDTO response = requestService.reviewRequest(id, reviewAction);
        return ResponseEntity.ok(ApiResponse.ok("Review recorded successfully", response));
    }
}
