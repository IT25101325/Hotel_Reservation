package com.hotel.reservation.service;

import com.hotel.reservation.dto.PaymentRequest;
import com.hotel.reservation.entity.*;
import com.hotel.reservation.exception.BadRequestException;
import com.hotel.reservation.repository.NotificationRepository;
import com.hotel.reservation.repository.PaymentRepository;
import com.hotel.reservation.repository.ReservationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private PaymentService paymentService;

    private Reservation sampleReservation;

    @BeforeEach
    void setUp() {
        User user = new User();
        user.setId(1L);
        user.setUsername("customer1");
        user.setFullName("Customer One");

        Customer customer = new Customer();
        customer.setId(1L);
        customer.setUser(user);

        VenueRoom venue = new VenueRoom();
        venue.setId(1L);
        venue.setName("Grand Hall");

        sampleReservation = new Reservation(
                customer, venue, null,
                LocalDate.now().plusDays(2), LocalDate.now().plusDays(4),
                100, "Notes", new BigDecimal("2000.00")
        );
        sampleReservation.setId(50L);
        sampleReservation.setStatus(ReservationStatus.APPROVED);
    }

    @Test
    @DisplayName("Should successfully process payment and confirm reservation")
    void testProcessPaymentSuccess() {
        PaymentRequest request = new PaymentRequest();
        request.setReservationId(50L);
        request.setAmount(new BigDecimal("2000.00"));
        request.setPaymentMethod("CREDIT_CARD");
        request.setSimulateFailure(false);

        when(reservationRepository.findById(50L)).thenReturn(Optional.of(sampleReservation));
        when(paymentRepository.findByReservationId(50L)).thenReturn(Optional.empty());
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));

        Payment payment = paymentService.processPayment(request);

        assertThat(payment).isNotNull();
        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(payment.getTransactionId()).startsWith("TXN-");
        assertThat(sampleReservation.getStatus()).isEqualTo(ReservationStatus.CONFIRMED);

        verify(reservationRepository, times(1)).save(sampleReservation);
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    @DisplayName("Should simulate payment failure when simulateFailure flag is true")
    void testProcessPaymentSimulateFailure() {
        PaymentRequest request = new PaymentRequest();
        request.setReservationId(50L);
        request.setAmount(new BigDecimal("2000.00"));
        request.setPaymentMethod("DEBIT_CARD");
        request.setSimulateFailure(true);

        when(reservationRepository.findById(50L)).thenReturn(Optional.of(sampleReservation));

        assertThatThrownBy(() -> paymentService.processPayment(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Payment processing declined");

        verify(paymentRepository, times(1)).save(argThat(p -> p.getStatus() == PaymentStatus.FAILED));
        verify(notificationRepository, times(1)).save(any(Notification.class));
        // Reservation status should NOT be changed to CONFIRMED
        assertThat(sampleReservation.getStatus()).isEqualTo(ReservationStatus.APPROVED);
    }
}
