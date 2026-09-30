import api from './api';
import { ApiResponse } from '../types/common';
import { ServiceCreatePayload, ServiceItem, ServiceUpdatePayload } from '../types/Service';

export const serviceCatalogService = {
  async getActiveServices(): Promise<ServiceItem[]> {
    const response = await api.get<ApiResponse<ServiceItem[]>>('/services');
    return response.data.data;
  },

  async getServiceById(id: number): Promise<ServiceItem> {
    const response = await api.get<ApiResponse<ServiceItem>>(`/services/${id}`);
    return response.data.data;
  },

  async getAllServices(): Promise<ServiceItem[]> {
    const response = await api.get<ApiResponse<ServiceItem[]>>('/admin/services');
    return response.data.data;
  },

  async createService(payload: ServiceCreatePayload): Promise<ServiceItem> {
    const response = await api.post<ApiResponse<ServiceItem>>('/admin/services', payload);
    return response.data.data;
  },

  async updateService(id: number, payload: ServiceUpdatePayload): Promise<ServiceItem> {
    const response = await api.put<ApiResponse<ServiceItem>>(`/admin/services/${id}`, payload);
    return response.data.data;
  },

  async deleteService(id: number): Promise<void> {
    await api.delete<ApiResponse<void>>(`/admin/services/${id}`);
  },

  async addRequirement(serviceId: number, req: { requirementName: string; description?: string; isMandatory?: boolean }): Promise<ServiceItem> {
    const response = await api.post<ApiResponse<ServiceItem>>(`/admin/services/${serviceId}/requirements`, req);
    return response.data.data;
  },

  async removeRequirement(requirementId: number): Promise<void> {
    await api.delete<ApiResponse<void>>(`/admin/services/requirements/${requirementId}`);
  },
};
