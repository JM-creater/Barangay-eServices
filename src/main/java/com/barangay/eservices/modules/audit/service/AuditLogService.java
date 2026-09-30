package com.barangay.eservices.modules.audit.service;

import com.barangay.eservices.dto.PaginatedResponse;
import com.barangay.eservices.modules.audit.dto.AuditLogDTO;
import com.barangay.eservices.modules.users.entity.User;
import org.springframework.data.domain.Pageable;

public interface AuditLogService {
    void logAction(User user, String action, String entityName, String entityId, String details);
    void logAction(User user, String action, String entityName, String entityId, String details, String ipAddress);
    PaginatedResponse<AuditLogDTO> getAuditLogs(String entityName, String action, Pageable pageable);
}
