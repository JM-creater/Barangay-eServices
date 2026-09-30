package com.barangay.eservices.modules.catalog.repository;

import com.barangay.eservices.modules.catalog.entity.ServiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceItemRepository extends JpaRepository<ServiceItem, Long> {
    Optional<ServiceItem> findByServiceCode(String serviceCode);
    List<ServiceItem> findByIsActiveTrue();
    boolean existsByServiceCode(String serviceCode);
}
