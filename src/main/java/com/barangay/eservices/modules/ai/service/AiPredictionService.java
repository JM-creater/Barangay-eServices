package com.barangay.eservices.modules.ai.service;

import com.barangay.eservices.modules.ai.dto.AiModelStatusResponse;
import com.barangay.eservices.modules.ai.dto.AiPredictionRequest;
import com.barangay.eservices.modules.ai.dto.AiPredictionResponse;

public interface AiPredictionService {

    AiPredictionResponse predictApplication(AiPredictionRequest request);

    AiModelStatusResponse getModelStatus();

    boolean reloadModel();
}
