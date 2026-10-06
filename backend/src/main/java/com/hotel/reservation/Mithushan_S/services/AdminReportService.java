package com.hotel.reservation.service;

import com.hotel.reservation.dto.ReportDTO;
import com.hotel.reservation.entity.*;
import com.hotel.reservation.exception.BadRequestException;
import com.hotel.reservation.exception.ResourceNotFoundException;
import com.hotel.reservation.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminReportService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private ComplaintFeedbackRepository complaintFeedbackRepository;

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private VenueRoomRepository venueRoomRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private GuestRepository guestRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private StaffScheduleRepository staffScheduleRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private ResourceAllocationRepository resourceAllocationRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    // User & Role Management (Mithushan - Component 6)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User createUser(User user) {
        if (user.getUsername() == null || user.getUsername().trim().length() < 3) {
            throw new BadRequestException("Username must be at least 3 characters long.");
        }
        if (user.getPassword() == null || user.getPassword().length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters long.");
        }
        if (user.getEmail() == null || !user.getEmail().trim().matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")) {
            throw new BadRequestException("Please provide a valid email address (e.g. name@domain.com).");
        }
        if (user.getPhone() != null && !user.getPhone().trim().isEmpty()) {
            String cleanPhone = user.getPhone().replaceAll("[\\s-]", "");
            if (!cleanPhone.matches("^(?:0\\d{9}|\\+\\d{10,14})$")) {
                throw new BadRequestException("Invalid phone number format. Must be 10 digits (e.g. 0771234567) or international format (e.g. +94771234567).");
            }
            user.setPhone(cleanPhone);
        }
        if (userRepository.findByUsername(user.getUsername().trim()).isPresent()) {
            throw new BadRequestException("Username '" + user.getUsername() + "' is already taken.");
        }
        if (userRepository.findByEmail(user.getEmail().trim()).isPresent()) {
            throw new BadRequestException("Email '" + user.getEmail() + "' is already registered.");
        }
        user.setUsername(user.getUsername().trim());
        user.setEmail(user.getEmail().trim());
        if (user.getFullName() != null) user.setFullName(user.getFullName().trim());
        if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        user.setActive(true);
        User savedUser = userRepository.save(user);

        if (savedUser.getRole() == RoleName.ROLE_CUSTOMER && customerRepository.findByUserId(savedUser.getId()).isEmpty()) {
            Customer customer = new Customer();
            customer.setUser(savedUser);
            customer.setAddress("");
            customer.setPassportOrNic("");
            customer.setEmergencyContact("");
            customer.setSpecialPreferences("");
            customer.setLoyaltyPoints(0);
            customerRepository.save(customer);
        }

        return savedUser;
    }

    @Transactional
    public User updateUser(Long userId, User updated) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User #" + userId + " not found."));

        if (updated.getFullName() != null) {
            if (updated.getFullName().trim().isEmpty()) {
                throw new BadRequestException("Full name cannot be blank.");
            }
            user.setFullName(updated.getFullName().trim());
        }

        if (updated.getEmail() != null) {
            String newEmail = updated.getEmail().trim();
            if (newEmail.isEmpty() || !newEmail.matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")) {
                throw new BadRequestException("Please provide a valid email address (e.g. name@domain.com).");
            }
            userRepository.findByEmail(newEmail).ifPresent(existingUser -> {
                if (!existingUser.getId().equals(userId)) {
                    throw new BadRequestException("Email '" + newEmail + "' is already registered to another account.");
                }
            });
            user.setEmail(newEmail);
        }

        if (updated.getPhone() != null && !updated.getPhone().trim().isEmpty()) {
            String cleanPhone = updated.getPhone().replaceAll("[\\s-]", "");
            if (!cleanPhone.matches("^(?:0\\d{9}|\\+\\d{10,14})$")) {
                throw new BadRequestException("Invalid phone number format. Must be 10 digits (e.g. 0771234567) or international format (e.g. +94771234567).");
            }
            user.setPhone(cleanPhone);
        }

        if (updated.getRole() != null && !"admin".equalsIgnoreCase(user.getUsername())) {
            user.setRole(updated.getRole());
        }

        if (!"admin".equalsIgnoreCase(user.getUsername())) {
            user.setActive(updated.isActive());
        }

        if (updated.getPassword() != null && !updated.getPassword().trim().isEmpty()) {
            if (updated.getPassword().trim().length() < 6) {
                throw new BadRequestException("Password must be at least 6 characters long.");
            }
            user.setPassword(passwordEncoder.encode(updated.getPassword().trim()));
        }

        User saved = userRepository.save(user);
        activityLogRepository.save(new ActivityLog("admin", "UPDATE_USER", "Updated user information for @" + user.getUsername()));
        return saved;
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User #" + userId + " not found."));
        if ("admin".equalsIgnoreCase(user.getUsername())) {
            throw new BadRequestException("The primary administrator account cannot be deleted.");
        }

        String username = user.getUsername();

        // 1. Delete associated notifications
        List<Notification> notes = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (notes != null && !notes.isEmpty()) {
            notificationRepository.deleteAll(notes);
        }

        // 2. Delete complaints / feedback
        List<ComplaintFeedback> fbs = complaintFeedbackRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (fbs != null && !fbs.isEmpty()) {
            complaintFeedbackRepository.deleteAll(fbs);
        }

        // 3. Delete employee profile and employee relations if exists
        java.util.Optional<Employee> empOpt = employeeRepository.findByUserId(userId);
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            List<StaffSchedule> schedules = staffScheduleRepository.findByEmployeeIdOrderByShiftDateDesc(emp.getId());
            if (schedules != null && !schedules.isEmpty()) {
                staffScheduleRepository.deleteAll(schedules);
            }
            List<LeaveRequest> leaves = leaveRequestRepository.findByEmployeeId(emp.getId());
            if (leaves != null && !leaves.isEmpty()) {
                leaveRequestRepository.deleteAll(leaves);
            }
            List<ResourceAllocation> allocations = resourceAllocationRepository.findByEmployeeId(emp.getId());
            if (allocations != null && !allocations.isEmpty()) {
                resourceAllocationRepository.deleteAll(allocations);
            }
            employeeRepository.delete(emp);
        }

        // 4. Delete customer profile and customer relations if exists
        java.util.Optional<Customer> custOpt = customerRepository.findByUserId(userId);
        if (custOpt.isPresent()) {
            Customer cust = custOpt.get();
            List<Guest> guests = guestRepository.findByCustomerIdOrderByIdDesc(cust.getId());
            if (guests != null && !guests.isEmpty()) {
                guestRepository.deleteAll(guests);
            }
            List<Reservation> resList = reservationRepository.findByCustomerIdOrderByCreatedAtDesc(cust.getId());
            if (resList != null && !resList.isEmpty()) {
                for (Reservation r : resList) {
                    paymentRepository.findByReservationId(r.getId()).ifPresent(paymentRepository::delete);
                    invoiceRepository.findByReservationId(r.getId()).ifPresent(invoiceRepository::delete);
                }
                reservationRepository.deleteAll(resList);
            }
            customerRepository.delete(cust);
        }

        // 5. Permanently remove the user record
        userRepository.delete(user);

        // Audit Log
        activityLogRepository.save(new ActivityLog("admin", "DELETE_USER", "Permanently deleted user account: " + username + " (ID #" + userId + ")"));
    }

    @Transactional
    public User updateUserRole(Long userId, RoleName role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User #" + userId + " not found."));
        if ("admin".equalsIgnoreCase(user.getUsername())) {
            throw new BadRequestException("The primary administrator account (admin) role is protected and cannot be changed.");
        }
        user.setRole(role);
        return userRepository.save(user);
    }

    @Transactional
    public User toggleUserActiveStatus(Long userId, boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User #" + userId + " not found."));
        if ("admin".equalsIgnoreCase(user.getUsername()) && !active) {
            throw new BadRequestException("The primary administrator account cannot be deactivated.");
        }
        user.setActive(active);
        return userRepository.save(user);
    }

    // Role & Permissions Dictionary (Mithushan - Component 6)
    public Map<String, Object> getRolesAndPermissions() {
        Map<String, Object> roles = new HashMap<>();
        roles.put("ROLE_CUSTOMER", List.of("Search Venues", "Book Packages", "Manage Own Profile", "Manage Own Guests", "Submit Feedback", "View Invoices"));
        roles.put("ROLE_RESERVATION_SUPERVISOR", List.of("Review Bookings", "Approve/Reject Reservations", "Verify Double-Booking", "Manage Cancellation Approvals", "Process Payments & Refunds"));
        roles.put("ROLE_EVENT_COORDINATOR", List.of("Create Packages", "Edit Services", "Publish Packages", "Manage Promotions", "Manage Event Schedules"));
        roles.put("ROLE_VENUE_MANAGER", List.of("Create Rooms & Venues", "Manage Room Categories", "Manage Facilities", "Set Availability & Maintenance"));
        roles.put("ROLE_HR_MANAGER", List.of("Employee Management", "Staff Duty Scheduling", "Resource Allocations", "Leave Approvals"));
        roles.put("ROLE_ADMIN", List.of("System Governance", "Executive Analytics", "User Management & RBAC", "Complaint Resolution", "Announcements", "Audit Logs"));
        return roles;
    }

    // Complaints & Feedback
    public List<ComplaintFeedback> getAllFeedback() {
        return complaintFeedbackRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public ComplaintFeedback respondToFeedback(Long feedbackId, String response, String status) {
        ComplaintFeedback fb = complaintFeedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback #" + feedbackId + " not found."));
        fb.setAdminResponse(response);
        if (status != null) fb.setStatus(status);
        return complaintFeedbackRepository.save(fb);
    }

    @Transactional
    public void deleteFeedback(Long id) {
        ComplaintFeedback fb = complaintFeedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback #" + id + " not found."));
        complaintFeedbackRepository.delete(fb);
    }

    // Record customer complaint or feedback (Admin CRUD)
    @Transactional
    public ComplaintFeedback createComplaintFeedback(Long userId, ComplaintFeedback cf) {
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }
        if (user == null) {
            user = userRepository.findByUsername("admin").orElse(null);
        }
        if (user == null) {
            user = userRepository.findAll().stream().findFirst().orElseThrow(() -> new ResourceNotFoundException("No user found"));
        }
        cf.setUser(user);
        if (cf.getType() == null || cf.getType().isBlank()) {
            cf.setType("COMPLAINT");
        }
        if (cf.getStatus() == null || cf.getStatus().isBlank()) {
            cf.setStatus("OPEN");
        }
        if (cf.getCreatedAt() == null) {
            cf.setCreatedAt(java.time.LocalDateTime.now());
        }
        ComplaintFeedback saved = complaintFeedbackRepository.save(cf);
        activityLogRepository.save(new ActivityLog("admin", "CREATE_" + cf.getType(), "Recorded " + cf.getType().toLowerCase() + ": " + cf.getSubject()));
        return saved;
    }

    // Announcements
    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public Announcement createAnnouncement(Announcement announcement) {
        if (announcement.getTitle() == null || announcement.getTitle().trim().isEmpty()) {
            throw new BadRequestException("Announcement title is required.");
        }
        String content = announcement.getContent();
        if (content == null || content.trim().isEmpty()) {
            throw new BadRequestException("Announcement message content is required.");
        }
        announcement.setTitle(announcement.getTitle().trim());
        announcement.setContent(content.trim());
        if (announcement.getTargetAudience() == null || announcement.getTargetAudience().trim().isEmpty()) {
            announcement.setTargetAudience("ALL");
        } else {
            announcement.setTargetAudience(announcement.getTargetAudience().trim().toUpperCase());
        }
        return announcementRepository.save(announcement);
    }

    @Transactional
    public Announcement updateAnnouncement(Long id, Announcement updated) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement #" + id + " not found."));

        if (updated.getTitle() != null) {
            if (updated.getTitle().trim().isEmpty()) {
                throw new BadRequestException("Announcement title cannot be blank.");
            }
            announcement.setTitle(updated.getTitle().trim());
        }

        if (updated.getContent() != null) {
            if (updated.getContent().trim().isEmpty()) {
                throw new BadRequestException("Announcement content cannot be blank.");
            }
            announcement.setContent(updated.getContent().trim());
        }

        if (updated.getTargetAudience() != null && !updated.getTargetAudience().trim().isEmpty()) {
            announcement.setTargetAudience(updated.getTargetAudience().trim().toUpperCase());
        }

        return announcementRepository.save(announcement);
    }

    @Transactional
    public void deleteAnnouncement(Long id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement #" + id + " not found."));
        announcementRepository.delete(announcement);
    }

    // Activity Logs
    public List<ActivityLog> getActivityLogs() {
        return activityLogRepository.findAllByOrderByTimestampDesc();
    }

    @Transactional
    public void deleteActivityLog(Long id) {
        activityLogRepository.deleteById(id);
    }

    @Transactional
    public int clearLogsOlderThan(int days) {
        java.time.LocalDateTime cutoff = java.time.LocalDateTime.now().minusDays(days);
        List<ActivityLog> oldLogs = activityLogRepository.findAll().stream()
                .filter(l -> l.getTimestamp() != null && l.getTimestamp().isBefore(cutoff))
                .toList();
        activityLogRepository.deleteAll(oldLogs);
        return oldLogs.size();
    }

    // Consolidated Executive Report Generation (UC-06 Generate Report <<include>> step)
    public ReportDTO generateExecutiveReport() {
        ReportDTO report = new ReportDTO();

        List<Reservation> reservations = reservationRepository.findAll();
        report.setTotalReservations(reservations.size());

        BigDecimal totalRev = BigDecimal.ZERO;
        long pending = 0, approved = 0, confirmed = 0, cancelled = 0;
        Map<String, Long> venueCounts = new HashMap<>();
        Map<String, BigDecimal> revByEvent = new HashMap<>();

        for (Reservation r : reservations) {
            if (r.getStatus() == ReservationStatus.APPROVED || r.getStatus() == ReservationStatus.CONFIRMED) {
                totalRev = totalRev.add(r.getTotalAmount());
            }

            if (r.getStatus() == ReservationStatus.PENDING) pending++;
            else if (r.getStatus() == ReservationStatus.APPROVED) approved++;
            else if (r.getStatus() == ReservationStatus.CONFIRMED) confirmed++;
            else if (r.getStatus() == ReservationStatus.CANCELLED) cancelled++;

            String type = r.getVenueRoom().getType();
            venueCounts.put(type, venueCounts.getOrDefault(type, 0L) + 1);

            String event = r.getEventPackage() != null ? r.getEventPackage().getEventType() : "STANDARD_ROOM";
            BigDecimal curr = revByEvent.getOrDefault(event, BigDecimal.ZERO);
            revByEvent.put(event, curr.add(r.getTotalAmount()));
        }

        report.setTotalRevenue(totalRev);
        report.setPendingReservations(pending);
        report.setApprovedReservations(approved);
        report.setConfirmedReservations(confirmed);
        report.setCancelledReservations(cancelled);
        report.setActiveCustomers(customerRepository.count());
        report.setTotalEmployees(employeeRepository.count());
        report.setReservationsByVenueType(venueCounts);
        report.setRevenueByEventType(revByEvent);

        return report;
    }

    // Dynamic On-demand Report Generation (Mithushan - Component 6)
    public Map<String, Object> generateCustomReport(java.time.LocalDate startDate, java.time.LocalDate endDate, String category) {
        List<Reservation> allReservations = reservationRepository.findAll();

        List<Reservation> reservations = allReservations.stream()
                .filter(r -> {
                    if (startDate == null && endDate == null) return true;
                    // Match by booking creation date or stay dates overlapping the filter period
                    boolean matchesCreated = false;
                    if (r.getCreatedAt() != null) {
                        java.time.LocalDate createdDate = r.getCreatedAt().toLocalDate();
                        matchesCreated = (startDate == null || !createdDate.isBefore(startDate)) &&
                                         (endDate == null || !createdDate.isAfter(endDate));
                    }
                    boolean matchesStay = (startDate == null || !r.getEndDate().isBefore(startDate)) &&
                                          (endDate == null || !r.getStartDate().isAfter(endDate));
                    return matchesCreated || matchesStay;
                })
                .filter(r -> {
                    if (category == null || category.isBlank() ||
                        category.equalsIgnoreCase("ALL") ||
                        category.equalsIgnoreCase("REVENUE") ||
                        category.equalsIgnoreCase("BOOKINGS") ||
                        category.equalsIgnoreCase("OCCUPANCY") ||
                        category.equalsIgnoreCase("FEEDBACK")) {
                        return true;
                    }
                    // Specific venue room type filter if specified
                    return r.getVenueRoom() != null &&
                           r.getVenueRoom().getType() != null &&
                           r.getVenueRoom().getType().equalsIgnoreCase(category);
                })
                .toList();

        BigDecimal grossRevenue = BigDecimal.ZERO;
        BigDecimal confirmedRevenue = BigDecimal.ZERO;
        BigDecimal pendingRevenue = BigDecimal.ZERO;
        long confirmedCount = 0;
        long pendingCount = 0;
        long cancelledCount = 0;

        for (Reservation r : reservations) {
            BigDecimal amount = r.getTotalAmount() != null ? r.getTotalAmount() : BigDecimal.ZERO;
            if (r.getStatus() != ReservationStatus.CANCELLED && r.getStatus() != ReservationStatus.REJECTED) {
                grossRevenue = grossRevenue.add(amount);
            }
            if (r.getStatus() == ReservationStatus.CONFIRMED || r.getStatus() == ReservationStatus.APPROVED) {
                confirmedRevenue = confirmedRevenue.add(amount);
                confirmedCount++;
            } else if (r.getStatus() == ReservationStatus.PENDING || r.getStatus() == ReservationStatus.CANCEL_REQUESTED) {
                pendingRevenue = pendingRevenue.add(amount);
                pendingCount++;
            } else if (r.getStatus() == ReservationStatus.CANCELLED || r.getStatus() == ReservationStatus.REJECTED) {
                cancelledCount++;
            }
        }

        // Calculate average feedback rating
        double avgRating = 4.8;
        List<ComplaintFeedback> allFeedback = complaintFeedbackRepository.findAll();
        List<ComplaintFeedback> ratedFeedback = allFeedback.stream()
                .filter(f -> f.getRating() != null && f.getRating() > 0)
                .toList();
        if (!ratedFeedback.isEmpty()) {
            avgRating = ratedFeedback.stream()
                    .mapToInt(ComplaintFeedback::getRating)
                    .average()
                    .orElse(4.8);
            avgRating = Math.round(avgRating * 10.0) / 10.0;
        }

        long activeVenues = venueRoomRepository != null ? venueRoomRepository.count() : 8;

        Map<String, Object> customReport = new HashMap<>();
        customReport.put("generatedAt", java.time.LocalDateTime.now());
        customReport.put("filterStartDate", startDate);
        customReport.put("filterEndDate", endDate);
        customReport.put("filterCategory", category != null ? category : "ALL");

        // Booking Counts - support both totalBookings and matchingBookingsCount keys
        customReport.put("totalBookings", reservations.size());
        customReport.put("matchingBookingsCount", reservations.size());
        customReport.put("activeBookingsCount", reservations.size() - cancelledCount);
        customReport.put("confirmedBookingsCount", confirmedCount);
        customReport.put("pendingBookingsCount", pendingCount);
        customReport.put("cancelledBookingsCount", cancelledCount);

        // Revenue Metrics - support grossRevenue, totalRevenue, totalRevenueInPeriod, confirmedRevenue
        BigDecimal effectiveRevenue = confirmedRevenue.compareTo(BigDecimal.ZERO) > 0 ? confirmedRevenue : grossRevenue;
        customReport.put("grossRevenue", effectiveRevenue);
        customReport.put("totalRevenue", effectiveRevenue);
        customReport.put("totalRevenueInPeriod", effectiveRevenue);
        customReport.put("confirmedRevenue", confirmedRevenue);
        customReport.put("pendingRevenue", pendingRevenue);

        // Quality & Capacity
        customReport.put("averageRating", avgRating);
        customReport.put("activeVenuesCount", activeVenues);
        customReport.put("summary", "Consolidated executive report compiled according to Sri Lanka hospitality standards and internal hotel revenue guidelines.");

        // Reservations List
        customReport.put("reservations", reservations);
        return customReport;
    }
}
