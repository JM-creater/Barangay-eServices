package com.barangay.eservices.modules.requests.mapper;

import com.barangay.eservices.modules.appointments.mapper.AppointmentMapper;
import com.barangay.eservices.modules.catalog.mapper.CatalogMapper;
import com.barangay.eservices.modules.requests.dto.FileDTO;
import com.barangay.eservices.modules.requests.dto.RequestResponseDTO;
import com.barangay.eservices.modules.requests.dto.RequestStatusHistoryDTO;
import com.barangay.eservices.modules.requests.entity.DocumentRequest;
import com.barangay.eservices.modules.requests.entity.RequestFile;
import com.barangay.eservices.modules.requests.entity.RequestStatusHistory;
import com.barangay.eservices.modules.users.mapper.UserMapper;

import java.util.stream.Collectors;

public class RequestMapper {

    public static FileDTO toFileDTO(RequestFile file) {
        if (file == null) return null;
        FileDTO dto = new FileDTO();
        dto.setId(file.getId());
        if (file.getRequirement() != null) {
            dto.setRequirementId(file.getRequirement().getId());
            dto.setRequirementName(file.getRequirement().getRequirementName());
        }
        dto.setOriginalFileName(file.getOriginalFileName());
        dto.setStoredFileName(file.getStoredFileName());
        dto.setFileType(file.getFileType());
        dto.setFileSize(file.getFileSize());
        dto.setFileUrl("/api/files/download/" + file.getStoredFileName());
        dto.setUploadedAt(file.getUploadedAt());
        return dto;
    }

    public static RequestStatusHistoryDTO toHistoryDTO(RequestStatusHistory history) {
        if (history == null) return null;
        RequestStatusHistoryDTO dto = new RequestStatusHistoryDTO();
        dto.setId(history.getId());
        dto.setPreviousStatus(history.getPreviousStatus() != null ? history.getPreviousStatus().name() : null);
        dto.setNewStatus(history.getNewStatus().name());
        dto.setRemarks(history.getRemarks());
        if (history.getChangedBy() != null) {
            dto.setChangedByName(history.getChangedBy().getFullName());
        }
        dto.setCreatedAt(history.getCreatedAt());
        return dto;
    }

    public static RequestResponseDTO toResponseDTO(DocumentRequest request) {
        if (request == null) return null;
        RequestResponseDTO dto = new RequestResponseDTO();
        dto.setId(request.getId());
        dto.setReferenceNumber(request.getReferenceNumber());
        dto.setResident(UserMapper.toDTO(request.getResident()));
        dto.setService(CatalogMapper.toDTO(request.getServiceItem()));
        dto.setPurpose(request.getPurpose());
        dto.setSubmittedDataJson(request.getSubmittedDataJson());
        dto.setAssignedStaff(UserMapper.toDTO(request.getAssignedStaff()));
        dto.setCurrentStatus(request.getCurrentStatus().name());
        dto.setRemarks(request.getRemarks());
        dto.setRejectionReason(request.getRejectionReason());
        dto.setCorrectionNotes(request.getCorrectionNotes());
        dto.setAppointment(AppointmentMapper.toAppointmentDTO(request.getAppointment()));
        dto.setCreatedAt(request.getCreatedAt());
        dto.setUpdatedAt(request.getUpdatedAt());

        if (request.getFiles() != null) {
            dto.setFiles(request.getFiles().stream()
                    .map(RequestMapper::toFileDTO)
                    .collect(Collectors.toList()));
        }

        if (request.getHistory() != null) {
            dto.setHistory(request.getHistory().stream()
                    .map(RequestMapper::toHistoryDTO)
                    .collect(Collectors.toList()));
        }

        return dto;
    }
}
