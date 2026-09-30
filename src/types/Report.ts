export interface AuditLog {
  id: number;
  userId?: number;
  username?: string;
  userFullName?: string;
  action: string;
  entityName: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalRequests: number;
  pendingReviewCount: number;
  needsCorrectionCount: number;
  acceptedCount: number;
  processingCount: number;
  readyForReleaseCount: number;
  completedReleasedCount: number;
  rejectedCount: number;

  appointmentsToday: number;
  pendingAppointmentsCount: number;
  confirmedAppointmentsCount: number;
  attendedAppointmentsCount: number;
  noShowAppointmentsCount: number;

  totalRevenueCollected: number;
  totalRegisteredResidents: number;
  requestsByService: Record<string, number>;
}

export interface ServiceRevenueBreakdown {
  serviceName: string;
  transactionCount: number;
  totalAmount: number;
}

export interface FinancialReport {
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalReceiptsIssued: number;
  serviceBreakdown: ServiceRevenueBreakdown[];
  statusBreakdown: Record<string, number>;
  dailyCollections: Record<string, number>;
}

