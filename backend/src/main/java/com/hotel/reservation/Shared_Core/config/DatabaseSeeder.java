package com.hotel.reservation.config;

import com.hotel.reservation.entity.*;
import com.hotel.reservation.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private VenueRoomRepository venueRoomRepository;

    @Autowired
    private EventPackageRepository eventPackageRepository;

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private com.hotel.reservation.repository.RoomCategoryRepository roomCategoryRepository;

    @Autowired
    private com.hotel.reservation.repository.FacilityRepository facilityRepository;

    @Autowired
    private com.hotel.reservation.repository.PromotionRepository promotionRepository;

    @Autowired
    private com.hotel.reservation.repository.EventScheduleRepository eventScheduleRepository;

    @Autowired
    private com.hotel.reservation.repository.StaffScheduleRepository staffScheduleRepository;

    @Autowired
    private com.hotel.reservation.repository.GuestRepository guestRepository;

    @Autowired
    private com.hotel.reservation.repository.InvoiceRepository invoiceRepository;

    @Autowired
    private com.hotel.reservation.repository.ReservationRepository reservationRepository;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            // Self-heal: ensure default system roles and valid password encoding remain intact across restarts
            List<String> coreUsers = Arrays.asList("admin", "supervisor", "eventmgr", "venuemgr", "hrmgr", "customer1", "customer2");
            for (String username : coreUsers) {
                userRepository.findByUsername(username).ifPresent(u -> {
                    boolean changed = false;
                    if ("admin".equals(username) && u.getRole() != RoleName.ROLE_ADMIN) {
                        u.setRole(RoleName.ROLE_ADMIN);
                        changed = true;
                    } else if ("supervisor".equals(username) && u.getRole() != RoleName.ROLE_RESERVATION_SUPERVISOR) {
                        u.setRole(RoleName.ROLE_RESERVATION_SUPERVISOR);
                        changed = true;
                    } else if ("eventmgr".equals(username) && u.getRole() != RoleName.ROLE_EVENT_COORDINATOR) {
                        u.setRole(RoleName.ROLE_EVENT_COORDINATOR);
                        changed = true;
                    } else if ("venuemgr".equals(username) && u.getRole() != RoleName.ROLE_VENUE_MANAGER) {
                        u.setRole(RoleName.ROLE_VENUE_MANAGER);
                        changed = true;
                    } else if ("hrmgr".equals(username) && u.getRole() != RoleName.ROLE_HR_MANAGER) {
                        u.setRole(RoleName.ROLE_HR_MANAGER);
                        changed = true;
                    }
                    if (u.getPassword() == null || !passwordEncoder.matches("password123", u.getPassword())) {
                        u.setPassword(passwordEncoder.encode("password123"));
                        changed = true;
                    }
                    if (changed) {
                        userRepository.save(u);
                    }
                });
            }
            seedSupplementaryData();
            return; // Core users already seeded
        }

        String defaultPass = passwordEncoder.encode("password123");

        // 1. Seed Users & Demo Accounts for ALL 6 Roles
        User adminUser = new User("admin", "admin@hotel.com", defaultPass, "General Manager Admin", "+94771234560", RoleName.ROLE_ADMIN);
        User customerUser = new User("customer1", "john.doe@gmail.com", defaultPass, "John Doe", "+94771234561", RoleName.ROLE_CUSTOMER);
        User supervisorUser = new User("supervisor", "supervisor@hotel.com", defaultPass, "Alice Smith", "+94771234562", RoleName.ROLE_RESERVATION_SUPERVISOR);
        User eventCoordUser = new User("eventmgr", "events@hotel.com", defaultPass, "Robert Brown", "+94771234563", RoleName.ROLE_EVENT_COORDINATOR);
        User venueMgrUser = new User("venuemgr", "venues@hotel.com", defaultPass, "Elena Vance", "+94771234564", RoleName.ROLE_VENUE_MANAGER);
        User hrMgrUser = new User("hrmgr", "hr@hotel.com", defaultPass, "David Miller", "+94771234565", RoleName.ROLE_HR_MANAGER);

        userRepository.saveAll(Arrays.asList(adminUser, customerUser, supervisorUser, eventCoordUser, venueMgrUser, hrMgrUser));

        // 2. Seed Customer Profile
        Customer customerProfile = new Customer(customerUser, "123 Palm Grove Ave, Colombo", "981234567V", "+94711111111", "High-floor room preferred, vegetarian catering");
        customerRepository.save(customerProfile);

        // 3. Seed Employee Profiles
        Employee emp1 = new Employee(adminUser, "EMP-001", "General Manager Admin", "Executive Admin", "General Manager", new BigDecimal("180000.00"), "+94771234560", LocalDate.now().minusYears(3));
        Employee emp2 = new Employee(supervisorUser, "EMP-002", "Alice Smith", "Reservation & Front Office", "Reservation Supervisor", new BigDecimal("95000.00"), "+94771234562", LocalDate.now().minusYears(2));
        Employee emp3 = new Employee(eventCoordUser, "EMP-003", "Robert Brown", "Event Coordination", "Event Manager", new BigDecimal("110000.00"), "+94771234563", LocalDate.now().minusYears(2));
        Employee emp4 = new Employee(venueMgrUser, "EMP-004", "Elena Vance", "Venue Operations", "Venue & Facilities Manager", new BigDecimal("105000.00"), "+94771234564", LocalDate.now().minusYears(1));
        Employee emp5 = new Employee(hrMgrUser, "EMP-005", "David Miller", "Human Resources", "HR & Resource Manager", new BigDecimal("115000.00"), "+94771234565", LocalDate.now().minusYears(4));

        employeeRepository.saveAll(Arrays.asList(emp1, emp2, emp3, emp4, emp5));

        // 4. Seed Venue & Room Inventory (UC-02)
        VenueRoom v1 = new VenueRoom("The Grand Royal Ballroom", "BANQUET_HALL", "GRAND_BALLROOM", 500, new BigDecimal("2500.00"), "Central AC, High-tech Audio/Visual, Stage, LED Screen, Catering Kitchen Access", "Luxury banquet hall ideal for grand weddings, gala dinners, and international conferences.", "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80", true);
        VenueRoom v2 = new VenueRoom("Emerald Oceanfront Garden", "GARDEN_VENUE", "GARDEN", 300, new BigDecimal("1800.00"), "Outdoor Lighting, Gazebo, Beach Access, Portable Stage, Sunset View", "Breathtaking outdoor oceanfront garden venue surrounded by tropical palms for romantic outdoor weddings.", "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=1200&q=80", true);
        VenueRoom v3 = new VenueRoom("Executive Pinnacle Suite", "ROOM", "SUITE", 4, new BigDecimal("450.00"), "King Size Bed, Jacuzzi, Private Balcony, High-speed Wi-Fi, Mini Bar", "Exclusive luxury suite offering panoramic views, living area, and premium amenities.", "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80", true);
        VenueRoom v4 = new VenueRoom("Sapphire Conference Center", "CONFERENCE_HALL", "EXECUTIVE", 120, new BigDecimal("950.00"), "Smart Projector, Hybrid Video Conferencing System, Soundproof Walls, Ergonomic Chairs", "State-of-the-art conference center tailored for corporate seminars, workshops, and business summits.", "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=1200&q=80", true);
        VenueRoom v5 = new VenueRoom("Deluxe Ocean View Room", "ROOM", "DELUXE", 2, new BigDecimal("220.00"), "Queen Bed, Sea View Balcony, Work Desk, Smart TV, Air Conditioning", "Comfortable deluxe room with stunning ocean vistas.", "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80", true);

        venueRoomRepository.saveAll(Arrays.asList(v1, v2, v3, v4, v5));

        // 5. Seed Event Packages (UC-03)
        EventPackage p1 = new EventPackage(
                "Royal Wedding Extravaganza",
                "WEDDING",
                "Complete luxury wedding package with floral decor, 5-course banquet meal, welcome drinks, and bridal suite stay.",
                new BigDecimal("4500.00"),
                350,
                true,
                10.0,
                "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
                Arrays.asList("5-Course Gourmet Buffet", "Premium Floral Decorations", "DJ & Live Band Sound System", "Complimentary Bridal Suite", "3-Tier Wedding Cake")
        );

        EventPackage p2 = new EventPackage(
                "Corporate Leadership Summit",
                "CONFERENCE",
                "All-inclusive professional package with technical setup, continuous coffee breaks, and executive lunch.",
                new BigDecimal("2200.00"),
                100,
                true,
                5.0,
                "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80",
                Arrays.asList("High-speed Wi-Fi & AV System", "Executive Buffet Lunch", "Morning & Afternoon Tea Breaks", "Stationery & Delegate Kits")
        );

        EventPackage p3 = new EventPackage(
                "Vip Birthday Jubilee",
                "BIRTHDAY",
                "Vibrant celebration package featuring themed decor, photo booth, cocktail bar, and custom birthday cake.",
                new BigDecimal("1500.00"),
                80,
                true,
                0.0,
                "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80",
                Arrays.asList("Themed Lighting & Backdrop", "Finger Food & Cocktail Bar", "360 Photo Booth", "Custom Birthday Cake")
        );

        // Draft / Unpublished Package to test publishing workflow
        EventPackage p4 = new EventPackage(
                "Gala Dinner Celebration (Draft)",
                "BANQUET",
                "Work in progress gala banquet package.",
                new BigDecimal("3000.00"),
                200,
                false, // Published = false
                0.0,
                "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
                Arrays.asList("Red Carpet Entrance", "Gala Table Setting")
        );

        eventPackageRepository.saveAll(Arrays.asList(p1, p2, p3, p4));

        // 6. Seed Announcements
        Announcement a1 = new Announcement("Welcome to the Hotel Special Events System!", "We are thrilled to launch our new online reservation portal for room and venue bookings.", "ALL");
        Announcement a2 = new Announcement("Staff Training Notice", "HR has scheduled a customer service training workshop next Monday at 10 AM.", "STAFF");

        announcementRepository.saveAll(Arrays.asList(a1, a2));
        seedSupplementaryData();
    }

    private void seedSupplementaryData() {
        // 7. Seed Room Categories if empty
        if (roomCategoryRepository.count() == 0) {
            roomCategoryRepository.saveAll(Arrays.asList(
                    new RoomCategory("Grand Banquet Ballroom", "BALLROOM", "High-capacity luxury event ballrooms", new BigDecimal("1.5"), true),
                    new RoomCategory("Executive Hall", "EXECUTIVE", "Modern conference halls with AV integration", new BigDecimal("1.2"), true),
                    new RoomCategory("Oceanfront Garden", "GARDEN", "Scenic outdoor landscapes for celebrations", new BigDecimal("1.3"), true),
                    new RoomCategory("Deluxe Room", "DELUXE", "Standard deluxe guest accommodation", new BigDecimal("1.0"), true),
                    new RoomCategory("Pinnacle Suite", "SUITE", "Premium luxury VIP suites", new BigDecimal("1.8"), true)
            ));
        }

        // 8. Seed Facilities if empty
        if (facilityRepository.count() == 0) {
            facilityRepository.saveAll(Arrays.asList(
                    new Facility("Central Air Conditioning", "Climate controlled environment", "COMFORT", "Wind"),
                    new Facility("High-Tech Audio & Visual", "Smart 4K projectors and surround microphones", "AUDIO_VISUAL", "Tv"),
                    new Facility("Gourmet Catering Kitchen", "Full commercial kitchen access for banquet preparation", "CATERING", "Utensils"),
                    new Facility("High-Speed Fiber Wi-Fi", "Dedicated gigabit wireless for corporate conferences", "CONNECTIVITY", "Wifi"),
                    new Facility("Beach & Gazebo Access", "Direct oceanfront pathway with illuminated gazebo", "OUTDOOR", "Sun")
            ));
        }

        // 9. Seed Promotions if empty
        if (promotionRepository.count() == 0) {
            promotionRepository.saveAll(Arrays.asList(
                    new Promotion("Grand Summer Celebration", "SUMMER20", 20.0, LocalDate.now().minusDays(5), LocalDate.now().plusMonths(2), "WEDDING", true),
                    new Promotion("Corporate Early Bird", "CORP15", 15.0, LocalDate.now().minusDays(10), LocalDate.now().plusMonths(3), "CONFERENCE", true),
                    new Promotion("VIP Birthday Jubilee", "BDAY10", 10.0, LocalDate.now().minusDays(2), LocalDate.now().plusMonths(1), "BIRTHDAY", true)
            ));
        }

        // 10. Seed Event Schedules if empty
        if (eventScheduleRepository.count() == 0 && eventPackageRepository.count() > 0 && venueRoomRepository.count() > 0) {
            EventPackage pkg = eventPackageRepository.findAll().get(0);
            VenueRoom venue = venueRoomRepository.findAll().get(0);
            eventScheduleRepository.saveAll(Arrays.asList(
                    new EventSchedule("Grand Royal Wedding Setup", pkg, venue, LocalDate.now().plusDays(3), "09:00", "15:00", "Robert Brown", "SCHEDULED", "Stage & floral decoration team arrival at 08:30"),
                    new EventSchedule("Corporate Leadership Summit Setup", pkg, venue, LocalDate.now().plusDays(7), "08:00", "17:00", "Robert Brown", "SCHEDULED", "AV testing and simultaneous interpretation setup")
            ));
        }

        // 11. Seed Staff Duty Schedules if empty
        if (staffScheduleRepository.count() == 0 && employeeRepository.count() > 0) {
            List<Employee> employees = employeeRepository.findAll();
            if (employees.size() >= 2) {
                staffScheduleRepository.saveAll(Arrays.asList(
                        new StaffSchedule(employees.get(1), "MORNING", LocalDate.now(), "08:00", "16:00", "Front desk and booking approvals", "ASSIGNED"),
                        new StaffSchedule(employees.get(2), "EVENT_DUTY", LocalDate.now().plusDays(1), "10:00", "19:00", "Overseeing Ballroom setup and package rehearsal", "ASSIGNED")
                ));
            }
        }

        // 12. Seed Guests under customer1 if empty
        if (guestRepository.count() == 0 && customerRepository.count() > 0) {
            Customer c = customerRepository.findAll().get(0);
            guestRepository.saveAll(Arrays.asList(
                    new Guest(c, "Jane Doe", "jane.doe@gmail.com", "+94771234568", "991234567V", "Spouse", "Vegetarian menu preferred"),
                    new Guest(c, "Michael Doe", "michael.doe@gmail.com", "+94771234569", "011234567V", "Child", "High chair required")
            ));
        }
    }
}
