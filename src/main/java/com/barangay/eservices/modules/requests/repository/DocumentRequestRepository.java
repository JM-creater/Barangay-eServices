package com.barangay.eservices.modules.requests.repository;

import com.barangay.eservices.modules.requests.entity.DocumentRequest;
import com.barangay.eservices.modules.requests.entity.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRequestRepository extends JpaRepository<DocumentRequest, Long> {

    Optional<DocumentRequest> findByReferenceNumber(String referenceNumber);

    boolean existsByReferenceNumber(String referenceNumber);

    List<DocumentRequest> findByResidentIdOrderByCreatedAtDesc(Long residentId);

    Page<DocumentRequest> findByResidentId(Long residentId, Pageable pageable);

    long countByCurrentStatus(RequestStatus status);

    @Query("SELECT r FROM DocumentRequest r WHERE " +
           "(:status IS NULL OR r.currentStatus = :status) AND " +
           "(:serviceId IS NULL OR r.serviceItem.id = :serviceId) AND " +
           "(:search IS NULL OR LOWER(r.referenceNumber) LIKE LOWER(CONCAT('%', :search, '%')) ESCAPE '\\' OR " +
           "LOWER(r.resident.firstName) LIKE LOWER(CONCAT('%', :search, '%')) ESCAPE '\\' OR " +
           "LOWER(r.resident.lastName) LIKE LOWER(CONCAT('%', :search, '%')) ESCAPE '\\') " +
           "ORDER BY r.createdAt DESC")
    Page<DocumentRequest> findFilteredRequests(@Param("status") RequestStatus status,
                                               @Param("serviceId") Long serviceId,
                                               @Param("search") String search,
                                               Pageable pageable);

    @Query("SELECT r.serviceItem.name, COUNT(r) FROM DocumentRequest r GROUP BY r.serviceItem.name")
    List<Object[]> countRequestsByService();

    List<DocumentRequest> findByCreatedAtBetweenOrderByCreatedAtDesc(java.time.LocalDateTime start, java.time.LocalDateTime end);

    List<DocumentRequest> findByCreatedAtBetweenAndCurrentStatusOrderByCreatedAtDesc(java.time.LocalDateTime start, java.time.LocalDateTime end, RequestStatus status);
}
