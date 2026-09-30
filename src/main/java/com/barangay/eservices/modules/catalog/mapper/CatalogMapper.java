package com.barangay.eservices.modules.catalog.mapper;

import com.barangay.eservices.modules.catalog.dto.RequirementDTO;
import com.barangay.eservices.modules.catalog.dto.ServiceDTO;
import com.barangay.eservices.modules.catalog.entity.ServiceItem;
import com.barangay.eservices.modules.catalog.entity.ServiceRequirement;

import java.util.stream.Collectors;

public class CatalogMapper {

    public static RequirementDTO toDTO(ServiceRequirement req) {
        if (req == null) return null;
        return new RequirementDTO(
                req.getId(),
                req.getRequirementName(),
                req.getDescription(),
                req.getIsMandatory()
        );
    }

    public static ServiceDTO toDTO(ServiceItem service) {
        if (service == null) return null;
        ServiceDTO dto = new ServiceDTO();
        dto.setId(service.getId());
        dto.setServiceCode(service.getServiceCode());
        dto.setName(service.getName());
        dto.setDescription(service.getDescription());
        dto.setFee(service.getFee());
        dto.setEstimatedProcessingDays(service.getEstimatedProcessingDays());
        dto.setInstructions(service.getInstructions());
        dto.setIsActive(service.getIsActive());

        if (service.getRequirements() != null) {
            dto.setRequirements(service.getRequirements().stream()
                    .map(CatalogMapper::toDTO)
                    .collect(Collectors.toList()));
        }

        return dto;
    }
}
