package com.barangay.eservices.modules.notifications.service;

import com.barangay.eservices.dto.PaginatedResponse;
import com.barangay.eservices.exception.ResourceNotFoundException;
import com.barangay.eservices.modules.notifications.dto.NotificationDTO;
import com.barangay.eservices.modules.notifications.entity.Notification;
import com.barangay.eservices.modules.notifications.entity.NotificationType;
import com.barangay.eservices.modules.notifications.mapper.NotificationMapper;
import com.barangay.eservices.modules.notifications.repository.NotificationRepository;
import com.barangay.eservices.modules.users.entity.User;
import com.barangay.eservices.security.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private EmailService emailService;

    @Override
    @Transactional
    public void sendNotification(User recipient, String title, String message, NotificationType type, String referenceNumber) {
        Notification notification = new Notification(recipient, title, message, type, referenceNumber);
        notificationRepository.save(notification);

        if (recipient != null && recipient.getEmail() != null) {
            emailService.sendEmail(recipient.getEmail(), "[" + title + "] Barangay Cansojong e-Services", message);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDTO> getMyNotifications() {
        Long recipientId = SecurityUtil.getCurrentUserId();
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(recipientId).stream()
                .map(NotificationMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<NotificationDTO> getMyNotificationsPaginated(Pageable pageable) {
        Long recipientId = SecurityUtil.getCurrentUserId();
        Page<Notification> page = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(recipientId, pageable);
        List<NotificationDTO> dtoList = page.getContent().stream()
                .map(NotificationMapper::toDTO)
                .collect(Collectors.toList());

        return new PaginatedResponse<>(
                dtoList,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount() {
        Long recipientId = SecurityUtil.getCurrentUserId();
        return notificationRepository.countByRecipientIdAndIsReadFalse(recipientId);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        Long recipientId = SecurityUtil.getCurrentUserId();
        List<Notification> list = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(recipientId);
        list.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(list);
    }
}
