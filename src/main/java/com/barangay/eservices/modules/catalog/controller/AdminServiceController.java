package com.barangay.eservices.modules.catalog.controller;

import com.barangay.eservices.dto.ApiResponse;
import com.barangay.eservices.modules.catalog.dto.RequirementCreateRequest;
import com.barangay.eservices.modules.catalog.dto.ServiceCreateRequest;
import com.barangay.eservices.modules.catalog.dto.ServiceDTO;
import com.barangay.eservices.modules.catalog.dto.ServiceUpdateRequest;
import com.barangay.eservices.modules.catalog.service.ServiceCatalogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/services")
@Tag(name = "Admin Services", description = "Service catalog administration for Admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminServiceController {

    @Autowired
    private ServiceCatalogService serviceCatalogService;

    @GetMapping
    @Operation(summary = "Get all services including inactive")
    public ResponseEntity<ApiResponse<List<ServiceDTO>>> getAllServices() {
        List<ServiceDTO> services = serviceCatalogService.getAllServices();
        return ResponseEntity.ok(ApiResponse.ok(services));
    }

    @PostMapping
    @Operation(summary = "Create a new barangay service")
    public ResponseEntity<ApiResponse<ServiceDTO>> createService(@Valid @RequestBody ServiceCreateRequest request) {
        ServiceDTO created = serviceCatalogService.createService(request);
        return ResponseEntity.ok(ApiResponse.ok("Service created successfully", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing service")
    public ResponseEntity<ApiResponse<ServiceDTO>> updateService(
            @PathVariable Long id,
            @Valid @RequestBody ServiceUpdateRequest request) {
        ServiceDTO updated = serviceCatalogService.updateService(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Service updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deactivate a service")
    public ResponseEntity<ApiResponse<Void>> deleteService(@PathVariable Long id) {
        serviceCatalogService.deleteService(id);
        return ResponseEntity.ok(ApiResponse.ok("Service deactivated successfully", null));
    }

    @PostMapping("/{id}/requirements")
    @Operation(summary = "Add a requirement to a service")
    public ResponseEntity<ApiResponse<ServiceDTO>> addRequirement(
            @PathVariable Long id,
            @Valid @RequestBody RequirementCreateRequest request) {
        ServiceDTO updated = serviceCatalogService.addRequirement(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Requirement added successfully", updated));
    }

    @DeleteMapping("/requirements/{reqId}")
    @Operation(summary = "Remove a requirement")
    public ResponseEntity<ApiResponse<Void>> removeRequirement(@PathVariable Long reqId) {
        serviceCatalogService.removeRequirement(reqId);
        return ResponseEntity.ok(ApiResponse.ok("Requirement removed successfully", null));
    }
}
