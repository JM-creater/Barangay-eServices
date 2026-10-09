package com.barangay.eservices.modules.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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

    @Size(max = 100, message = "Service name cannot exceed 100 characters")
    private String serviceName;

    @Size(max = 100, message = "Applicant name cannot exceed 100 characters")
    private String applicantName;

    @NotBlank(message = "Action type is required")
    @Size(max = 50, message = "Action type cannot exceed 50 characters")
    private String actionType; // "REQUEST_CORRECTION", "APPROVE_ENDORSEMENT", "REJECTION_REASON"

    @Size(max = 20, message = "Missing requirements cannot exceed 20 items")
    private List<@Size(max = 200, message = "Requirement name cannot exceed 200 characters") String> missingRequirements;

    @Size(max = 500, message = "Specific notes cannot exceed 500 characters")
    private String specificNotes;
}
