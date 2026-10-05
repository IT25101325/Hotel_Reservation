package com.hotel.reservation.service;

import com.hotel.reservation.dto.ReservationRequest;
import com.hotel.reservation.entity.*;
import com.hotel.reservation.exception.DoubleBookingException;
import com.hotel.reservation.exception.ResourceNotFoundException;
import com.hotel.reservation.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private VenueRoomRepository venueRoomRepository;

    @Mock
    private EventPackageRepository eventPackageRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private ActivityLogRepository activityLogRepository;

    @InjectMocks
    private ReservationService reservationService;

    private User sampleUser;
    private Customer sampleCustomer;
    private VenueRoom sampleVenue;
    private EventPackage samplePackage;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setUsername("testuser");
        sampleUser.setFullName("Test User");
        sampleUser.setEmail("test@example.com");
        sampleUser.setPhone("0771234567");
        sampleUser.setRole(RoleName.ROLE_CUSTOMER);

        sampleCustomer = new Customer();
        sampleCustomer.setId(1L);
        sampleCustomer.setUser(sampleUser);
        sampleCustomer.setPassportOrNic("200012345678");

        sampleVenue = new VenueRoom();
        sampleVenue.setId(10L);
        sampleVenue.setName("Grand Ballroom");
        sampleVenue.setType("BANQUET_HALL");
        sampleVenue.setCategory("GRAND_BALLROOM");
        sampleVenue.setPricePerNight(new BigDecimal("1000.00"));
        sampleVenue.setAvailable(true);

        samplePackage = new EventPackage();
        samplePackage.setId(20L);
        samplePackage.setName("Silver Banquet");
        samplePackage.setPrice(new BigDecimal("500.00"));
        samplePackage.setPublished(true);
    }

    @Test
    @DisplayName("Should successfully create a reservation with correct price calculation")
    void testCreateReservationSuccess() {
        ReservationRequest request = new ReservationRequest();
        request.setVenueRoomId(10L);
        request.setEventPackageId(20L);
        request.setStartDate(LocalDate.now().plusDays(5));
        request.setEndDate(LocalDate.now().plusDays(8)); // 3 nights
        request.setGuestCount(100);
        request.setSpecialNotes("Window side arrangement");

        when(customerRepository.findByUserUsername("testuser")).thenReturn(Optional.of(sampleCustomer));
        when(venueRoomRepository.findById(10L)).thenReturn(Optional.of(sampleVenue));
        when(eventPackageRepository.findById(20L)).thenReturn(Optional.of(samplePackage));
        when(reservationRepository.findOverlappingReservations(eq(10L), any(), any())).thenReturn(Collections.emptyList());
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Reservation result = reservationService.createReservation("testuser", request);

        assertThat(result).isNotNull();
        assertThat(result.getCustomer()).isEqualTo(sampleCustomer);
        assertThat(result.getVenueRoom()).isEqualTo(sampleVenue);
        assertThat(result.getEventPackage()).isEqualTo(samplePackage);
        // (3 nights * 1000) + 500 = 3500.00
        assertThat(result.getTotalAmount()).isEqualByComparingTo(new BigDecimal("3500.00"));
        assertThat(result.getStatus()).isEqualTo(ReservationStatus.APPROVED);
        verify(notificationRepository, times(1)).save(any(Notification.class));
        verify(activityLogRepository, times(1)).save(any(ActivityLog.class));
    }

    @Test
    @DisplayName("Should prevent double-booking when overlapping reservation exists")
    void testDoubleBookingPrevention() {
        ReservationRequest request = new ReservationRequest();
        request.setVenueRoomId(10L);
        request.setStartDate(LocalDate.now().plusDays(2));
        request.setEndDate(LocalDate.now().plusDays(5));
        request.setGuestCount(50);

        when(customerRepository.findByUserUsername("testuser")).thenReturn(Optional.of(sampleCustomer));
        when(venueRoomRepository.findById(10L)).thenReturn(Optional.of(sampleVenue));

        Reservation existingOverlap = new Reservation();
        existingOverlap.setId(99L);
        existingOverlap.setStartDate(LocalDate.now().plusDays(1));
        existingOverlap.setEndDate(LocalDate.now().plusDays(4));
        when(reservationRepository.findOverlappingReservations(eq(10L), any(), any()))
                .thenReturn(List.of(existingOverlap));

        assertThatThrownBy(() -> reservationService.createReservation("testuser", request))
                .isInstanceOf(DoubleBookingException.class)
                .hasMessageContaining("Double Booking Conflict");

        verify(reservationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should approve reservation, trigger payment creation, and send notification")
    void testApproveReservation() {
        Reservation pending = new Reservation(
                sampleCustomer, sampleVenue, samplePackage,
                LocalDate.now().plusDays(10), LocalDate.now().plusDays(12),
                50, "Notes", new BigDecimal("2500.00")
        );
        pending.setId(101L);

        when(reservationRepository.findById(101L)).thenReturn(Optional.of(pending));
        when(reservationRepository.findOverlappingReservationsExcludingId(eq(10L), any(), any(), eq(101L)))
                .thenReturn(Collections.emptyList());
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(i -> i.getArgument(0));
        when(paymentRepository.findByReservationId(101L)).thenReturn(Optional.empty());

        Reservation approved = reservationService.approveReservation(101L, "supervisor");

        assertThat(approved.getStatus()).isEqualTo(ReservationStatus.APPROVED);
        verify(paymentRepository, times(1)).save(any(Payment.class));
        verify(notificationRepository, times(1)).save(any(Notification.class));
        verify(activityLogRepository, times(1)).save(any(ActivityLog.class));
    }

    @Test
    @DisplayName("Should transition to CANCEL_REQUESTED when customer requests cancellation")
    void testRequestCancellation() {
        Reservation confirmed = new Reservation(
                sampleCustomer, sampleVenue, samplePackage,
                LocalDate.now().plusDays(10), LocalDate.now().plusDays(12),
                50, "Notes", new BigDecimal("2500.00")
        );
        confirmed.setId(102L);
        confirmed.setStatus(ReservationStatus.CONFIRMED);

        when(reservationRepository.findById(102L)).thenReturn(Optional.of(confirmed));
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(sampleUser));
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(i -> i.getArgument(0));

        Reservation result = reservationService.requestCancellation(102L, "testuser");

        assertThat(result.getStatus()).isEqualTo(ReservationStatus.CANCEL_REQUESTED);
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    @DisplayName("Should approve cancellation and transition status to CANCELLED")
    void testApproveCancellation() {
        Reservation requested = new Reservation(
                sampleCustomer, sampleVenue, samplePackage,
                LocalDate.now().plusDays(10), LocalDate.now().plusDays(12),
                50, "Notes", new BigDecimal("2500.00")
        );
        requested.setId(103L);
        requested.setStatus(ReservationStatus.CANCEL_REQUESTED);

        when(reservationRepository.findById(103L)).thenReturn(Optional.of(requested));
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(i -> i.getArgument(0));

        Reservation result = reservationService.approveCancellation(103L, "supervisor");

        assertThat(result.getStatus()).isEqualTo(ReservationStatus.CANCELLED);
        verify(notificationRepository, times(1)).save(any(Notification.class));
        verify(activityLogRepository, times(1)).save(any(ActivityLog.class));
    }

    @Test
    @DisplayName("Should reject cancellation and revert status to APPROVED or CONFIRMED")
    void testRejectCancellation() {
        Reservation requested = new Reservation(
                sampleCustomer, sampleVenue, samplePackage,
                LocalDate.now().plusDays(10), LocalDate.now().plusDays(12),
                50, "Notes", new BigDecimal("2500.00")
        );
        requested.setId(104L);
        requested.setStatus(ReservationStatus.CANCEL_REQUESTED);

        when(reservationRepository.findById(104L)).thenReturn(Optional.of(requested));
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(i -> i.getArgument(0));
        when(paymentRepository.findByReservationId(104L)).thenReturn(Optional.empty());

        Reservation result = reservationService.rejectCancellation(104L, "Too close to event", "supervisor");

        assertThat(result.getStatus()).isEqualTo(ReservationStatus.APPROVED);
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }
}
