package com.hotel.reservation.pattern.strategy;

import com.hotel.reservation.dto.PaymentRequest;
import com.hotel.reservation.entity.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;

public class PaymentStrategyTest {

    private PaymentStrategyContext context;
    private Reservation sampleReservation;

    @BeforeEach
    void setUp() {
        CreditCardPaymentStrategy cc = new CreditCardPaymentStrategy();
        PayPalPaymentStrategy pp = new PayPalPaymentStrategy();
        OnlineBankingPaymentStrategy ob = new OnlineBankingPaymentStrategy();
        context = new PaymentStrategyContext(Arrays.asList(cc, pp, ob));

        User user = new User("johndoe", "john@example.com", "pass", "John Doe", "+94771234567", RoleName.ROLE_CUSTOMER);
        Customer customer = new Customer(user, "123 Galle Rd, Colombo", "991234567V", "+94771112233", "Sea view preference");
        VenueRoom venue = new VenueRoom("Grand Ballroom", "BANQUET_HALL", "DELUXE", 350, new BigDecimal("150000.00"), "Audio, Stage", "Luxury hall", "img.jpg", true);
        sampleReservation = new Reservation(customer, venue, null, LocalDate.now().plusDays(5), LocalDate.now().plusDays(6), 200, "Wedding reception", new BigDecimal("150000.00"));
    }

    @Test
    @DisplayName("Strategy Test 1: CreditCardPaymentStrategy initializes credit card payment with CC- prefix")
    void testCreditCardStrategy() {
        PaymentRequest request = new PaymentRequest();
        request.setPaymentMethod("CREDIT_CARD");
        request.setAmount(new BigDecimal("150000.00"));

        Payment payment = context.executeStrategy(sampleReservation, request, null);

        assertThat(payment).isNotNull();
        assertThat(payment.getPaymentMethod()).isEqualTo("CREDIT_CARD");
        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(payment.getTransactionId()).startsWith("CC-");
        assertThat(payment.getAmount()).isEqualByComparingTo(new BigDecimal("150000.00"));
    }

    @Test
    @DisplayName("Strategy Test 2: PayPalPaymentStrategy initializes PayPal payment with PP- prefix")
    void testPayPalStrategy() {
        PaymentRequest request = new PaymentRequest();
        request.setPaymentMethod("PAYPAL");
        request.setAmount(new BigDecimal("75000.00"));

        Payment payment = context.executeStrategy(sampleReservation, request, null);

        assertThat(payment).isNotNull();
        assertThat(payment.getPaymentMethod()).isEqualTo("PAYPAL");
        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(payment.getTransactionId()).startsWith("PP-");
    }

    @Test
    @DisplayName("Strategy Test 3: OnlineBankingPaymentStrategy initializes Bank payment with BANK- prefix")
    void testOnlineBankingStrategy() {
        PaymentRequest request = new PaymentRequest();
        request.setPaymentMethod("ONLINE_BANKING");
        request.setAmount(new BigDecimal("200000.00"));

        Payment payment = context.executeStrategy(sampleReservation, request, null);

        assertThat(payment).isNotNull();
        assertThat(payment.getPaymentMethod()).isEqualTo("ONLINE_BANKING");
        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(payment.getTransactionId()).startsWith("BANK-");
    }

    @Test
    @DisplayName("Strategy Test 4: Default fallback strategy selects CreditCard for DEBIT_CARD or unspecified method")
    void testFallbackStrategy() {
        PaymentRequest request = new PaymentRequest();
        request.setPaymentMethod("DEBIT_CARD");
        request.setAmount(new BigDecimal("50000.00"));

        Payment payment = context.executeStrategy(sampleReservation, request, null);

        assertThat(payment).isNotNull();
        assertThat(payment.getPaymentMethod()).isEqualTo("CREDIT_CARD");
        assertThat(payment.getTransactionId()).startsWith("CC-");
    }
}
