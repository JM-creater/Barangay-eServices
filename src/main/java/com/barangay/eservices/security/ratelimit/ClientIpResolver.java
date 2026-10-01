package com.barangay.eservices.security.ratelimit;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class ClientIpResolver {

    private static final String[] PROXY_HEADER_NAMES = {
            "CF-Connecting-IP",     // Cloudflare
            "True-Client-IP",       // Cloudflare Enterprise / Akamai
            "X-Forwarded-For",      // Standard proxy chain header
            "X-Real-IP",            // Nginx / Ingress proxy
            "Proxy-Client-IP",      // Apache Web Server
            "WL-Proxy-Client-IP",   // WebLogic
            "HTTP_CLIENT_IP",
            "HTTP_X_FORWARDED_FOR"
    };

    /**
     * Resolves the originating client IP address.
     *
     * @param request current HttpServletRequest
     * @return cleaned and normalized IP string, never null
     */
    public String resolveClientIp(HttpServletRequest request) {
        if (request == null) {
            return "127.0.0.1";
        }

        for (String headerName : PROXY_HEADER_NAMES) {
            String headerValue = request.getHeader(headerName);
            if (StringUtils.hasText(headerValue) && !"unknown".equalsIgnoreCase(headerValue.trim())) {
                String candidate = extractCandidateIp(headerValue);
                if (candidate != null) {
                    return sanitizeIp(candidate);
                }
            }
        }

        String remoteAddr = request.getRemoteAddr();
        return sanitizeIp(remoteAddr);
    }

    private String extractCandidateIp(String headerValue) {
        if (!StringUtils.hasText(headerValue)) {
            return null;
        }

        // X-Forwarded-For can contain multiple IPs: "client, proxy1, proxy2"
        String[] parts = headerValue.split(",");
        for (String part : parts) {
            String candidate = part.trim();
            if (StringUtils.hasText(candidate) && !"unknown".equalsIgnoreCase(candidate)) {
                return candidate;
            }
        }
        return null;
    }

    private String sanitizeIp(String ip) {
        if (!StringUtils.hasText(ip)) {
            return "127.0.0.1";
        }

        String clean = ip.trim();

        // Normalize IPv6 localhost
        if ("0:0:0:0:0:0:0:1".equals(clean) || "::1".equals(clean)) {
            return "127.0.0.1";
        }

        // Strip IPv4 port if appended (e.g., 203.0.113.195:48500)
        int colonIndex = clean.indexOf(':');
        if (colonIndex > 0 && clean.indexOf(':', colonIndex + 1) == -1) {
            clean = clean.substring(0, colonIndex);
        }

        return clean;
    }
}
