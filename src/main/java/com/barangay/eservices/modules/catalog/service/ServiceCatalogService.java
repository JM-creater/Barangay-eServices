package com.barangay.eservices.modules.catalog.service;

import com.barangay.eservices.modules.catalog.dto.RequirementCreateRequest;
import com.barangay.eservices.modules.catalog.dto.ServiceCreateRequest;
import com.barangay.eservices.modules.catalog.dto.ServiceDTO;
import com.barangay.eservices.modules.catalog.dto.ServiceUpdateRequest;

import java.util.List;

public interface ServiceCatalogService {
    List<ServiceDTO> getAllActiveServices();
    List<ServiceDTO> getAllServices();
    ServiceDTO getServiceById(Long id);
    ServiceDTO getServiceByCode(String code);
    ServiceDTO createService(ServiceCreateRequest request);
    ServiceDTO updateService(Long id, ServiceUpdateRequest request);
    void deleteService(Long id);
    ServiceDTO addRequirement(Long serviceId, RequirementCreateRequest request);
    void removeRequirement(Long requirementId);
}
