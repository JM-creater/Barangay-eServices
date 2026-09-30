package com.barangay.eservices.modules.catalog.repository;

import com.barangay.eservices.modules.catalog.entity.ServiceRequirement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRequirementRepository extends JpaRepository<ServiceRequirement, Long> {
    List<ServiceRequirement> findByServiceItemId(Long serviceId);
}
