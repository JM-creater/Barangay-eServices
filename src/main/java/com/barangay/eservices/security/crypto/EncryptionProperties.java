package com.barangay.eservices.security.crypto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "app.security.encryption")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EncryptionProperties {

    @Value("${app.security.encryption.enabled}")
    private boolean enabled;

    @Value("${app.security.encryption.secret-key}")
    private String secretKey;

    @Value("${app.security.encryption.encrypt-all-responses}")
    private boolean encryptAllResponses = true;

    private List<String> excludedPaths = Arrays.asList(
            "/v3/api-docs",
            "/swagger-ui",
            "/swagger-resources",
            "/actuator",
            "/api/reports/export",
            "/api/documents/preview"
    );
}
