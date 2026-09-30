package com.barangay.eservices.modules.appointments.service;

import com.barangay.eservices.exception.BadRequestException;
import com.barangay.eservices.exception.ResourceNotFoundException;
import com.barangay.eservices.modules.appointments.dto.CreateHolidayRequest;
import com.barangay.eservices.modules.appointments.dto.HolidayDTO;
import com.barangay.eservices.modules.appointments.entity.Holiday;
import com.barangay.eservices.modules.appointments.repository.HolidayRepository;
import com.barangay.eservices.modules.audit.service.AuditLogService;
import com.barangay.eservices.modules.users.entity.User;
import com.barangay.eservices.modules.users.repository.UserRepository;
import com.barangay.eservices.security.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HolidayServiceImpl implements HolidayService {

    @Autowired
    private HolidayRepository holidayRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public List<HolidayDTO> getAllHolidays() {
        return holidayRepository.findAllByOrderByHolidayDateAsc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HolidayDTO> getHolidaysBetween(LocalDate startDate, LocalDate endDate) {
        return holidayRepository.findByHolidayDateBetweenOrderByHolidayDateAsc(startDate, endDate).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public HolidayDTO createHoliday(CreateHolidayRequest request) {
        if (holidayRepository.existsByHolidayDate(request.getHolidayDate())) {
            throw new BadRequestException("Holiday already exists on " + request.getHolidayDate());
        }

        Holiday holiday = new Holiday(
                request.getHolidayDate(),
                request.getName(),
                request.getType() != null ? request.getType() : "REGULAR",
                request.getDescription()
        );

        Holiday saved = holidayRepository.save(holiday);

        Long currentUserId = SecurityUtil.getCurrentUserId();
        User currentUser = currentUserId != null ? userRepository.findById(currentUserId).orElse(null) : null;
        auditLogService.logAction(currentUser, "HOLIDAY_CREATED", "Holiday", saved.getId().toString(),
                "Added holiday: " + saved.getName() + " on " + saved.getHolidayDate());

        return toDTO(saved);
    }

    @Override
    @Transactional
    public void deleteHoliday(Long id) {
        Holiday holiday = holidayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Holiday", "id", id));

        Long currentUserId = SecurityUtil.getCurrentUserId();
        User currentUser = currentUserId != null ? userRepository.findById(currentUserId).orElse(null) : null;
        auditLogService.logAction(currentUser, "HOLIDAY_DELETED", "Holiday", id.toString(),
                "Removed holiday: " + holiday.getName() + " (" + holiday.getHolidayDate() + ")");

        holidayRepository.delete(holiday);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isHoliday(LocalDate date) {
        return holidayRepository.existsByHolidayDate(date);
    }

    private HolidayDTO toDTO(Holiday h) {
        return new HolidayDTO(
                h.getId(),
                h.getHolidayDate(),
                h.getName(),
                h.getType(),
                h.getDescription(),
                h.getCreatedAt()
        );
    }
}
