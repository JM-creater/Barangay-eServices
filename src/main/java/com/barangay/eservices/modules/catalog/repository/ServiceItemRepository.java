package com.barangay.eservices.modules.catalog.repository;

import com.barangay.eservices.modules.catalog.entity.ServiceItem;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceItemRepository extends JpaRepository<ServiceItem, Long> {
    @EntityGraph(attributePaths = {"requirements"})
    Optional<ServiceItem> findByServiceCode(String serviceCode);

    @EntityGraph(attributePaths = {"requirements"})
    List<ServiceItem> findByIsActiveTrue();

    @Override
    @EntityGraph(attributePaths = {"requirements"})
    List<ServiceItem> findAll();

    boolean existsByServiceCode(String serviceCode);
}
