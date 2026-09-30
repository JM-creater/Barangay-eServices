package com.barangay.eservices.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class S3StorageProperties {

    @Value("${app.storage.s3.endpoint}")
    private String endpoint;

    @Value("${app.storage.s3.region}")
    private String region;

    @Value("${app.storage.s3.bucket}")
    private String bucket;

    @Value("${app.storage.s3.access-key-id}")
    private String accessKeyId;

    @Value("${app.storage.s3.secret-access-key}")
    private String secretAccessKey;

    @Value("${app.storage.s3.prefix}")
    private String prefix;

    @Value("${app.storage.s3.path-style-access}")
    private boolean pathStyleAccess;

    @Value("${app.storage.s3.enabled}")
    private boolean enabled;

    /**
     * Checks if S3 bucket credentials are fully configured and valid.
     * Prevents startup errors and side effects when keys are not yet provided.
     */
    public boolean isConfigured() {
        if (!enabled) {
            return false;
        }
        if (!StringUtils.hasText(accessKeyId) || !StringUtils.hasText(secretAccessKey)) {
            return false;
        }
        String cleanKey = accessKeyId.trim().toLowerCase();
        String cleanSecret = secretAccessKey.trim().toLowerCase();
        if (cleanKey.contains("not yet") || cleanKey.startsWith("(") ||
            cleanSecret.contains("not yet") || cleanSecret.startsWith("(")) {
            return false;
        }
        return StringUtils.hasText(bucket) && StringUtils.hasText(endpoint);
    }

    public String getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getBucket() {
        return bucket;
    }

    public void setBucket(String bucket) {
        this.bucket = bucket;
    }

    public String getAccessKeyId() {
        return accessKeyId;
    }

    public void setAccessKeyId(String accessKeyId) {
        this.accessKeyId = accessKeyId;
    }

    public String getSecretAccessKey() {
        return secretAccessKey;
    }

    public void setSecretAccessKey(String secretAccessKey) {
        this.secretAccessKey = secretAccessKey;
    }

    public String getPrefix() {
        return prefix != null ? prefix : "";
    }

    public void setPrefix(String prefix) {
        this.prefix = prefix;
    }

    public boolean isPathStyleAccess() {
        return pathStyleAccess;
    }

    public void setPathStyleAccess(boolean pathStyleAccess) {
        this.pathStyleAccess = pathStyleAccess;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}
