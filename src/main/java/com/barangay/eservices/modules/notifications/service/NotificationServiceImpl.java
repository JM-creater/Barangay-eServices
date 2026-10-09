package com.barangay.eservices.modules.notifications.service;

import com.barangay.eservices.dto.PaginatedResponse;
import com.barangay.eservices.exception.ApiException;
import com.barangay.eservices.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
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

    @Autowired
    private EmailTemplateBuilder templateBuilder;

    @Override
    @Transactional
    public void sendNotification(User recipient, String title, String message, NotificationType type, String referenceNumber) {
        Notification notification = new Notification(recipient, title, message, type, referenceNumber);
        notificationRepository.save(notification);

        // Dispatches outbound transactional email to recipient's email if available
        if (recipient != null && recipient.getEmail() != null && !recipient.getEmail().isBlank()) {
            // Avoid duplicate email if caller already handled password reset directly
            if (title != null && title.toLowerCase().contains("password reset request")) {
                return;
            }

            String html;
            if (referenceNumber != null && !referenceNumber.isBlank()) {
                html = templateBuilder.buildDocumentStatusTemplate(
                        title, message, referenceNumber, null, "View in Portal");
            } else {
                html = templateBuilder.buildGeneralNotificationTemplate(title, message);
            }

            emailService.sendHtmlEmail(
                    recipient.getEmail(),
                    recipient.getFirstName(),
                    "[" + title + "] Barangay Cansojong e-Services",
                    html
            );
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

        Long currentUserId = SecurityUtil.getCurrentUserId();
        if (currentUserId != null && notification.getRecipient() != null
                && !currentUserId.equals(notification.getRecipient().getId())) {
            throw new ApiException("You are not authorized to modify this notification", HttpStatus.FORBIDDEN);
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        Long recipientId = SecurityUtil.getCurrentUserId();
        notificationRepository.markAllAsReadByRecipientId(recipientId);
    }
}
