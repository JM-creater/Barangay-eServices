package com.barangay.eservices.modules.audit.mapper;

import com.barangay.eservices.modules.audit.dto.AuditLogDTO;
import com.barangay.eservices.modules.audit.entity.AuditLog;

public class AuditMapper {

    public static AuditLogDTO toDTO(AuditLog log) {
        if (log == null) return null;
        AuditLogDTO dto = new AuditLogDTO();
        dto.setId(log.getId());
        if (log.getUser() != null) {
            dto.setUserId(log.getUser().getId());
            dto.setUsername(log.getUser().getUsername());
            dto.setUserFullName(log.getUser().getFullName());
        }
        dto.setAction(log.getAction());
        dto.setEntityName(log.getEntityName());
        dto.setEntityId(log.getEntityId());
        dto.setDetails(log.getDetails());
        dto.setIpAddress(log.getIpAddress());
        dto.setCreatedAt(log.getCreatedAt());
        return dto;
    }
}
