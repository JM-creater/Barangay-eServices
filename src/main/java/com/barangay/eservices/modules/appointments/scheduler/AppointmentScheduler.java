package com.barangay.eservices.modules.appointments.scheduler;

import com.barangay.eservices.modules.appointments.entity.Appointment;
import com.barangay.eservices.modules.appointments.entity.AppointmentStatus;
import com.barangay.eservices.modules.appointments.repository.AppointmentRepository;
import com.barangay.eservices.modules.audit.service.AuditLogService;
import com.barangay.eservices.modules.notifications.entity.NotificationType;
import com.barangay.eservices.modules.notifications.service.NotificationService;
import com.barangay.eservices.util.DateUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
public class AppointmentScheduler {

    private static final Logger logger = LoggerFactory.getLogger(AppointmentScheduler.class);

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditLogService auditLogService;

    /**
     * Daily Reminder Cron: Runs every day at 8:00 AM.
     * Finds confirmed appointments scheduled for tomorrow and notifies residents.
     */
    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void sendUpcomingAppointmentReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        logger.info("Executing scheduled appointment reminder job for date: {}", tomorrow);

        List<Appointment> upcomingAppointments = appointmentRepository.findByAppointmentDateAndStatus(
                tomorrow, AppointmentStatus.CONFIRMED);

        int count = 0;
        for (Appointment appointment : upcomingAppointments) {
            if (appointment.getResident() != null && appointment.getDocumentRequest() != null) {
                String refNo = appointment.getDocumentRequest().getReferenceNumber();
                String serviceName = appointment.getDocumentRequest().getServiceItem().getName();
                String timeStr = DateUtil.formatTime(appointment.getAppointmentTime());

                String msg = String.format("Friendly Reminder: You have an appointment tomorrow (%s at %s) at Barangay Cansojong Hall for your %s (Ref: %s). Please bring original valid IDs, photocopies, and statutory fees.",
                        DateUtil.formatDate(tomorrow),
                        timeStr,
                        serviceName,
                        refNo);

                notificationService.sendNotification(
                        appointment.getResident(),
                        "Appointment Reminder for Tomorrow",
                        msg,
                        NotificationType.APPOINTMENT_CONFIRMED,
                        refNo
                );
                count++;
            }
        }

        logger.info("Dispatched {} appointment reminder notification(s) for {}", count, tomorrow);
    }

    /**
     * No-Show Auto-Sweeper Cron: Runs every day at 6:00 PM (after barangay office hours).
     * Sweeps past-due appointments that were never marked ATTENDED or CANCELLED,
     * updates status to NO_SHOW, and informs resident they may reschedule.
     */
    @Scheduled(cron = "0 0 18 * * *")
    @Transactional
    public void sweepNoShowAppointments() {
        LocalDate today = LocalDate.now();
        logger.info("Executing scheduled no-show sweeper job for past unfulfilled appointments on or before {}", today);

        List<Appointment> staleAppointments = appointmentRepository.findByAppointmentDateLessThanEqualAndStatusIn(
                today, List.of(AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING_CONFIRMATION));

        int updatedCount = 0;
        for (Appointment appointment : staleAppointments) {
            appointment.setStatus(AppointmentStatus.NO_SHOW);
            String note = "Automatically marked as NO_SHOW by system end-of-day sweeper on " + today;
            appointment.setNotes(appointment.getNotes() != null ? appointment.getNotes() + "\n" + note : note);
            appointmentRepository.save(appointment);

            if (appointment.getResident() != null && appointment.getDocumentRequest() != null) {
                String refNo = appointment.getDocumentRequest().getReferenceNumber();
                String serviceName = appointment.getDocumentRequest().getServiceItem().getName();

                String msg = String.format("Notice: Your scheduled appointment on %s for %s (Ref: %s) was missed. If you still need this document, please log in to your resident portal to reschedule your appointment.",
                        DateUtil.formatDate(appointment.getAppointmentDate()),
                        serviceName,
                        refNo);

                notificationService.sendNotification(
                        appointment.getResident(),
                        "Missed Appointment Notice (No-Show)",
                        msg,
                        NotificationType.GENERAL,
                        refNo
                );

                auditLogService.logAction(
                        null,
                        "APPOINTMENT_NO_SHOW_AUTO_FLAGGED",
                        "Appointment",
                        appointment.getId().toString(),
                        "Flagged appointment for " + refNo + " on " + appointment.getAppointmentDate() + " as NO_SHOW"
                );
            }
            updatedCount++;
        }

        logger.info("Completed no-show sweeper: transitioned {} appointment(s) to NO_SHOW", updatedCount);
    }
}
