import api from './api';
import { ApiResponse } from '../types/common';
import { DashboardStats, FinancialReport } from '../types/Report';

export const reportService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<ApiResponse<DashboardStats>>('/reports/dashboard-stats');
    return response.data.data;
  },

  async getFinancialReport(startDate?: string, endDate?: string): Promise<FinancialReport> {
    const response = await api.get<ApiResponse<FinancialReport>>('/reports/financial', {
      params: { startDate, endDate },
    });
    return response.data.data;
  },

  async exportCollectionsCsv(startDate?: string, endDate?: string): Promise<Blob> {
    const response = await api.get('/reports/export/collections', {
      params: { startDate, endDate },
      responseType: 'blob',
    });
    return response.data;
  },

  async exportRequestsCsv(startDate?: string, endDate?: string, status?: string): Promise<Blob> {
    const response = await api.get('/reports/export/requests', {
      params: { startDate, endDate, status },
      responseType: 'blob',
    });
    return response.data;
  },
};
