package com.barangay.eservices.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class S3StorageProperties {

    @Value("${app.storage.s3.endpoint:${AWS_ENDPOINT_URL:${AWS_ENDPOINT:https://t3.storageapi.dev}}}")
    private String endpoint;

    @Value("${app.storage.s3.region:${AWS_REGION:${AWS_DEFAULT_REGION:auto}}}")
    private String region;

    @Value("${app.storage.s3.bucket:${AWS_BUCKET_NAME:${RAILWAY_STORAGE_BUCKET_NAME:barangay-eservice-bucket-aafoth}}}")
    private String bucket;

    @Value("${app.storage.s3.access-key-id:${AWS_ACCESS_KEY_ID:${RAILWAY_STORAGE_ACCESS_KEY_ID:}}}")
    private String accessKeyId;

    @Value("${app.storage.s3.secret-access-key:${AWS_SECRET_ACCESS_KEY:${RAILWAY_STORAGE_SECRET_ACCESS_KEY:}}}")
    private String secretAccessKey;

    @Value("${app.storage.s3.prefix:barangay_requests/}")
    private String prefix;

    @Value("${app.storage.s3.path-style-access:false}")
    private boolean pathStyleAccess;

    @Value("${app.storage.s3.enabled:true}")
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
