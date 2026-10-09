package com.barangay.eservices.modules.requests.repository;

import com.barangay.eservices.modules.requests.entity.RequestFile;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RequestFileRepository extends JpaRepository<RequestFile, Long> {
    List<RequestFile> findByDocumentRequestId(Long requestId);

    @EntityGraph(attributePaths = {"documentRequest", "documentRequest.resident"})
    Optional<RequestFile> findByStoredFileName(String storedFileName);
}
