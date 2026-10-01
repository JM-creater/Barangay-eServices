package com.barangay.eservices.security.ratelimit;

import com.barangay.eservices.dto.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final RateLimiterService rateLimiterService;
    private final RateLimitingProperties properties;
    private final ObjectMapper objectMapper;

    public RateLimitingFilter(RateLimiterService rateLimiterService,
                              RateLimitingProperties properties,
                              ObjectMapper objectMapper) {
        this.rateLimiterService = rateLimiterService;
        this.properties = properties;
        ObjectMapper mapper = (objectMapper != null) ? objectMapper.copy() : new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        this.objectMapper = mapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // Complete bypass if disabled in configuration
        if (!properties.isEnabled()) {
            filterChain.doFilter(request, response);
            return;
        }

        // Always allow CORS preflight requests without rate limiting overhead
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        RateLimitResult result = rateLimiterService.checkRateLimit(request);

        if (result.isAllowed()) {
            // Attach informative rate limit headers when applicable (non-exempt)
            if (result.getLimit() > 0) {
                response.setHeader("X-RateLimit-Limit", String.valueOf(result.getLimit()));
                response.setHeader("X-RateLimit-Remaining", String.valueOf(result.getRemainingTokens()));
                response.setHeader("X-RateLimit-Reset", String.valueOf(result.getRetryAfterSeconds()));
            }
            filterChain.doFilter(request, response);
        } else {
            // Reject request with HTTP 429 Too Many Requests
            writeRateLimitExceededResponse(response, result);
        }
    }

    private void writeRateLimitExceededResponse(HttpServletResponse response, RateLimitResult result) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());

        response.setHeader("Retry-After", String.valueOf(result.getRetryAfterSeconds()));
        response.setHeader("X-RateLimit-Limit", String.valueOf(result.getLimit()));
        response.setHeader("X-RateLimit-Remaining", "0");
        response.setHeader("X-RateLimit-Reset", String.valueOf(result.getRetryAfterSeconds()));

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.TOO_MANY_REQUESTS.value(),
                "Too many requests. You have exceeded the rate limit. Please wait " +
                        result.getRetryAfterSeconds() + " second(s) before trying again."
        );

        String jsonBody;
        try {
            jsonBody = objectMapper.writeValueAsString(errorResponse);
        } catch (Exception e) {
            // Resilient fallback JSON in the unlikely event of serialization failure
            jsonBody = String.format(
                    "{\"success\":false,\"status\":429,\"message\":\"Too many requests. Please wait %d second(s) before trying again.\"}",
                    result.getRetryAfterSeconds()
            );
        }

        response.getWriter().write(jsonBody);
        response.getWriter().flush();
    }
}
