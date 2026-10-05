package com.barangay.eservices.modules.users.service;

import com.barangay.eservices.modules.users.dto.AuthRequest;
import com.barangay.eservices.modules.users.dto.AuthResponse;
import com.barangay.eservices.modules.users.dto.ChangePasswordRequest;
import com.barangay.eservices.modules.users.dto.RegisterRequest;
import com.barangay.eservices.modules.users.dto.TokenValidationResponse;
import com.barangay.eservices.modules.users.dto.UserDTO;

public interface AuthService {
    AuthResponse login(AuthRequest loginRequest);
    AuthResponse register(RegisterRequest registerRequest);
    UserDTO getCurrentUserProfile();
    void changePassword(ChangePasswordRequest request);
    void forgotPassword(com.barangay.eservices.modules.users.dto.ForgotPasswordRequest request);
    void resetPassword(com.barangay.eservices.modules.users.dto.ResetPasswordRequest request);
    TokenValidationResponse validateResetToken(String token);
    AuthResponse loginWithGoogle(com.barangay.eservices.modules.users.dto.GoogleLoginRequest request);
    com.barangay.eservices.modules.users.dto.GoogleTokenVerificationResponse verifyGoogleToken(com.barangay.eservices.modules.users.dto.GoogleTokenVerifyRequest request);
    AuthResponse registerWithGoogle(com.barangay.eservices.modules.users.dto.GoogleRegisterRequest request);
}
