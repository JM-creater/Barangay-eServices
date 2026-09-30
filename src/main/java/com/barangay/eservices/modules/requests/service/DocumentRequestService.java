package com.barangay.eservices.modules.requests.service;

import com.barangay.eservices.dto.PaginatedResponse;
import com.barangay.eservices.modules.requests.dto.*;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface DocumentRequestService {
    RequestResponseDTO submitRequest(RequestCreateDTO requestDTO, List<MultipartFile> files, List<Long> requirementIds);
    RequestResponseDTO getRequestById(Long id);
    RequestResponseDTO getRequestByReference(String referenceNumber);
    PaginatedResponse<RequestResponseDTO> getMyRequests(Pageable pageable);
    PaginatedResponse<RequestResponseDTO> getAllRequests(String status, Long serviceId, String search, Pageable pageable);
    RequestResponseDTO reviewRequest(Long id, StaffReviewActionDTO reviewAction);
    RequestResponseDTO resubmitCorrections(Long id, CorrectionResubmitDTO resubmitDTO, List<MultipartFile> files, List<Long> requirementIds);
    RequestResponseDTO cancelRequest(Long id, String reason);
    RequestResponseDTO rescheduleRequest(Long id, com.barangay.eservices.modules.appointments.dto.RescheduleRequest rescheduleRequest);
}
