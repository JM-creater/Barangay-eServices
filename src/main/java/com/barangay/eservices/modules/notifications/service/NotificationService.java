package com.barangay.eservices.modules.notifications.service;

import com.barangay.eservices.dto.PaginatedResponse;
import com.barangay.eservices.modules.notifications.dto.NotificationDTO;
import com.barangay.eservices.modules.notifications.entity.NotificationType;
import com.barangay.eservices.modules.users.entity.User;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {
    void sendNotification(User recipient, String title, String message, NotificationType type, String referenceNumber);
    List<NotificationDTO> getMyNotifications();
    PaginatedResponse<NotificationDTO> getMyNotificationsPaginated(Pageable pageable);
    long getUnreadCount();
    void markAsRead(Long notificationId);
    void markAllAsRead();
}
