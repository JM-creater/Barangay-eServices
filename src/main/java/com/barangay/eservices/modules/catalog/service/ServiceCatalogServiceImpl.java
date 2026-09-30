package com.barangay.eservices.modules.catalog.service;

import com.barangay.eservices.exception.BadRequestException;
import com.barangay.eservices.exception.ResourceNotFoundException;
import com.barangay.eservices.modules.audit.service.AuditLogService;
import com.barangay.eservices.modules.catalog.dto.RequirementCreateRequest;
import com.barangay.eservices.modules.catalog.dto.ServiceCreateRequest;
import com.barangay.eservices.modules.catalog.dto.ServiceDTO;
import com.barangay.eservices.modules.catalog.dto.ServiceUpdateRequest;
import com.barangay.eservices.modules.catalog.entity.ServiceItem;
import com.barangay.eservices.modules.catalog.entity.ServiceRequirement;
import com.barangay.eservices.modules.catalog.mapper.CatalogMapper;
import com.barangay.eservices.modules.catalog.repository.ServiceItemRepository;
import com.barangay.eservices.modules.catalog.repository.ServiceRequirementRepository;
import com.barangay.eservices.modules.users.entity.User;
import com.barangay.eservices.modules.users.repository.UserRepository;
import com.barangay.eservices.security.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ServiceCatalogServiceImpl implements ServiceCatalogService {

    @Autowired
    private ServiceItemRepository serviceItemRepository;
    @Autowired
    private ServiceRequirementRepository requirementRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public List<ServiceDTO> getAllActiveServices() {
        return serviceItemRepository.findByIsActiveTrue().stream()
                .map(CatalogMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceDTO> getAllServices() {
        return serviceItemRepository.findAll().stream()
                .map(CatalogMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceDTO getServiceById(Long id) {
        ServiceItem item = serviceItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));
        return CatalogMapper.toDTO(item);
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceDTO getServiceByCode(String code) {
        ServiceItem item = serviceItemRepository.findByServiceCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "code", code));
        return CatalogMapper.toDTO(item);
    }

    @Override
    @Transactional
    public ServiceDTO createService(ServiceCreateRequest request) {
        if (serviceItemRepository.existsByServiceCode(request.getServiceCode())) {
            throw new BadRequestException("Service code already exists: " + request.getServiceCode());
        }

        ServiceItem serviceItem = new ServiceItem();
        serviceItem.setServiceCode(request.getServiceCode().toUpperCase().trim());
        serviceItem.setName(request.getName());
        serviceItem.setDescription(request.getDescription());
        serviceItem.setFee(request.getFee());
        serviceItem.setEstimatedProcessingDays(request.getEstimatedProcessingDays() != null ? request.getEstimatedProcessingDays() : 1);
        serviceItem.setInstructions(request.getInstructions());
        serviceItem.setIsActive(true);

        if (request.getRequirements() != null) {
            for (RequirementCreateRequest req : request.getRequirements()) {
                ServiceRequirement sr = new ServiceRequirement(
                        req.getRequirementName(),
                        req.getDescription(),
                        req.getIsMandatory()
                );
                serviceItem.addRequirement(sr);
            }
        }

        ServiceItem saved = serviceItemRepository.save(serviceItem);

        User currentUser = SecurityUtil.getCurrentUserId() != null 
                ? userRepository.findById(SecurityUtil.getCurrentUserId()).orElse(null) : null;
        auditLogService.logAction(currentUser, "SERVICE_CREATED", "ServiceItem", saved.getId().toString(),
                "Created service: " + saved.getName());

        return CatalogMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public ServiceDTO updateService(Long id, ServiceUpdateRequest request) {
        ServiceItem serviceItem = serviceItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));

        serviceItem.setName(request.getName());
        serviceItem.setDescription(request.getDescription());
        serviceItem.setFee(request.getFee());
        if (request.getEstimatedProcessingDays() != null) {
            serviceItem.setEstimatedProcessingDays(request.getEstimatedProcessingDays());
        }
        serviceItem.setInstructions(request.getInstructions());
        if (request.getIsActive() != null) {
            serviceItem.setIsActive(request.getIsActive());
        }

        ServiceItem updated = serviceItemRepository.save(serviceItem);

        User currentUser = SecurityUtil.getCurrentUserId() != null 
                ? userRepository.findById(SecurityUtil.getCurrentUserId()).orElse(null) : null;
        auditLogService.logAction(currentUser, "SERVICE_UPDATED", "ServiceItem", updated.getId().toString(),
                "Updated service: " + updated.getName());

        return CatalogMapper.toDTO(updated);
    }

    @Override
    @Transactional
    public void deleteService(Long id) {
        ServiceItem serviceItem = serviceItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));
        serviceItem.setIsActive(false);
        serviceItemRepository.save(serviceItem);

        User currentUser = SecurityUtil.getCurrentUserId() != null 
                ? userRepository.findById(SecurityUtil.getCurrentUserId()).orElse(null) : null;
        auditLogService.logAction(currentUser, "SERVICE_DEACTIVATED", "ServiceItem", id.toString(),
                "Deactivated service: " + serviceItem.getName());
    }

    @Override
    @Transactional
    public ServiceDTO addRequirement(Long serviceId, RequirementCreateRequest request) {
        ServiceItem serviceItem = serviceItemRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", serviceId));

        ServiceRequirement sr = new ServiceRequirement(
                request.getRequirementName(),
                request.getDescription(),
                request.getIsMandatory()
        );
        serviceItem.addRequirement(sr);
        ServiceItem updated = serviceItemRepository.save(serviceItem);

        return CatalogMapper.toDTO(updated);
    }

    @Override
    @Transactional
    public void removeRequirement(Long requirementId) {
        ServiceRequirement req = requirementRepository.findById(requirementId)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceRequirement", "id", requirementId));
        requirementRepository.delete(req);
    }
}
