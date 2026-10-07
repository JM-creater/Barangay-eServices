package com.barangay.eservices.modules.ai.service;

import com.barangay.eservices.modules.ai.dto.*;

import java.util.List;

public interface AiGenerativeService {

    AiChatResponse chat(AiChatRequest request);

    AiGenerateRemarksResponse generateRemarks(AiGenerateRemarksRequest request);

    List<String> getQuickPrompts();

    AiContextualPromptsResponse getContextualPrompts(String page, String serviceCode, String referenceNumber);

    boolean reloadAssistantModel();
}
