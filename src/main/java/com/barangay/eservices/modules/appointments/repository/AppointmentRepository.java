package com.barangay.eservices.modules.appointments.repository;

import com.barangay.eservices.modules.appointments.entity.Appointment;
import com.barangay.eservices.modules.appointments.entity.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByResidentIdOrderByAppointmentDateDescAppointmentTimeDesc(Long residentId);

    Optional<Appointment> findByDocumentRequestId(Long documentRequestId);

    List<Appointment> findByAppointmentDateAndStatus(LocalDate date, AppointmentStatus status);

    List<Appointment> findByAppointmentDateLessThanEqualAndStatusIn(LocalDate date, List<AppointmentStatus> statuses);

    List<Appointment> findByAppointmentDateOrderByAppointmentTimeAsc(LocalDate date);

    long countByAppointmentDate(LocalDate date);

    long countByStatus(AppointmentStatus status);

    @Query("SELECT a FROM Appointment a WHERE " +
           "(:date IS NULL OR a.appointmentDate = :date) AND " +
           "(:status IS NULL OR a.status = :status) " +
           "ORDER BY a.appointmentDate DESC, a.appointmentTime ASC")
    Page<Appointment> findFilteredAppointments(@Param("date") LocalDate date, 
                                              @Param("status") AppointmentStatus status, 
                                              Pageable pageable);
}
