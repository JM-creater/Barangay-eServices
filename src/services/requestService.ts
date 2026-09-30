import api from './api';
import { ApiResponse, PaginatedResponse } from '../types/common';
import { DocumentRequest } from '../types/Request';

export interface SubmitRequestData {
  serviceId: number;
  purpose: string;
  slotId: number;
  submittedDataJson?: string;
}

export const requestService = {
  async submitRequest(
    data: SubmitRequestData,
    files: { file: File; requirementId?: number }[]
  ): Promise<DocumentRequest> {
    const formData = new FormData();
    const dataBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    formData.append('data', dataBlob, 'data.json');

    files.forEach((f) => {
      formData.append('files', f.file);
      if (f.requirementId != null) {
        formData.append('requirementIds', f.requirementId.toString());
      }
    });

    const response = await api.post<ApiResponse<DocumentRequest>>('/requests', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  async getMyRequests(page = 0, size = 10): Promise<PaginatedResponse<DocumentRequest>> {
    const response = await api.get<ApiResponse<PaginatedResponse<DocumentRequest>>>('/requests/my-requests', {
      params: { page, size },
    });
    return response.data.data;
  },

  async getRequestById(id: number): Promise<DocumentRequest> {
    const response = await api.get<ApiResponse<DocumentRequest>>(`/requests/${id}`);
    return response.data.data;
  },

  async trackRequest(referenceNumber: string): Promise<DocumentRequest> {
    const response = await api.get<ApiResponse<DocumentRequest>>(`/requests/track/${referenceNumber}`);
    return response.data.data;
  },

  async resubmitCorrections(
    id: number,
    data: { purpose?: string; submittedDataJson?: string; remarks?: string },
    files: { file: File; requirementId?: number }[]
  ): Promise<DocumentRequest> {
    const formData = new FormData();
    const dataBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    formData.append('data', dataBlob, 'data.json');

    files.forEach((f) => {
      formData.append('files', f.file);
      if (f.requirementId != null) {
        formData.append('requirementIds', f.requirementId.toString());
      }
    });

    const response = await api.post<ApiResponse<DocumentRequest>>(`/requests/${id}/resubmit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  async cancelRequest(id: number, reason: string): Promise<DocumentRequest> {
    const response = await api.post<ApiResponse<DocumentRequest>>(`/requests/${id}/cancel`, { reason });
    return response.data.data;
  },

  async rescheduleRequest(id: number, newSlotId: number, reason?: string): Promise<DocumentRequest> {
    const response = await api.post<ApiResponse<DocumentRequest>>(`/requests/${id}/reschedule`, {
      newSlotId,
      reason,
    });
    return response.data.data;
  },

  // Staff endpoints
  async getAllRequests(status?: string, serviceId?: number, search?: string, page = 0, size = 15): Promise<PaginatedResponse<DocumentRequest>> {
    const response = await api.get<ApiResponse<PaginatedResponse<DocumentRequest>>>('/staff/requests', {
      params: { status, serviceId, search, page, size },
    });
    return response.data.data;
  },

  async getStaffRequestById(id: number): Promise<DocumentRequest> {
    const response = await api.get<ApiResponse<DocumentRequest>>(`/staff/requests/${id}`);
    return response.data.data;
  },

  async reviewRequest(
    id: number,
    payload: {
      action: 'ACCEPT' | 'REJECT' | 'REQUEST_CORRECTION';
      remarks?: string;
      rejectionReason?: string;
      correctionNotes?: string;
    }
  ): Promise<DocumentRequest> {
    const response = await api.post<ApiResponse<DocumentRequest>>(`/staff/requests/${id}/review`, payload);
    return response.data.data;
  },
};
