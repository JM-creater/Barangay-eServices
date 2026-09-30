package com.barangay.eservices.modules.requests.repository;

import com.barangay.eservices.modules.requests.entity.RequestStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequestStatusHistoryRepository extends JpaRepository<RequestStatusHistory, Long> {
    List<RequestStatusHistory> findByDocumentRequestIdOrderByCreatedAtDesc(Long requestId);
}
