package com.barangay.eservices.security.ratelimit;

/**
 * Defines the rate limiting tiers for different types of operations
 * within the Barangay e-Services platform.
 */
public enum RateLimitTier {
    /**
     * Completely exempt from rate limiting (health checks, swagger docs, error routes, CORS preflights).
     */
    EXEMPT,

    /**
     * Privileged staff, approver, and admin tier with high throughput capacity (e.g., 600 req/min).
     */
    STAFF,

    /**
     * Security-critical authentication tier (login, registration, password recovery) to prevent brute force.
     */
    AUTHENTICATION,

    /**
     * Public search and anti-fraud verification tier (document tracking and certificate QR checks).
     */
    PUBLIC_SEARCH,

    /**
     * File and document attachment upload tier to protect storage resources.
     */
    FILE_UPLOAD,

    /**
     * General tier for authenticated residents and standard API operations (e.g., 120 req/min).
     */
    GENERAL
}
