package com.barangay.eservices.security.ratelimit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class RateLimitingProperties {

    @Value("${app.rate-limiting.enabled}")
    private boolean enabled;

    @Value("${app.rate-limiting.window-seconds}")
    private int windowSeconds;

    @Value("${app.rate-limiting.general-limit}")
    private int generalLimit;

    @Value("${app.rate-limiting.auth-limit}")
    private int authLimit;

    @Value("${app.rate-limiting.public-search-limit}")
    private int publicSearchLimit;

    @Value("${app.rate-limiting.upload-limit}")
    private int uploadLimit;

    @Value("${app.rate-limiting.staff-limit}")
    private int staffLimit;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public int getWindowSeconds() {
        return windowSeconds > 0 ? windowSeconds : 60;
    }

    public void setWindowSeconds(int windowSeconds) {
        this.windowSeconds = windowSeconds;
    }

    public int getGeneralLimit() {
        return generalLimit > 0 ? generalLimit : 120;
    }

    public void setGeneralLimit(int generalLimit) {
        this.generalLimit = generalLimit;
    }

    public int getAuthLimit() {
        return authLimit > 0 ? authLimit : 15;
    }

    public void setAuthLimit(int authLimit) {
        this.authLimit = authLimit;
    }

    public int getPublicSearchLimit() {
        return publicSearchLimit > 0 ? publicSearchLimit : 30;
    }

    public void setPublicSearchLimit(int publicSearchLimit) {
        this.publicSearchLimit = publicSearchLimit;
    }

    public int getUploadLimit() {
        return uploadLimit > 0 ? uploadLimit : 20;
    }

    public void setUploadLimit(int uploadLimit) {
        this.uploadLimit = uploadLimit;
    }

    public int getStaffLimit() {
        return staffLimit > 0 ? staffLimit : 600;
    }

    public void setStaffLimit(int staffLimit) {
        this.staffLimit = staffLimit;
    }
}
