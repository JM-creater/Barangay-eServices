package com.barangay.eservices.modules.processing.repository;

import com.barangay.eservices.modules.processing.entity.DocumentRelease;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentReleaseRepository extends JpaRepository<DocumentRelease, Long> {

    Optional<DocumentRelease> findByDocumentRequestId(Long requestId);

    Optional<DocumentRelease> findByReleaseReferenceNo(String releaseReferenceNo);

    Optional<DocumentRelease> findByIssuedDocumentNumber(String issuedDocumentNumber);

    @EntityGraph(attributePaths = {"documentRequest", "documentRequest.serviceItem", "releasingOfficer", "officialApprover"})
    Page<DocumentRelease> findAllByOrderByReleaseDateDesc(Pageable pageable);

    @Query("SELECT COALESCE(SUM(r.paymentAmount), 0) FROM DocumentRelease r WHERE r.paymentStatus = 'PAID'")
    BigDecimal calculateTotalRevenue();

    @EntityGraph(attributePaths = {"documentRequest", "documentRequest.serviceItem", "releasingOfficer", "officialApprover"})
    List<DocumentRelease> findByReleaseDateBetweenOrderByReleaseDateDesc(java.time.LocalDateTime start, java.time.LocalDateTime end);

    @Query("SELECT COALESCE(SUM(r.paymentAmount), 0) FROM DocumentRelease r WHERE r.paymentStatus = 'PAID' AND r.releaseDate BETWEEN :start AND :end")
    BigDecimal calculateRevenueBetween(@org.springframework.data.repository.query.Param("start") java.time.LocalDateTime start, 
                                            @org.springframework.data.repository.query.Param("end") java.time.LocalDateTime end);

    @Query("SELECT r.documentRequest.serviceItem.name, COUNT(r), COALESCE(SUM(r.paymentAmount), 0) FROM DocumentRelease r WHERE r.releaseDate BETWEEN :start AND :end GROUP BY r.documentRequest.serviceItem.name")
    List<Object[]> getRevenueByServiceBetween(@org.springframework.data.repository.query.Param("start") java.time.LocalDateTime start, 
                                             @org.springframework.data.repository.query.Param("end") java.time.LocalDateTime end);
}
