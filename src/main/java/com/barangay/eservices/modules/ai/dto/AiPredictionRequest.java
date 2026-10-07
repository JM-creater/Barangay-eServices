package com.barangay.eservices.modules.ai.dto;

//import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiPredictionRequest {

//    @NotNull(message = "Service ID is required")
    private Long serviceId;

    private String serviceCode;

    private String purpose;

    private Integer submittedDocsCount;

    private Integer requiredDocsCount;

    private Integer submissionHour;

    private Integer submissionDayOfWeek;

    private Boolean isResident;
}
