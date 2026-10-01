package com.barangay.eservices.security.ratelimit;

import java.util.concurrent.TimeUnit;

/**
 * Thread-safe implementation of the Token Bucket rate limiting algorithm.
 * Tokens replenish continuously based on elapsed nanoseconds, allowing controlled bursts
 * while strictly maintaining the configured sustained rate limit.
 */
public class TokenBucket {

    private final long capacity;
    private final double refillTokensPerNano;
    private double availableTokens;
    private long lastRefillNanoTime;
    private volatile long lastAccessNanoTime;

    /**
     * Initializes a new Token Bucket.
     *
     * @param capacity               maximum number of tokens the bucket can hold (burst limit)
     * @param refillTokens           number of tokens refilled per window
     * @param windowDurationSeconds  duration of the window in seconds
     */
    public TokenBucket(long capacity, long refillTokens, long windowDurationSeconds) {
        if (capacity <= 0) {
            throw new IllegalArgumentException("Bucket capacity must be strictly positive: " + capacity);
        }
        if (refillTokens <= 0) {
            throw new IllegalArgumentException("Refill tokens count must be strictly positive: " + refillTokens);
        }
        if (windowDurationSeconds <= 0) {
            throw new IllegalArgumentException("Window duration must be strictly positive: " + windowDurationSeconds);
        }

        this.capacity = capacity;
        long windowDurationNanos = TimeUnit.SECONDS.toNanos(windowDurationSeconds);
        this.refillTokensPerNano = (double) refillTokens / (double) windowDurationNanos;
        this.availableTokens = capacity;

        long now = System.nanoTime();
        this.lastRefillNanoTime = now;
        this.lastAccessNanoTime = now;
    }

    /**
     * Attempts to consume the specified number of tokens from the bucket.
     *
     * @param tokens number of tokens required
     * @return RateLimitResult indicating whether the consumption succeeded and remaining tokens
     */
    public synchronized RateLimitResult tryConsume(long tokens) {
        long now = System.nanoTime();
        this.lastAccessNanoTime = now;

        long elapsedNanos = Math.max(0, now - lastRefillNanoTime);
        this.lastRefillNanoTime = now;

        // Refill tokens proportional to elapsed time, capped at capacity
        this.availableTokens = Math.min(capacity, this.availableTokens + (elapsedNanos * refillTokensPerNano));

        if (this.availableTokens >= tokens) {
            this.availableTokens -= tokens;
            long remaining = (long) Math.floor(this.availableTokens);
            return new RateLimitResult(true, capacity, remaining, 0);
        } else {
            double missingTokens = tokens - this.availableTokens;
            long nanosUntilAvailable = (long) Math.ceil(missingTokens / refillTokensPerNano);
            long secondsUntilAvailable = Math.max(1, (long) Math.ceil((double) nanosUntilAvailable / 1_000_000_000.0));
            return new RateLimitResult(false, capacity, 0, secondsUntilAvailable);
        }
    }

    /**
     * Returns the timestamp (in System.nanoTime()) of the most recent access.
     */
    public long getLastAccessNanoTime() {
        return lastAccessNanoTime;
    }

    public long getCapacity() {
        return capacity;
    }

    public synchronized double getAvailableTokens() {
        return availableTokens;
    }
}
