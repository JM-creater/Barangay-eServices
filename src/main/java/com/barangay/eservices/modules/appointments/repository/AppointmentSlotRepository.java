package com.barangay.eservices.modules.appointments.repository;

import com.barangay.eservices.modules.appointments.entity.AppointmentSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentSlotRepository extends JpaRepository<AppointmentSlot, Long> {

    List<AppointmentSlot> findBySlotDateAndIsActiveTrueOrderByStartTimeAsc(LocalDate slotDate);

    List<AppointmentSlot> findBySlotDateBetweenAndIsActiveTrueOrderBySlotDateAscStartTimeAsc(LocalDate startDate, LocalDate endDate);

    Optional<AppointmentSlot> findBySlotDateAndStartTimeAndEndTime(LocalDate slotDate, LocalTime startTime, LocalTime endTime);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE AppointmentSlot s SET s.bookedCount = s.bookedCount + 1 WHERE s.id = :id AND s.bookedCount < s.maxCapacity AND s.isActive = true")
    int reserveSlotAtomically(@Param("id") Long id);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE AppointmentSlot s SET s.bookedCount = CASE WHEN s.bookedCount > 0 THEN s.bookedCount - 1 ELSE 0 END WHERE s.id = :id")
    int releaseSlotAtomically(@Param("id") Long id);
}
