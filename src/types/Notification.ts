export interface NotificationItem {
  id: number;
  recipientId: number;
  title: string;
  message: string;
  type: string;
  channel: string;
  isRead: boolean;
  referenceNumber?: string;
  createdAt: string;
}
