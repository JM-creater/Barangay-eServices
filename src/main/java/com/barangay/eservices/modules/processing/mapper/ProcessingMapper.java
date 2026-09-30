package com.barangay.eservices.modules.processing.mapper;

import com.barangay.eservices.modules.processing.dto.DocumentReleaseDTO;
import com.barangay.eservices.modules.processing.entity.DocumentRelease;

public class ProcessingMapper {

    public static DocumentReleaseDTO toDTO(DocumentRelease release) {
        if (release == null) return null;
        DocumentReleaseDTO dto = new DocumentReleaseDTO();
        dto.setId(release.getId());
        if (release.getDocumentRequest() != null) {
            dto.setRequestId(release.getDocumentRequest().getId());
            dto.setReferenceNumber(release.getDocumentRequest().getReferenceNumber());
            if (release.getDocumentRequest().getServiceItem() != null) {
                dto.setServiceName(release.getDocumentRequest().getServiceItem().getName());
            }
        }
        dto.setReleaseReferenceNo(release.getReleaseReferenceNo());
        dto.setIssuedDocumentNumber(release.getIssuedDocumentNumber());
        dto.setRecipientName(release.getRecipientName());
        if (release.getReleasingOfficer() != null) {
            dto.setReleasingOfficerName(release.getReleasingOfficer().getFullName());
        }
        if (release.getOfficialApprover() != null) {
            dto.setOfficialApproverName(release.getOfficialApprover().getFullName());
        }
        dto.setPaymentAmount(release.getPaymentAmount());
        dto.setOfficialReceiptNumber(release.getOfficialReceiptNumber());
        dto.setPaymentStatus(release.getPaymentStatus());
        dto.setReleaseDate(release.getReleaseDate());
        dto.setRemarks(release.getRemarks());
        return dto;
    }
}
