package com.barangay.eservices.modules.notifications.mapper;

import com.barangay.eservices.modules.notifications.dto.NotificationDTO;
import com.barangay.eservices.modules.notifications.entity.Notification;

public class NotificationMapper {

    public static NotificationDTO toDTO(Notification notification) {
        if (notification == null) return null;
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        if (notification.getRecipient() != null) {
            dto.setRecipientId(notification.getRecipient().getId());
        }
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setType(notification.getType() != null ? notification.getType().name() : null);
        dto.setChannel(notification.getChannel() != null ? notification.getChannel().name() : null);
        dto.setIsRead(notification.getIsRead());
        dto.setReferenceNumber(notification.getReferenceNumber());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }
}
