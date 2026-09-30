export interface AppointmentSlot {
  id: number;
  slotDate: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  bookedCount: number;
  remainingCapacity: number;
  isAvailable: boolean;
  isActive: boolean;
}

export interface Appointment {
  id: number;
  requestId: number;
  referenceNumber: string;
  serviceName: string;
  residentId: number;
  residentName: string;
  contactNumber: string;
  slotId: number;
  appointmentDate: string;
  appointmentTime: string;
  status: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'ATTENDED' | 'CANCELLED' | 'NO_SHOW';
  notes?: string;
  cancellationReason?: string;
}

export interface CreateSlotPayload {
  slotDate: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
}

export interface BatchCreateSlotPayload {
  startDate: string;
  endDate: string;
  startTimes: string[];
  durationMinutes: number;
  capacityPerSlot: number;
}

export interface Holiday {
  id: number;
  holidayDate: string;
  name: string;
  type: string;
  description?: string;
  createdAt?: string;
}

export interface CreateHolidayPayload {
  holidayDate: string;
  name: string;
  type?: string;
  description?: string;
}

