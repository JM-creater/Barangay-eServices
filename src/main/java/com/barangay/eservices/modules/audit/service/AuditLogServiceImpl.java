package com.barangay.eservices.modules.audit.service;

import com.barangay.eservices.dto.PaginatedResponse;
import com.barangay.eservices.modules.audit.dto.AuditLogDTO;
import com.barangay.eservices.modules.audit.entity.AuditLog;
import com.barangay.eservices.modules.audit.mapper.AuditMapper;
import com.barangay.eservices.modules.audit.repository.AuditLogRepository;
import com.barangay.eservices.modules.users.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditLogServiceImpl implements AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Override
    @Transactional
    public void logAction(User user, String action, String entityName, String entityId, String details) {
        logAction(user, action, entityName, entityId, details, null);
    }

    @Override
    @Transactional
    public void logAction(User user, String action, String entityName, String entityId, String details, String ipAddress) {
        AuditLog auditLog = new AuditLog(user, action, entityName, entityId, details, ipAddress);
        auditLogRepository.save(auditLog);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<AuditLogDTO> getAuditLogs(String entityName, String action, Pageable pageable) {
        Page<AuditLog> page = auditLogRepository.findFilteredAuditLogs(entityName, action, pageable);
        List<AuditLogDTO> dtoList = page.getContent().stream()
                .map(AuditMapper::toDTO)
                .collect(Collectors.toList());

        return new PaginatedResponse<>(
                dtoList,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }
}
