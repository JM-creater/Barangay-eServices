package com.barangay.eservices.modules.requests.repository;

import com.barangay.eservices.modules.requests.entity.DocumentRequest;
import com.barangay.eservices.modules.requests.entity.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRequestRepository extends JpaRepository<DocumentRequest, Long> {

    Optional<DocumentRequest> findByReferenceNumber(String referenceNumber);

    boolean existsByReferenceNumber(String referenceNumber);

    List<DocumentRequest> findByResidentIdOrderByCreatedAtDesc(Long residentId);

    @EntityGraph(attributePaths = {"serviceItem", "appointment", "appointment.slot"})
    Page<DocumentRequest> findByResidentId(Long residentId, Pageable pageable);

    long countByCurrentStatus(RequestStatus status);

    @Query("SELECT r.currentStatus, COUNT(r) FROM DocumentRequest r GROUP BY r.currentStatus")
    List<Object[]> countRequestsGroupedByStatus();

    @EntityGraph(attributePaths = {"resident", "serviceItem", "appointment", "appointment.slot"})
    @Query(value = "SELECT r FROM DocumentRequest r WHERE " +
           "(:status IS NULL OR r.currentStatus = :status) AND " +
           "(:serviceId IS NULL OR r.serviceItem.id = :serviceId) AND " +
           "(:search IS NULL OR LOWER(r.referenceNumber) LIKE LOWER(CONCAT('%', :search, '%')) ESCAPE '\\' OR " +
           "LOWER(r.resident.firstName) LIKE LOWER(CONCAT('%', :search, '%')) ESCAPE '\\' OR " +
           "LOWER(r.resident.lastName) LIKE LOWER(CONCAT('%', :search, '%')) ESCAPE '\\') " +
           "ORDER BY r.createdAt DESC",
           countQuery = "SELECT COUNT(r) FROM DocumentRequest r WHERE " +
           "(:status IS NULL OR r.currentStatus = :status) AND " +
           "(:serviceId IS NULL OR r.serviceItem.id = :serviceId) AND " +
           "(:search IS NULL OR LOWER(r.referenceNumber) LIKE LOWER(CONCAT('%', :search, '%')) ESCAPE '\\' OR " +
           "LOWER(r.resident.firstName) LIKE LOWER(CONCAT('%', :search, '%')) ESCAPE '\\' OR " +
           "LOWER(r.resident.lastName) LIKE LOWER(CONCAT('%', :search, '%')) ESCAPE '\\')")
    Page<DocumentRequest> findFilteredRequests(@Param("status") RequestStatus status,
                                               @Param("serviceId") Long serviceId,
                                               @Param("search") String search,
                                               Pageable pageable);

    @Query("SELECT r.serviceItem.name, COUNT(r) FROM DocumentRequest r GROUP BY r.serviceItem.name")
    List<Object[]> countRequestsByService();

    @EntityGraph(attributePaths = {"serviceItem", "resident", "appointment", "assignedStaff"})
    List<DocumentRequest> findByCreatedAtBetweenOrderByCreatedAtDesc(java.time.LocalDateTime start, java.time.LocalDateTime end);

    @EntityGraph(attributePaths = {"serviceItem", "resident", "appointment", "assignedStaff"})
    List<DocumentRequest> findByCreatedAtBetweenAndCurrentStatusOrderByCreatedAtDesc(java.time.LocalDateTime start, java.time.LocalDateTime end, RequestStatus status);

    boolean existsByResidentIdAndServiceItemIdAndCurrentStatusIn(Long residentId, Long serviceItemId, Collection<RequestStatus> statuses);

    Optional<DocumentRequest> findFirstByResidentIdAndServiceItemIdAndCurrentStatusInOrderByCreatedAtDesc(Long residentId, Long serviceItemId, Collection<RequestStatus> statuses);
}
