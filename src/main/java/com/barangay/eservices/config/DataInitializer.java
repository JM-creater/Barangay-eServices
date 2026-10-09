package com.barangay.eservices.config;

import com.barangay.eservices.modules.appointments.entity.AppointmentSlot;
import com.barangay.eservices.modules.appointments.repository.AppointmentSlotRepository;
import com.barangay.eservices.modules.catalog.entity.ServiceItem;
import com.barangay.eservices.modules.catalog.entity.ServiceRequirement;
import com.barangay.eservices.modules.catalog.repository.ServiceItemRepository;
import com.barangay.eservices.modules.users.entity.Role;
import com.barangay.eservices.modules.users.entity.RoleName;
import com.barangay.eservices.modules.users.entity.User;
import com.barangay.eservices.modules.users.repository.RoleRepository;
import com.barangay.eservices.modules.users.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final ServiceItemRepository serviceRepository;
    private final AppointmentSlotRepository slotRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.barangay.eservices.modules.appointments.repository.HolidayRepository holidayRepository;

    public DataInitializer(RoleRepository roleRepository,
                           UserRepository userRepository,
                           ServiceItemRepository serviceRepository,
                           AppointmentSlotRepository slotRepository,
                           PasswordEncoder passwordEncoder,
                           com.barangay.eservices.modules.appointments.repository.HolidayRepository holidayRepository) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.serviceRepository = serviceRepository;
        this.slotRepository = slotRepository;
        this.passwordEncoder = passwordEncoder;
        this.holidayRepository = holidayRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        logger.info("Initializing Barangay e-Services default system data...");

        // 1. Initialize Holidays
        initHolidays();

        // 2. Initialize Roles
        Role residentRole = initRole(RoleName.ROLE_RESIDENT);
        Role staffRole = initRole(RoleName.ROLE_STAFF);
        Role approverRole = initRole(RoleName.ROLE_APPROVER);
        Role adminRole = initRole(RoleName.ROLE_ADMIN);

        // 2. Initialize Admin User
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("garadomartin56@gmail.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFirstName("Barangay");
            admin.setLastName("Administrator");
            admin.setContactNumber("09171234567");
            admin.setAddress("Barangay Hall, Cansojong, Talisay City, Cebu");
            admin.setAccountStatus("ACTIVE");
            admin.setRoles(new HashSet<>(Set.of(adminRole, staffRole, approverRole)));
            userRepository.save(admin);
            logger.info("Created default administrator: admin / admin123");
        }

        // 3. Initialize Staff User
        if (!userRepository.existsByUsername("staff")) {
            User staff = new User();
            staff.setUsername("staff");
            staff.setEmail("staff@cansojong.talisaycity.gov.ph");
            staff.setPassword(passwordEncoder.encode("staff123"));
            staff.setFirstName("Maria");
            staff.setMiddleName("Santos");
            staff.setLastName("Lim");
            staff.setContactNumber("09181234567");
            staff.setAddress("Purok Mangga, Cansojong, Talisay City, Cebu");
            staff.setAccountStatus("ACTIVE");
            staff.setRoles(new HashSet<>(Set.of(staffRole)));
            userRepository.save(staff);
            logger.info("Created default staff user: staff / staff123");
        }

        // 4. Initialize Approver User (e.g. Barangay Captain / Secretary)
        if (!userRepository.existsByUsername("approver")) {
            User approver = new User();
            approver.setUsername("approver");
            approver.setEmail("captain@cansojong.talisaycity.gov.ph");
            approver.setPassword(passwordEncoder.encode("approver123"));
            approver.setFirstName("Hon. Roberto");
            approver.setMiddleName("Cruz");
            approver.setLastName("Fernandez");
            approver.setContactNumber("09191234567");
            approver.setAddress("Barangay Hall, Cansojong, Talisay City, Cebu");
            approver.setAccountStatus("ACTIVE");
            approver.setRoles(new HashSet<>(Set.of(approverRole, staffRole)));
            userRepository.save(approver);
            logger.info("Created default approver user: approver / approver123");
        }

        // 5. Initialize Resident User
        if (!userRepository.existsByUsername("resident")) {
            User resident = new User();
            resident.setUsername("resident");
            resident.setEmail("garadojosephmartin98@gmail.com");
            resident.setPassword(passwordEncoder.encode("resident123"));
            resident.setFirstName("Juan");
            resident.setMiddleName("Silayan");
            resident.setLastName("Dela Cruz");
            resident.setContactNumber("09201234567");
            resident.setAddress("Sitio Rattan, Cansojong, Talisay City, Cebu");
            resident.setAccountStatus("ACTIVE");
            resident.setRoles(new HashSet<>(Set.of(residentRole)));
            userRepository.save(resident);
            logger.info("Created default resident user: resident / resident123");
        }

        // 6. Initialize Services & Requirements
        initServices();

        // 7. Initialize Appointment Slots for next 14 weekdays
        initAppointmentSlots();

        logger.info("Barangay e-Services system initialization completed successfully.");
    }

    private Role initRole(RoleName roleName) {
        return roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(new Role(roleName)));
    }

    private void initServices() {
        // 1. Barangay Clearance
        if (!serviceRepository.existsByServiceCode("BC-CLEARANCE")) {
            ServiceItem clearance = new ServiceItem();
            clearance.setServiceCode("BC-CLEARANCE");
            clearance.setName("Barangay Clearance");
            clearance.setDescription("General clearance issued for employment, police clearance application, local travel, scholarship, or general identification purposes.");
            clearance.setFee(new BigDecimal("50.00"));
            clearance.setEstimatedProcessingDays(1);
            clearance.setInstructions("Please bring 1 valid government ID and 1 piece 2x2 or 1x1 recent photo during your office visit.");
            clearance.setIsActive(true);

            clearance.addRequirement(new ServiceRequirement("Valid Government ID", "Photocopy or scanned copy of SSS, PhilHealth, Driver License, Passport, or Voter ID", true));
            clearance.addRequirement(new ServiceRequirement("Recent 2x2 or 1x1 Photo", "Recent colored photo with white background", true));
            serviceRepository.save(clearance);
        }

        // 2. Certificate of Indigency
        if (!serviceRepository.existsByServiceCode("BC-INDIGENCY")) {
            ServiceItem indigency = new ServiceItem();
            indigency.setServiceCode("BC-INDIGENCY");
            indigency.setName("Certificate of Indigency");
            indigency.setDescription("Official certification for residents belonging to indigent or low-income families, typically required for medical assistance (Malasakit/DSWD), burial assistance, legal aid (PAO), or school scholarships.");
            indigency.setFee(BigDecimal.ZERO);
            indigency.setEstimatedProcessingDays(1);
            indigency.setInstructions("Free of charge. Please present proof of low income or referral from barangay health/social worker.");
            indigency.setIsActive(true);

            indigency.addRequirement(new ServiceRequirement("Valid Government ID or Student ID", "Valid ID of the applicant or student", true));
            indigency.addRequirement(new ServiceRequirement("Hospital Summary / Prescription / Burial Contract", "Supporting document for financial/medical/burial assistance", false));
            serviceRepository.save(indigency);
        }

        // 3. Certificate of Residency
        if (!serviceRepository.existsByServiceCode("BC-RESIDENCY")) {
            ServiceItem residency = new ServiceItem();
            residency.setServiceCode("BC-RESIDENCY");
            residency.setName("Certificate of Residency");
            residency.setDescription("Proof of bona fide residence within Barangay Cansojong, Talisay City, Cebu. Commonly required for bank accounts, passport application, DFA, utility meters, and school enrollment.");
            residency.setFee(new BigDecimal("50.00"));
            residency.setEstimatedProcessingDays(1);
            residency.setInstructions("Please bring proof of billing address (water, electric bill, or lease contract) and 1 valid ID.");
            residency.setIsActive(true);

            residency.addRequirement(new ServiceRequirement("Proof of Residence / Billing Statement", "Water/Electricity bill or Barangay Purok Certificate indicating Cansojong address", true));
            residency.addRequirement(new ServiceRequirement("Valid Government ID", "Valid government-issued ID showing full name", true));
            serviceRepository.save(residency);
        }

        // 4. Barangay Business Clearance
        if (!serviceRepository.existsByServiceCode("BC-BUSINESS")) {
            ServiceItem business = new ServiceItem();
            business.setServiceCode("BC-BUSINESS");
            business.setName("Barangay Business Clearance");
            business.setDescription("Mandatory barangay permit/clearance required prior to applying for or renewing a Talisay City Mayor’s Business Permit.");
            business.setFee(new BigDecimal("200.00"));
            business.setEstimatedProcessingDays(2);
            business.setInstructions("Attach DTI or SEC Registration, previous year business permit (if renewal), and contract of lease / proof of ownership.");
            business.setIsActive(true);

            business.addRequirement(new ServiceRequirement("DTI / SEC / CDA Registration", "Certificate of Business Name Registration", true));
            business.addRequirement(new ServiceRequirement("Contract of Lease or Tax Declaration", "Proof of business location in Barangay Cansojong", true));
            serviceRepository.save(business);
        }

        // 5. Certificate of Good Moral Character
        if (!serviceRepository.existsByServiceCode("BC-GOODMORAL")) {
            ServiceItem goodMoral = new ServiceItem();
            goodMoral.setServiceCode("BC-GOODMORAL");
            goodMoral.setName("Certificate of Good Moral Character");
            goodMoral.setDescription("Attests that the resident is of good moral standing and has no derogatory record or pending cases in the Lupong Tagapamayapa.");
            goodMoral.setFee(new BigDecimal("50.00"));
            goodMoral.setEstimatedProcessingDays(1);
            goodMoral.setInstructions("Must have no pending dispute in Barangay Cansojong Lupong Tagapamayapa.");
            goodMoral.setIsActive(true);

            goodMoral.addRequirement(new ServiceRequirement("Valid Government ID", "Official ID of resident", true));
            serviceRepository.save(goodMoral);
        }
    }

    private void initHolidays() {
        if (holidayRepository.count() == 0) {
            int year = LocalDate.now().getYear();
            List<com.barangay.eservices.modules.appointments.entity.Holiday> holidays = List.of(
                    new com.barangay.eservices.modules.appointments.entity.Holiday(LocalDate.of(year, 1, 1), "New Year's Day", "REGULAR", "National Regular Holiday"),
                    new com.barangay.eservices.modules.appointments.entity.Holiday(LocalDate.of(year, 1, 12), "Talisay City Charter Day", "LOCAL_EVENT", "Local Holiday in Talisay City"),
                    new com.barangay.eservices.modules.appointments.entity.Holiday(LocalDate.of(year, 4, 9), "Araw ng Kagitingan (Day of Valor)", "REGULAR", "National Regular Holiday"),
                    new com.barangay.eservices.modules.appointments.entity.Holiday(LocalDate.of(year, 5, 1), "Labor Day", "REGULAR", "National Regular Holiday"),
                    new com.barangay.eservices.modules.appointments.entity.Holiday(LocalDate.of(year, 6, 12), "Independence Day", "REGULAR", "Philippine Independence Day"),
                    new com.barangay.eservices.modules.appointments.entity.Holiday(LocalDate.of(year, 8, 31), "National Heroes Day", "REGULAR", "National Regular Holiday"),
                    new com.barangay.eservices.modules.appointments.entity.Holiday(LocalDate.of(year, 10, 15), "Barangay Cansojong Patronal Fiesta", "LOCAL_EVENT", "Barangay Cansojong Community Holiday"),
                    new com.barangay.eservices.modules.appointments.entity.Holiday(LocalDate.of(year, 11, 1), "All Saints' Day", "SPECIAL_NON_WORKING", "Special Non-Working Holiday"),
                    new com.barangay.eservices.modules.appointments.entity.Holiday(LocalDate.of(year, 11, 30), "Bonifacio Day", "REGULAR", "National Regular Holiday"),
                    new com.barangay.eservices.modules.appointments.entity.Holiday(LocalDate.of(year, 12, 25), "Christmas Day", "REGULAR", "National Regular Holiday"),
                    new com.barangay.eservices.modules.appointments.entity.Holiday(LocalDate.of(year, 12, 30), "Rizal Day", "REGULAR", "National Regular Holiday")
            );
            holidayRepository.saveAll(holidays);
            logger.info("Pre-seeded {} official holidays and non-working days for year {}", holidays.size(), year);
        }
    }

    private void initAppointmentSlots() {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusDays(13);

        // 1. Pre-fetch holidays in date range in 1 single query
        Set<LocalDate> holidayDates = holidayRepository.findByHolidayDateBetweenOrderByHolidayDateAsc(startDate, endDate)
                .stream()
                .map(com.barangay.eservices.modules.appointments.entity.Holiday::getHolidayDate)
                .collect(Collectors.toSet());

        // 2. Pre-fetch existing slots in date range in 1 single query
        Set<String> existingKeys = slotRepository.findBySlotDateBetweenAndIsActiveTrueOrderBySlotDateAscStartTimeAsc(startDate, endDate)
                .stream()
                .map(s -> s.getSlotDate().toString() + "_" + s.getStartTime().toString() + "_" + s.getEndTime().toString())
                .collect(Collectors.toSet());

        List<LocalTime> times = List.of(
                LocalTime.of(8, 0),
                LocalTime.of(9, 0),
                LocalTime.of(10, 0),
                LocalTime.of(11, 0),
                LocalTime.of(13, 0),
                LocalTime.of(14, 0),
                LocalTime.of(15, 0),
                LocalTime.of(16, 0)
        );

        List<AppointmentSlot> newSlots = new ArrayList<>();
        for (int i = 0; i < 14; i++) {
            LocalDate date = startDate.plusDays(i);
            // Skip weekends (Saturday = 6, Sunday = 7) and holidays
            if (date.getDayOfWeek().getValue() <= 5 && !holidayDates.contains(date)) {
                for (LocalTime startTime : times) {
                    LocalTime endTime = startTime.plusHours(1);
                    String key = date.toString() + "_" + startTime.toString() + "_" + endTime.toString();
                    if (!existingKeys.contains(key)) {
                        newSlots.add(new AppointmentSlot(date, startTime, endTime, 10));
                        existingKeys.add(key);
                    }
                }
            }
        }

        if (!newSlots.isEmpty()) {
            slotRepository.saveAll(newSlots);
            logger.info("Pre-seeded {} appointment slots for the next 14 days.", newSlots.size());
        }
    }
}
