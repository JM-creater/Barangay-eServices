import api from './api';
import { ApiResponse } from '../types/common';
import { AuthResponse, LoginPayload, RegisterPayload, User } from '../types/User';

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', payload);
    return response.data.data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', payload);
    return response.data.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post<ApiResponse<void>>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  async forgotPassword(emailOrUsername: string): Promise<string> {
    const response = await api.post<ApiResponse<void>>('/auth/forgot-password', {
      emailOrUsername,
    });
    return response.data.message;
  },

  async resetPassword(token: string, newPassword: string): Promise<string> {
    const response = await api.post<ApiResponse<void>>('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data.message;
  },
};
