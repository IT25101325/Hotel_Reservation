package com.hotel.reservation.service;

import com.hotel.reservation.dto.ReservationRequest;
import com.hotel.reservation.entity.*;
import com.hotel.reservation.exception.BadRequestException;
import com.hotel.reservation.exception.DoubleBookingException;
import com.hotel.reservation.exception.ResourceNotFoundException;
import com.hotel.reservation.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VenueRoomRepository venueRoomRepository;

    @Autowired
    private EventPackageRepository eventPackageRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Transactional
    public Reservation createReservation(String username, ReservationRequest request) {
        Customer customer = customerRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Customer account not found for username: " + username));

        VenueRoom venueRoom = venueRoomRepository.findById(request.getVenueRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Target venue/room with ID " + request.getVenueRoomId() + " does not exist."));

        if (request.getEndDate().isBefore(request.getStartDate()) || request.getEndDate().isEqual(request.getStartDate())) {
            throw new IllegalArgumentException("End date must be after start date.");
        }

        // Core double-booking prevention check (UC-04 & UC-02 extension 7a)
        List<Reservation> overlaps = reservationRepository.findOverlappingReservations(
                venueRoom.getId(), request.getStartDate(), request.getEndDate());

        if (!overlaps.isEmpty()) {
            throw new DoubleBookingException("Double Booking Conflict: " + venueRoom.getName() +
                    " is already reserved from " + overlaps.get(0).getStartDate() + " to " + overlaps.get(0).getEndDate() +
                    ". Please select alternative dates or room.");
        }

        EventPackage eventPackage = null;
        if (request.getEventPackageId() != null) {
            eventPackage = eventPackageRepository.findById(request.getEventPackageId())
                    .orElseThrow(() -> new ResourceNotFoundException("Selected event package not found."));
        }

        // Guest count validations (Min 1, max venue capacity, max package capacity)
        if (request.getGuestCount() == null || request.getGuestCount() < 2) {
            throw new BadRequestException("Guest count must be greater than 1 person.");
        }
        if (venueRoom.getCapacity() != null && request.getGuestCount() > venueRoom.getCapacity()) {
            throw new BadRequestException("Guest count (" + request.getGuestCount() + ") exceeds maximum capacity of " +
                    venueRoom.getName() + " (" + venueRoom.getCapacity() + " guests). Please select a larger venue.");
        }
        if (eventPackage != null && eventPackage.getMaxCapacity() != null && request.getGuestCount() > eventPackage.getMaxCapacity()) {
            throw new BadRequestException("Guest count (" + request.getGuestCount() + ") exceeds maximum capacity of selected package " +
                    eventPackage.getName() + " (" + eventPackage.getMaxCapacity() + " guests).");
        }

        // Price calculation: (Nights * Room rate) + Event Package Price
        long nights = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate());
        if (nights <= 0) nights = 1;

        BigDecimal roomCost = venueRoom.getPricePerNight().multiply(BigDecimal.valueOf(nights));
        BigDecimal packageCost = (eventPackage != null) ? eventPackage.getPrice() : BigDecimal.ZERO;
        BigDecimal totalAmount = roomCost.add(packageCost);

        Reservation reservation = new Reservation(
                customer,
                venueRoom,
                eventPackage,
                request.getStartDate(),
                request.getEndDate(),
                request.getGuestCount(),
                request.getSpecialNotes(),
                totalAmount
        );

        String primaryGuest = (request.getPrimaryGuestName() != null && !request.getPrimaryGuestName().isBlank()) 
                ? request.getPrimaryGuestName().trim() : customer.getUser().getFullName();
        String primaryEmail = (request.getPrimaryGuestEmail() != null && !request.getPrimaryGuestEmail().isBlank()) 
                ? request.getPrimaryGuestEmail().trim() : customer.getUser().getEmail();
        String primaryPhone = (request.getPrimaryGuestPhone() != null && !request.getPrimaryGuestPhone().isBlank()) 
                ? request.getPrimaryGuestPhone().trim() : customer.getUser().getPhone();
        String primaryId = (request.getPrimaryGuestId() != null && !request.getPrimaryGuestId().isBlank()) 
                ? request.getPrimaryGuestId().trim() : customer.getPassportOrNic();

        reservation.setPrimaryGuestName(primaryGuest);
        reservation.setPrimaryGuestEmail(primaryEmail);
        reservation.setPrimaryGuestPhone(primaryPhone);
        reservation.setPrimaryGuestId(primaryId);

        reservation.setStatus(ReservationStatus.APPROVED);
        Reservation savedReservation = reservationRepository.save(reservation);

        // Notify customer directly of approved reservation
        Notification notification = new Notification(
                customer.getUser(),
                "Reservation #" + savedReservation.getId() + " Approved & Confirmed!",
                "Your reservation for " + venueRoom.getName() + " from " + savedReservation.getStartDate() +
                " to " + savedReservation.getEndDate() + " has been approved and confirmed. Total: LKR " + savedReservation.getTotalAmount()
        );
        notificationRepository.save(notification);

        // Audit Log
        activityLogRepository.save(new ActivityLog(username, "CREATE_RESERVATION", "Created reservation #" + savedReservation.getId() + " for " + venueRoom.getName()));

        populatePaidStatus(savedReservation);
        return savedReservation;
    }

    public void populatePaidStatus(Reservation reservation) {
        if (reservation == null) return;
        boolean isPaid = reservation.getStatus() == ReservationStatus.CONFIRMED;
        reservation.setPaid(isPaid);
    }

    public List<Reservation> getCustomerReservations(String username) {
        List<Reservation> list = reservationRepository.findByCustomerUserUsernameOrderByCreatedAtDesc(username);
        list.forEach(this::populatePaidStatus);
        return list;
    }

    public List<Reservation> getAllReservations() {
        List<Reservation> list = reservationRepository.findAllByOrderByCreatedAtDesc();
        list.forEach(this::populatePaidStatus);
        return list;
    }

    public Reservation getReservationById(Long id) {
        Reservation res = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation #" + id + " not found."));
        populatePaidStatus(res);
        return res;
    }

    @Transactional
    public Reservation approveReservation(Long reservationId, String supervisorUsername) {
        Reservation reservation = getReservationById(reservationId);

        // Re-check double booking overlap before approval
        List<Reservation> overlaps = reservationRepository.findOverlappingReservationsExcludingId(
                reservation.getVenueRoom().getId(), reservation.getStartDate(), reservation.getEndDate(), reservationId);

        if (!overlaps.isEmpty()) {
            throw new DoubleBookingException("Cannot approve: Venue has conflicting booking for requested dates.");
        }

        reservation.setStatus(ReservationStatus.APPROVED);
        Reservation saved = reservationRepository.save(reservation);

        // Cross-cutting <<include>> 1: Process Payment entity
        Payment payment = paymentRepository.findByReservationId(reservationId).orElse(null);
        if (payment == null) {
            payment = new Payment(saved, saved.getTotalAmount(), "CREDIT_CARD", PaymentStatus.SUCCESS, "TXN-" + System.currentTimeMillis());
            paymentRepository.save(payment);
        } else {
            payment.setStatus(PaymentStatus.SUCCESS);
            paymentRepository.save(payment);
        }

        // Cross-cutting <<include>> 2: Send Notification to customer
        Notification notification = new Notification(
                reservation.getCustomer().getUser(),
                "Reservation #" + reservation.getId() + " Approved & Confirmed!",
                "Your booking for " + reservation.getVenueRoom().getName() + " from " + reservation.getStartDate() + " to " + reservation.getEndDate() + " has been approved. Payment status: SUCCESS."
        );
        notificationRepository.save(notification);

        // Log Activity
        activityLogRepository.save(new ActivityLog(supervisorUsername, "APPROVE_RESERVATION", "Approved reservation #" + reservationId));

        return saved;
    }

    @Transactional
    public Reservation rejectReservation(Long reservationId, String reason, String supervisorUsername) {
        Reservation reservation = getReservationById(reservationId);
        reservation.setStatus(ReservationStatus.REJECTED);
        Reservation saved = reservationRepository.save(reservation);

        // Send Notification
        Notification notification = new Notification(
                reservation.getCustomer().getUser(),
                "Reservation #" + reservation.getId() + " Rejected",
                "Your reservation request for " + reservation.getVenueRoom().getName() + " could not be approved. Reason: " + (reason != null ? reason : "Venue criteria not met.")
        );
        notificationRepository.save(notification);

        // Log Activity
        activityLogRepository.save(new ActivityLog(supervisorUsername, "REJECT_RESERVATION", "Rejected reservation #" + reservationId));

        return saved;
    }

    @Transactional
    public Reservation requestCancellation(Long reservationId, String username) {
        Reservation reservation = getReservationById(reservationId);

        // Verify ownership or supervisor/admin permission
        boolean isOwner = reservation.getCustomer().getUser().getUsername().equalsIgnoreCase(username)
                || reservation.getCustomer().getUser().getEmail().equalsIgnoreCase(username);
        User actingUser = userRepository.findByUsername(username).orElse(null);
        boolean isPrivileged = actingUser != null && 
                (actingUser.getRole() == RoleName.ROLE_ADMIN || actingUser.getRole() == RoleName.ROLE_RESERVATION_SUPERVISOR);

        if (!isOwner && !isPrivileged) {
            throw new BadRequestException("You are not authorized to request cancellation for this reservation.");
        }

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new BadRequestException("Reservation #" + reservationId + " is already cancelled.");
        }

        if (reservation.getStatus() == ReservationStatus.REJECTED) {
            throw new BadRequestException("Cannot cancel a reservation that is already rejected.");
        }

        if (reservation.getStatus() == ReservationStatus.CANCEL_REQUESTED) {
            throw new BadRequestException("Cancellation request has already been submitted and is pending supervisor approval.");
        }

        // Before-it rule: booking cannot be cancelled on or after start date
        if (reservation.getStartDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Cannot request cancellation for reservation #" + reservationId + " because its start date (" + reservation.getStartDate() + ") has already passed.");
        }

        reservation.setStatus(ReservationStatus.CANCEL_REQUESTED);
        Reservation saved = reservationRepository.save(reservation);
        populatePaidStatus(saved);

        Notification notification = new Notification(
                reservation.getCustomer().getUser(),
                "Cancellation Request Submitted",
                "Your cancellation request for Reservation #" + reservation.getId() + " (" + reservation.getVenueRoom().getName() + ") has been submitted. It will proceed to cancellation once approved by the Reservation Supervisor."
        );
        notificationRepository.save(notification);

        activityLogRepository.save(new ActivityLog(username, "REQUEST_CANCEL_RESERVATION", "Requested cancellation for reservation #" + reservationId));

        return saved;
    }

    @Transactional
    public Reservation approveCancellation(Long reservationId, String supervisorUsername) {
        Reservation reservation = getReservationById(reservationId);

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new BadRequestException("Reservation #" + reservationId + " is already cancelled.");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);

        // If payment was made, mark it refunded
        paymentRepository.findByReservationId(reservationId).ifPresent(p -> {
            if (p.getStatus() == PaymentStatus.SUCCESS) {
                p.setStatus(PaymentStatus.REFUNDED);
                paymentRepository.save(p);
            }
        });

        Reservation saved = reservationRepository.save(reservation);
        populatePaidStatus(saved);

        Notification notification = new Notification(
                reservation.getCustomer().getUser(),
                "Cancellation Approved - Reservation #" + reservation.getId(),
                "Your cancellation request for " + reservation.getVenueRoom().getName() + " has been APPROVED by the Reservation Supervisor. The reservation is now officially CANCELLED."
        );
        notificationRepository.save(notification);

        activityLogRepository.save(new ActivityLog(supervisorUsername, "APPROVE_CANCELLATION", "Approved cancellation for reservation #" + reservationId));

        return saved;
    }

    @Transactional
    public Reservation rejectCancellation(Long reservationId, String reason, String supervisorUsername) {
        Reservation reservation = getReservationById(reservationId);

        if (reservation.getStatus() != ReservationStatus.CANCEL_REQUESTED) {
            throw new BadRequestException("Reservation #" + reservationId + " does not have a pending cancellation request.");
        }

        // Revert status: if customer had paid, return to CONFIRMED, else APPROVED
        boolean wasPaid = paymentRepository.findByReservationId(reservationId)
                .map(p -> p.getStatus() == PaymentStatus.SUCCESS)
                .orElse(false);
        reservation.setStatus(wasPaid ? ReservationStatus.CONFIRMED : ReservationStatus.APPROVED);

        Reservation saved = reservationRepository.save(reservation);
        populatePaidStatus(saved);

        Notification notification = new Notification(
                reservation.getCustomer().getUser(),
                "Cancellation Request Declined",
                "Your cancellation request for Reservation #" + reservation.getId() + " was declined by the Reservation Supervisor. Reason: " + (reason != null ? reason : "Hotel reservation policies apply.")
        );
        notificationRepository.save(notification);

        activityLogRepository.save(new ActivityLog(supervisorUsername, "REJECT_CANCELLATION", "Declined cancellation request for reservation #" + reservationId));

        return saved;
    }

    @Transactional
    public Reservation cancelReservation(Long reservationId, String username) {
        Reservation reservation = getReservationById(reservationId);

        User actingUser = userRepository.findByUsername(username).orElse(null);
        boolean isPrivileged = actingUser != null && 
                (actingUser.getRole() == RoleName.ROLE_ADMIN || actingUser.getRole() == RoleName.ROLE_RESERVATION_SUPERVISOR);

        // If customer initiates cancel, route to requestCancellation (requires supervisor approval)
        if (!isPrivileged) {
            return requestCancellation(reservationId, username);
        }

        // Supervisor or Admin can directly cancel
        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new BadRequestException("Reservation #" + reservationId + " is already cancelled.");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        paymentRepository.findByReservationId(reservationId).ifPresent(p -> {
            if (p.getStatus() == PaymentStatus.SUCCESS) {
                p.setStatus(PaymentStatus.REFUNDED);
                paymentRepository.save(p);
            }
        });

        Reservation saved = reservationRepository.save(reservation);
        populatePaidStatus(saved);

        Notification notification = new Notification(
                reservation.getCustomer().getUser(),
                "Reservation #" + reservation.getId() + " Cancelled",
                "Your reservation #" + reservation.getId() + " for " + reservation.getVenueRoom().getName() + " has been cancelled by management."
        );
        notificationRepository.save(notification);

        activityLogRepository.save(new ActivityLog(username, "CANCEL_RESERVATION", "Cancelled reservation #" + reservationId));

        return saved;
    }

    @Transactional
    public Reservation updateReservation(Long reservationId, String username, ReservationRequest request) {
        Reservation reservation = getReservationById(reservationId);

        // Verify ownership or supervisor/admin permission
        boolean isOwner = reservation.getCustomer().getUser().getUsername().equalsIgnoreCase(username)
                || reservation.getCustomer().getUser().getEmail().equalsIgnoreCase(username);
        User actingUser = userRepository.findByUsername(username).orElse(null);
        boolean isPrivileged = actingUser != null && 
                (actingUser.getRole() == RoleName.ROLE_ADMIN || actingUser.getRole() == RoleName.ROLE_RESERVATION_SUPERVISOR);

        if (!isOwner && !isPrivileged) {
            throw new BadRequestException("You are not authorized to modify this reservation.");
        }

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new BadRequestException("Cannot modify a cancelled reservation.");
        }

        if (reservation.getStatus() == ReservationStatus.REJECTED) {
            throw new BadRequestException("Cannot modify a rejected reservation.");
        }

        if (reservation.getStatus() == ReservationStatus.CANCEL_REQUESTED) {
            throw new BadRequestException("Cannot modify reservation while a cancellation request is pending supervisor approval.");
        }

        // Before-it rule: cannot modify on or after existing start date
        if (reservation.getStartDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Cannot modify reservation #" + reservationId + " because its start date (" + reservation.getStartDate() + ") has already passed.");
        }

        if (request.getStartDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("New start date cannot be in the past.");
        }

        if (request.getEndDate().isBefore(request.getStartDate()) || request.getEndDate().isEqual(request.getStartDate())) {
            throw new IllegalArgumentException("End date must be strictly after start date.");
        }

        Long venueRoomId = request.getVenueRoomId() != null ? request.getVenueRoomId() : reservation.getVenueRoom().getId();
        VenueRoom venueRoom = venueRoomRepository.findById(venueRoomId)
                .orElseThrow(() -> new ResourceNotFoundException("Target venue/room with ID " + venueRoomId + " does not exist."));

        if (request.getGuestCount() != null) {
            if (request.getGuestCount() < 1) {
                throw new BadRequestException("Guest count must be at least 1 person.");
            }
            if (venueRoom.getCapacity() != null && request.getGuestCount() > venueRoom.getCapacity()) {
                throw new BadRequestException("Guest count (" + request.getGuestCount() + ") exceeds maximum capacity of " +
                        venueRoom.getName() + " (" + venueRoom.getCapacity() + " guests).");
            }
            Long targetPkgId = (request.getEventPackageId() != null && request.getEventPackageId() > 0) 
                    ? request.getEventPackageId() 
                    : (reservation.getEventPackage() != null ? reservation.getEventPackage().getId() : null);
            if (targetPkgId != null) {
                EventPackage pkg = eventPackageRepository.findById(targetPkgId).orElse(null);
                if (pkg != null && pkg.getMaxCapacity() != null && request.getGuestCount() > pkg.getMaxCapacity()) {
                    throw new BadRequestException("Guest count (" + request.getGuestCount() + ") exceeds maximum capacity of package " +
                            pkg.getName() + " (" + pkg.getMaxCapacity() + " guests).");
                }
            }
        }

        // Check if anything actually changed
        boolean datesSame = reservation.getStartDate().equals(request.getStartDate()) 
                && reservation.getEndDate().equals(request.getEndDate());
        boolean venueSame = reservation.getVenueRoom().getId().equals(venueRoomId);
        Long currentPkgId = reservation.getEventPackage() != null ? reservation.getEventPackage().getId() : null;
        Long newPkgId = (request.getEventPackageId() != null && request.getEventPackageId() > 0) ? request.getEventPackageId() : null;
        boolean packageSame = (currentPkgId == null && newPkgId == null) || (currentPkgId != null && currentPkgId.equals(newPkgId));
        boolean guestCountSame = reservation.getGuestCount() != null && reservation.getGuestCount().equals(request.getGuestCount());
        String currentNotes = reservation.getSpecialNotes() != null ? reservation.getSpecialNotes().trim() : "";
        String newNotes = request.getSpecialNotes() != null ? request.getSpecialNotes().trim() : "";
        boolean notesSame = currentNotes.equals(newNotes);

        // 1. If nothing changed at all: do not modify status or touch payment
        if (datesSame && venueSame && packageSame && guestCountSame && notesSame) {
            populatePaidStatus(reservation);
            return reservation;
        }

        // 2. If dates, venue, and package are identical (only guest count or special notes changed):
        // There is no booking conflict, room rate or package change.
        // Maintain existing status (e.g. CONFIRMED / APPROVED) so customer never has to pay again!
        if (datesSame && venueSame && packageSame) {
            reservation.setGuestCount(request.getGuestCount());
            reservation.setSpecialNotes(request.getSpecialNotes());
            if (request.getPrimaryGuestName() != null) reservation.setPrimaryGuestName(request.getPrimaryGuestName());
            if (request.getPrimaryGuestEmail() != null) reservation.setPrimaryGuestEmail(request.getPrimaryGuestEmail());
            if (request.getPrimaryGuestPhone() != null) reservation.setPrimaryGuestPhone(request.getPrimaryGuestPhone());
            if (request.getPrimaryGuestId() != null) reservation.setPrimaryGuestId(request.getPrimaryGuestId());
            Reservation saved = reservationRepository.save(reservation);
            populatePaidStatus(saved);
            return saved;
        }

        // 3. Core booking details (dates, venue, or package) changed: check overlaps and recalculate
        List<Reservation> overlaps = reservationRepository.findOverlappingReservationsExcludingId(
                venueRoom.getId(), request.getStartDate(), request.getEndDate(), reservationId);

        if (!overlaps.isEmpty()) {
            throw new DoubleBookingException("Double Booking Conflict: " + venueRoom.getName() +
                    " is already reserved from " + overlaps.get(0).getStartDate() + " to " + overlaps.get(0).getEndDate() +
                    ". Please select alternative dates.");
        }

        EventPackage eventPackage = null;
        if (request.getEventPackageId() != null && request.getEventPackageId() > 0) {
            eventPackage = eventPackageRepository.findById(request.getEventPackageId())
                    .orElse(null);
        }

        // Recalculate price: (Nights * Room rate) + Event Package Price
        long nights = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate());
        if (nights <= 0) nights = 1;

        BigDecimal roomCost = venueRoom.getPricePerNight().multiply(BigDecimal.valueOf(nights));
        BigDecimal packageCost = (eventPackage != null) ? eventPackage.getPrice() : BigDecimal.ZERO;
        BigDecimal totalAmount = roomCost.add(packageCost);

        reservation.setVenueRoom(venueRoom);
        reservation.setEventPackage(eventPackage);
        reservation.setStartDate(request.getStartDate());
        reservation.setEndDate(request.getEndDate());
        reservation.setGuestCount(request.getGuestCount());
        reservation.setSpecialNotes(request.getSpecialNotes());
        if (request.getPrimaryGuestName() != null) reservation.setPrimaryGuestName(request.getPrimaryGuestName());
        if (request.getPrimaryGuestEmail() != null) reservation.setPrimaryGuestEmail(request.getPrimaryGuestEmail());
        if (request.getPrimaryGuestPhone() != null) reservation.setPrimaryGuestPhone(request.getPrimaryGuestPhone());
        if (request.getPrimaryGuestId() != null) reservation.setPrimaryGuestId(request.getPrimaryGuestId());
        reservation.setTotalAmount(totalAmount);
        reservation.setStatus(ReservationStatus.APPROVED);

        // Since schedule (dates, venue, or package) actually changed, clear any previous payment
        // so the customer can pay for the newly rescheduled booking.
        paymentRepository.findByReservationId(reservationId).ifPresent(payment -> {
            paymentRepository.delete(payment);
        });

        Reservation saved = reservationRepository.save(reservation);
        populatePaidStatus(saved);

        Notification notification = new Notification(
                reservation.getCustomer().getUser(),
                "Reservation #" + reservation.getId() + " Modified & Approved",
                "Your reservation #" + reservation.getId() + " for " + venueRoom.getName() + " has been updated (New dates: " +
                        saved.getStartDate() + " to " + saved.getEndDate() + "). Status: APPROVED."
        );
        notificationRepository.save(notification);

        activityLogRepository.save(new ActivityLog(username, "UPDATE_RESERVATION", "Modified reservation #" + reservationId));

        return saved;
    }

    @Transactional
    public Reservation updateGuestInformation(Long reservationId, String username, ReservationRequest request) {
        Reservation reservation = getReservationById(reservationId);
        User actingUser = userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findByEmail(username)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username)));

        boolean isOwner = reservation.getCustomer().getUser().getUsername().equals(actingUser.getUsername());
        boolean isStaff = actingUser.getRole() == RoleName.ROLE_ADMIN || actingUser.getRole() == RoleName.ROLE_RESERVATION_SUPERVISOR;

        if (!isOwner && !isStaff) {
            throw new org.springframework.security.access.AccessDeniedException("You do not have permission to modify guest details for this booking.");
        }

        if (request.getPrimaryGuestName() != null) reservation.setPrimaryGuestName(request.getPrimaryGuestName().trim());
        if (request.getPrimaryGuestEmail() != null) reservation.setPrimaryGuestEmail(request.getPrimaryGuestEmail().trim());
        if (request.getPrimaryGuestPhone() != null) reservation.setPrimaryGuestPhone(request.getPrimaryGuestPhone().trim());
        if (request.getPrimaryGuestId() != null) reservation.setPrimaryGuestId(request.getPrimaryGuestId().trim());
        if (request.getGuestCount() != null) {
            if (request.getGuestCount() < 2) {
                throw new BadRequestException("Guest count must be at least 2 person.");
            }
            if (reservation.getVenueRoom() != null && reservation.getVenueRoom().getCapacity() != null 
                    && request.getGuestCount() > reservation.getVenueRoom().getCapacity() && request.getGuestCount() < 2) {
                throw new BadRequestException("wrong guest count insert the guest count again");
            }
            if (reservation.getEventPackage() != null && reservation.getEventPackage().getMaxCapacity() != null
                    && request.getGuestCount() > reservation.getEventPackage().getMaxCapacity()) {
                throw new BadRequestException("Guest count (" + request.getGuestCount() + ") exceeds maximum capacity of selected package " +
                        reservation.getEventPackage().getName() + " (" + reservation.getEventPackage().getMaxCapacity() + " guests).");
            }
            reservation.setGuestCount(request.getGuestCount());
        }

        Reservation saved = reservationRepository.save(reservation);
        populatePaidStatus(saved);

        activityLogRepository.save(new ActivityLog(username, "UPDATE_GUEST_INFO", "Updated guest information for reservation #" + reservationId));
        return saved;
    }
}
