package com.barangay.eservices.security.ratelimit;

import com.barangay.eservices.security.SecurityUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.AntPathMatcher;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
public class RateLimiterService {

    private static final Logger logger = LoggerFactory.getLogger(RateLimiterService.class);
    private static final AntPathMatcher pathMatcher = new AntPathMatcher();

    private static final List<String> EXEMPT_PATH_PATTERNS = Arrays.asList(
            "/",
            "/api",
            "/api/health",
            "/error",
            "/favicon.*",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/v3/api-docs/**",
            "/api-docs/**",
            "/webjars/**"
    );

    private final RateLimitingProperties properties;
    private final ClientIpResolver clientIpResolver;
    private final ConcurrentHashMap<String, TokenBucket> buckets = new ConcurrentHashMap<>();

    public RateLimiterService(RateLimitingProperties properties, ClientIpResolver clientIpResolver) {
        this.properties = properties;
        this.clientIpResolver = clientIpResolver;
    }

    /**
     * Evaluates whether the incoming HTTP request is permitted under rate limiting policy.
     *
     * @param request the current HTTP servlet request
     * @return RateLimitResult indicating permit status, current limit, remaining tokens, and retry-after
     */
    public RateLimitResult checkRateLimit(HttpServletRequest request) {
        if (!properties.isEnabled()) {
            return RateLimitResult.exempt();
        }

        String method = request.getMethod();
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return RateLimitResult.exempt();
        }

        String path = request.getRequestURI();
        if (isExemptPath(path)) {
            return RateLimitResult.exempt();
        }

        String clientIp = clientIpResolver.resolveClientIp(request);
        Long currentUserId = SecurityUtil.getCurrentUserId();

        RateLimitTier tier = resolveTier(path, currentUserId);
        long limit = getLimitForTier(tier);
        long windowSeconds = properties.getWindowSeconds();

        String bucketKey = buildBucketKey(tier, clientIp, currentUserId);

        TokenBucket bucket = buckets.compute(bucketKey, (k, existing) -> {
            if (existing == null || existing.getCapacity() != limit) {
                return new TokenBucket(limit, limit, windowSeconds);
            }
            return existing;
        });

        RateLimitResult result = bucket.tryConsume(1);
        if (!result.isAllowed()) {
            logger.warn("Rate limit exceeded for key [{}] on [{}] {} (Limit: {}, RetryAfter: {}s)",
                    bucketKey, method, path, limit, result.getRetryAfterSeconds());
        }

        return result;
    }

    /**
     * Resolves the appropriate tier based on user roles and requested resource path.
     */
    public RateLimitTier resolveTier(String path, Long currentUserId) {
        // Staff and Admin users have high-throughput operational requirements
        if (currentUserId != null && isStaffOrAdmin()) {
            return RateLimitTier.STAFF;
        }

        // Authentication endpoints (excluding authenticated /api/auth/me)
        if (pathMatcher.match("/api/auth/**", path) && !pathMatcher.match("/api/auth/me", path)) {
            return RateLimitTier.AUTHENTICATION;
        }

        // Public tracking and certificate verification lookup
        if (pathMatcher.match("/api/requests/track/**", path) ||
            pathMatcher.match("/api/public/verify-document/**", path) ||
            pathMatcher.match("/api/public/verify/**", path)) {
            return RateLimitTier.PUBLIC_SEARCH;
        }

        // File and attachment uploads
        if (pathMatcher.match("/api/files/upload/**", path) || pathMatcher.match("/api/files/upload", path)) {
            return RateLimitTier.FILE_UPLOAD;
        }

        return RateLimitTier.GENERAL;
    }

    private boolean isStaffOrAdmin() {
        return SecurityUtil.hasRole("ROLE_STAFF") ||
               SecurityUtil.hasRole("ROLE_APPROVER") ||
               SecurityUtil.hasRole("ROLE_ADMIN");
    }

    private long getLimitForTier(RateLimitTier tier) {
        return switch (tier) {
            case STAFF -> properties.getStaffLimit();
            case AUTHENTICATION -> properties.getAuthLimit();
            case PUBLIC_SEARCH -> properties.getPublicSearchLimit();
            case FILE_UPLOAD -> properties.getUploadLimit();
            case GENERAL -> properties.getGeneralLimit();
            case EXEMPT -> Long.MAX_VALUE;
        };
    }

    private String buildBucketKey(RateLimitTier tier, String clientIp, Long userId) {
        return switch (tier) {
            case STAFF -> "STAFF:user:" + userId;
            case AUTHENTICATION -> "AUTH:ip:" + clientIp;
            case PUBLIC_SEARCH -> "SEARCH:ip:" + clientIp;
            case FILE_UPLOAD -> userId != null ? ("UPLOAD:user:" + userId) : ("UPLOAD:ip:" + clientIp);
            case GENERAL -> userId != null ? ("GENERAL:user:" + userId) : ("GENERAL:ip:" + clientIp);
            case EXEMPT -> "EXEMPT";
        };
    }

    private boolean isExemptPath(String path) {
        if (path == null) {
            return true;
        }
        for (String pattern : EXEMPT_PATH_PATTERNS) {
            if (pathMatcher.match(pattern, path)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Periodic cleanup of inactive buckets to prevent memory accumulation.
     * Runs every 5 minutes and removes buckets inactive for over 15 minutes.
     */
    @Scheduled(fixedRate = 300000)
    public void cleanupStaleBuckets() {
        long now = System.nanoTime();
        long ttlNanos = TimeUnit.MINUTES.toNanos(15);

        int initialSize = buckets.size();
        buckets.entrySet().removeIf(entry -> (now - entry.getValue().getLastAccessNanoTime()) > ttlNanos);

        // Emergency eviction if map exceeds 50,000 entries (evict older than 5 minutes)
        if (buckets.size() > 50000) {
            long emergencyTtlNanos = TimeUnit.MINUTES.toNanos(5);
            buckets.entrySet().removeIf(entry -> (now - entry.getValue().getLastAccessNanoTime()) > emergencyTtlNanos);
            logger.warn("Emergency rate limiting cache eviction executed. Active count: {}", buckets.size());
        }

        if (initialSize != buckets.size()) {
            logger.debug("Rate limit cleanup completed: evicted {} stale buckets, {} active.",
                    (initialSize - buckets.size()), buckets.size());
        }
    }

    public int getActiveBucketsCount() {
        return buckets.size();
    }

    public void clearAllBuckets() {
        buckets.clear();
    }
}
