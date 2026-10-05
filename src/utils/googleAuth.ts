/**
 * Decoded payload claims from a Google ID Token (JWT).
 */
export interface GoogleIdTokenClaims {
  iss?: string;
  sub?: string;
  azp?: string;
  aud?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  iat?: number;
  exp?: number;
}

/**
 * Parses client-side claims from a Google ID token for immediate UI prefilling.
 * Note: The backend always verifies the signature cryptographically before accepting registration or login.
 */
export const parseGoogleIdToken = (idToken: string): GoogleIdTokenClaims | null => {
  try {
    const parts = idToken.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.warn('Failed to parse Google ID token client-side:', err);
    return null;
  }
};
