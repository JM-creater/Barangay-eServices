package com.barangay.eservices.modules.ai.service;

import com.barangay.eservices.modules.ai.dto.AiVisionVerificationResponse;
import org.springframework.web.multipart.MultipartFile;

import java.awt.image.BufferedImage;
import java.util.Map;

public interface AiVisionService {

    AiVisionVerificationResponse verifyDocumentImage(MultipartFile file);

    AiVisionVerificationResponse verifyDocumentImage(BufferedImage image);

    boolean isModelLoaded();

    Map<String, Object> getVisionModelDiagnostics();
}
