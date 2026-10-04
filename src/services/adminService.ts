import api from './api';
import { ApiResponse, PaginatedResponse } from '../types/common';
import { User } from '../types/User';
import { AuditLog } from '../types/Report';

export interface CreateStaffPayload {
  username: string;
  email: string;
  password: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  contactNumber: string;
  role: string;
}


export const adminService = {
  async getAllUsers(search?: string, page = 0, size = 10): Promise<PaginatedResponse<User>> {
    const response = await api.get<ApiResponse<PaginatedResponse<User>>>('/admin/users', {
      params: { search, page, size },
    });
    return response.data.data;
  },

  async getUsersByRole(roleName: string): Promise<User[]> {
    const response = await api.get<ApiResponse<User[]>>(`/admin/users/role/${roleName}`);
    return response.data.data;
  },

  async createStaffAccount(payload: CreateStaffPayload): Promise<User> {
    const response = await api.post<ApiResponse<User>>('/admin/users/staff', payload);
    return response.data.data;
  },

  async updateUserStatus(id: number, status: string): Promise<User> {
    const response = await api.put<ApiResponse<User>>(`/admin/users/${id}/status`, { status });
    return response.data.data;
  },

  async updateUserRoles(id: number, roles: string[]): Promise<User> {
    const response = await api.put<ApiResponse<User>>(`/admin/users/${id}/roles`, roles);
    return response.data.data;
  },

  async getAuditLogs(entityName?: string, action?: string, page = 0, size = 15): Promise<PaginatedResponse<AuditLog>> {
    const response = await api.get<ApiResponse<PaginatedResponse<AuditLog>>>('/admin/audit-logs', {
      params: { entityName, action, page, size },
    });
    return response.data.data;
  },
};
