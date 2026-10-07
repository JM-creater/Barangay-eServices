package com.barangay.eservices.modules.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiGenerateRemarksRequest {

    private String serviceName;

    private String applicantName;

    @NotBlank(message = "Action type is required")
    private String actionType; // "REQUEST_CORRECTION", "APPROVE_ENDORSEMENT", "REJECTION_REASON"

    private List<String> missingRequirements;

    private String specificNotes;
}
