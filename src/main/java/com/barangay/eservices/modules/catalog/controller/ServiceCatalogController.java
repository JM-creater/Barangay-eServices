package com.barangay.eservices.modules.catalog.controller;

import com.barangay.eservices.dto.ApiResponse;
import com.barangay.eservices.modules.catalog.dto.ServiceDTO;
import com.barangay.eservices.modules.catalog.service.ServiceCatalogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@Tag(name = "Services Catalog", description = "Public / Resident service catalog and document requirements")
public class ServiceCatalogController {

    @Autowired
    private ServiceCatalogService serviceCatalogService;

    @GetMapping
    @Operation(summary = "Get all active services with requirements")
    public ResponseEntity<ApiResponse<List<ServiceDTO>>> getActiveServices() {
        List<ServiceDTO> services = serviceCatalogService.getAllActiveServices();
        return ResponseEntity.ok(ApiResponse.ok(services));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get service by ID")
    public ResponseEntity<ApiResponse<ServiceDTO>> getServiceById(@PathVariable Long id) {
        ServiceDTO service = serviceCatalogService.getServiceById(id);
        return ResponseEntity.ok(ApiResponse.ok(service));
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Get service by service code")
    public ResponseEntity<ApiResponse<ServiceDTO>> getServiceByCode(@PathVariable String code) {
        ServiceDTO service = serviceCatalogService.getServiceByCode(code);
        return ResponseEntity.ok(ApiResponse.ok(service));
    }
}
