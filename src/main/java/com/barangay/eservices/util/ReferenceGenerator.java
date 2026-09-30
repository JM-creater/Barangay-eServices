package com.barangay.eservices.util;

import java.time.Year;
import java.util.UUID;

public class ReferenceGenerator {

    public static String generateRequestReference() {
        int currentYear = Year.now().getValue();
        String randomSuffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return String.format("BC-%d-%s", currentYear, randomSuffix);
    }

    public static String generateReleaseReference() {
        int currentYear = Year.now().getValue();
        String randomSuffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return String.format("REL-%d-%s", currentYear, randomSuffix);
    }

    public static String generateDocumentControlNumber(String serviceCode) {
        int currentYear = Year.now().getValue();
        String randomSuffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return String.format("DOC-%s-%d-%s", serviceCode != null ? serviceCode : "GEN", currentYear, randomSuffix);
    }
}
