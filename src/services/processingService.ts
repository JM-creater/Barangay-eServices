import api, { getApiBaseUrl } from './api';
import { ApiResponse, PaginatedResponse } from '../types/common';
import { DocumentRelease, DocumentRequest, DocumentPreview, DocumentVerification } from '../types/Request';

export interface ReleasePayload {
  paymentAmount?: number;
  officialReceiptNumber?: string;
  paymentStatus?: string;
  officialApproverId?: number;
  issuedDocumentNumber?: string;
  recipientName?: string;
  remarks?: string;
}

export const processingService = {
  async verifyInPerson(requestId: number, requirementsSatisfied: boolean, notes?: string): Promise<DocumentRequest> {
    const response = await api.post<ApiResponse<DocumentRequest>>(`/staff/processing/${requestId}/verify-in-person`, {
      requirementsSatisfied,
      notes,
    });
    return response.data.data;
  },

  async approveAndSign(requestId: number, approverId?: number, notes?: string): Promise<DocumentRequest> {
    const response = await api.post<ApiResponse<DocumentRequest>>(`/staff/processing/${requestId}/approve-sign`, {
      approverId,
      notes,
    });
    return response.data.data;
  },

  async releaseDocument(requestId: number, payload: ReleasePayload): Promise<DocumentRelease> {
    const response = await api.post<ApiResponse<DocumentRelease>>(`/staff/processing/${requestId}/release`, payload);
    return response.data.data;
  },

  async getReleaseInfo(requestId: number): Promise<DocumentRelease> {
    const response = await api.get<ApiResponse<DocumentRelease>>(`/staff/processing/${requestId}/release-info`);
    return response.data.data;
  },

  async getAllReleases(page = 0, size = 15): Promise<PaginatedResponse<DocumentRelease>> {
    const response = await api.get<ApiResponse<PaginatedResponse<DocumentRelease>>>('/staff/processing/releases', {
      params: { page, size },
    });
    return response.data.data;
  },

  async getDocumentPreview(requestId: number): Promise<DocumentPreview> {
    const response = await api.get<ApiResponse<DocumentPreview>>(`/staff/processing/${requestId}/document-preview`);
    return response.data.data;
  },

  getDocumentPrintUrl(requestId: number, autoprint = false): string {
    const apiBase = getApiBaseUrl();
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    if (token) {
      params.append('token', token);
    }
    if (autoprint) {
      params.append('autoprint', 'true');
    }
    const queryString = params.toString();
    const query = queryString ? `?${queryString}` : '';
    return `${apiBase}/staff/processing/${requestId}/document-print${query}`;
  },

  async verifyDocument(controlNumber: string): Promise<DocumentVerification> {
    const response = await api.get<ApiResponse<DocumentVerification>>(`/public/verify-document/${encodeURIComponent(controlNumber)}`);
    return response.data.data;
  },
};
