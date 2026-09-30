import api from './api';
import { ApiResponse, PaginatedResponse } from '../types/common';
import { Appointment, AppointmentSlot, BatchCreateSlotPayload, CreateSlotPayload, Holiday, CreateHolidayPayload } from '../types/Appointment';

export const appointmentService = {
  async getAvailableSlots(date: string): Promise<AppointmentSlot[]> {
    const response = await api.get<ApiResponse<AppointmentSlot[]>>('/appointments/available-slots', {
      params: { date },
    });
    return response.data.data;
  },

  async getAvailableSlotsRange(startDate: string, endDate: string): Promise<AppointmentSlot[]> {
    const response = await api.get<ApiResponse<AppointmentSlot[]>>('/appointments/available-slots-range', {
      params: { startDate, endDate },
    });
    return response.data.data;
  },

  async getMyAppointments(): Promise<Appointment[]> {
    const response = await api.get<ApiResponse<Appointment[]>>('/appointments/my-appointments');
    return response.data.data;
  },

  async rescheduleAppointment(appointmentId: number, newSlotId: number, reason?: string): Promise<Appointment> {
    const response = await api.post<ApiResponse<Appointment>>(`/appointments/${appointmentId}/reschedule`, {
      newSlotId,
      reason,
    });
    return response.data.data;
  },

  async getAppointments(date?: string, status?: string, page = 0, size = 15): Promise<PaginatedResponse<Appointment>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Appointment>>>('/appointments', {
      params: { date, status, page, size },
    });
    return response.data.data;
  },

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    const response = await api.get<ApiResponse<Appointment[]>>('/appointments/by-date', {
      params: { date },
    });
    return response.data.data;
  },

  async updateAppointmentStatus(id: number, status: string, notes?: string): Promise<Appointment> {
    const response = await api.put<ApiResponse<Appointment>>(`/appointments/${id}/status`, {
      status,
      notes,
    });
    return response.data.data;
  },

  // Admin slot management
  async createSlot(payload: CreateSlotPayload): Promise<AppointmentSlot> {
    const response = await api.post<ApiResponse<AppointmentSlot>>('/admin/appointment-slots', payload);
    return response.data.data;
  },

  async batchCreateSlots(payload: BatchCreateSlotPayload): Promise<AppointmentSlot[]> {
    const response = await api.post<ApiResponse<AppointmentSlot[]>>('/admin/appointment-slots/batch', payload);
    return response.data.data;
  },

  // Admin holiday management
  async getHolidays(startDate?: string, endDate?: string): Promise<Holiday[]> {
    const response = await api.get<ApiResponse<Holiday[]>>('/admin/holidays', {
      params: { startDate, endDate },
    });
    return response.data.data;
  },

  async createHoliday(payload: CreateHolidayPayload): Promise<Holiday> {
    const response = await api.post<ApiResponse<Holiday>>('/admin/holidays', payload);
    return response.data.data;
  },

  async deleteHoliday(id: number): Promise<void> {
    await api.delete<ApiResponse<void>>(`/admin/holidays/${id}`);
  },
};
