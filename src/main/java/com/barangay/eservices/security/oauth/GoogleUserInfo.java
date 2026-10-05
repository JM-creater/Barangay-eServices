package com.barangay.eservices.security.oauth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Representation of verified identity claims returned by Google OAuth.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleUserInfo {
    private String sub;
    private String email;
    private String name;
    private String givenName;
    private String familyName;
    private String pictureUrl;
}
