package com.barangay.eservices.modules.audit.controller;

import com.barangay.eservices.dto.ApiResponse;
import com.barangay.eservices.dto.PaginatedResponse;
import com.barangay.eservices.modules.audit.dto.AuditLogDTO;
import com.barangay.eservices.modules.audit.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/audit-logs")
@Tag(name = "Audit Logs", description = "Audit log administration API")
@PreAuthorize("hasRole('ADMIN')")
public class AuditLogController {

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping
    @Operation(summary = "Get audit logs with pagination and filters")
    public ResponseEntity<ApiResponse<PaginatedResponse<AuditLogDTO>>> getAuditLogs(
            @RequestParam(required = false) String entityName,
            @RequestParam(required = false) String action,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PaginatedResponse<AuditLogDTO> response = auditLogService.getAuditLogs(entityName, action, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
