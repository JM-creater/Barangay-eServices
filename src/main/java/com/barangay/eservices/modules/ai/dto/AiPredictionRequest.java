package com.barangay.eservices.modules.ai.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiPredictionRequest {

    private Long serviceId;

    @Size(max = 50, message = "Service code cannot exceed 50 characters")
    private String serviceCode;

    @Size(max = 500, message = "Purpose cannot exceed 500 characters")
    private String purpose;

    @Min(value = 0, message = "Submitted documents count cannot be negative")
    @Max(value = 100, message = "Submitted documents count cannot exceed 100")
    private Integer submittedDocsCount;

    @Min(value = 0, message = "Required documents count cannot be negative")
    @Max(value = 100, message = "Required documents count cannot exceed 100")
    private Integer requiredDocsCount;

    @Min(value = 0, message = "Submission hour must be between 0 and 23")
    @Max(value = 23, message = "Submission hour must be between 0 and 23")
    private Integer submissionHour;

    @Min(value = 0, message = "Submission day of week must be between 0 and 6")
    @Max(value = 6, message = "Submission day of week must be between 0 and 6")
    private Integer submissionDayOfWeek;

    private Boolean isResident;
}
