package com.barangay.eservices.modules.processing.service;

import com.barangay.eservices.dto.PaginatedResponse;
import com.barangay.eservices.modules.processing.dto.DocumentReleaseDTO;
import com.barangay.eservices.modules.processing.dto.DocumentReleaseRequest;
import com.barangay.eservices.modules.processing.dto.PhysicalVerificationDTO;
import com.barangay.eservices.modules.requests.dto.RequestResponseDTO;
import org.springframework.data.domain.Pageable;

public interface DocumentProcessingService {
    RequestResponseDTO verifyInPersonRequirements(Long requestId, PhysicalVerificationDTO verification);
    RequestResponseDTO officialApproveAndSign(Long requestId, Long approverUserId, String notes);
    DocumentReleaseDTO releaseDocument(Long requestId, DocumentReleaseRequest releaseRequest);
    DocumentReleaseDTO getReleaseByRequestId(Long requestId);
    PaginatedResponse<DocumentReleaseDTO> getAllReleases(Pageable pageable);
}
