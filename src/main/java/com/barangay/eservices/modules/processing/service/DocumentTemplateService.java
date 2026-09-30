package com.barangay.eservices.modules.processing.service;

import com.barangay.eservices.modules.processing.dto.DocumentPreviewDTO;

public interface DocumentTemplateService {

    DocumentPreviewDTO generateDocumentPreview(Long requestId);

    String generatePrintableHtml(Long requestId);
}
