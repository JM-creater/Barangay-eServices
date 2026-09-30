package com.barangay.eservices.modules.appointments.service;

import com.barangay.eservices.modules.appointments.dto.CreateHolidayRequest;
import com.barangay.eservices.modules.appointments.dto.HolidayDTO;

import java.time.LocalDate;
import java.util.List;

public interface HolidayService {

    List<HolidayDTO> getAllHolidays();

    List<HolidayDTO> getHolidaysBetween(LocalDate startDate, LocalDate endDate);

    HolidayDTO createHoliday(CreateHolidayRequest request);

    void deleteHoliday(Long id);

    boolean isHoliday(LocalDate date);
}
