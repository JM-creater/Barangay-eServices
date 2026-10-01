package com.barangay.eservices.security.ratelimit;

public class RateLimitResult {

    private final boolean allowed;
    private final long limit;
    private final long remainingTokens;
    private final long retryAfterSeconds;

    public RateLimitResult(boolean allowed, long limit, long remainingTokens, long retryAfterSeconds) {
        this.allowed = allowed;
        this.limit = limit;
        this.remainingTokens = remainingTokens;
        this.retryAfterSeconds = retryAfterSeconds;
    }

    public static RateLimitResult exempt() {
        return new RateLimitResult(true, -1, -1, 0);
    }

    public boolean isAllowed() {
        return allowed;
    }

    public long getLimit() {
        return limit;
    }

    public long getRemainingTokens() {
        return remainingTokens;
    }

    public long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }
}
