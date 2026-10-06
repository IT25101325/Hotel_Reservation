package com.hotel.reservation.service;

import com.hotel.reservation.dto.PaymentRequest;
import com.hotel.reservation.entity.*;
import com.hotel.reservation.exception.BadRequestException;
import com.hotel.reservation.exception.ResourceNotFoundException;
import com.hotel.reservation.repository.NotificationRepository;
import com.hotel.reservation.repository.PaymentRepository;
import com.hotel.reservation.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private com.hotel.reservation.pattern.strategy.PaymentStrategyContext paymentStrategyContext;

    @Transactional
    public Payment processPayment(PaymentRequest request) {
        Reservation reservation = reservationRepository.findById(request.getReservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Reservation #" + request.getReservationId() + " not found."));

        if (request.getAmount() == null || request.getAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payment amount must be greater than zero.");
        }

        // Extension 7a: Simulated Payment Gateway failure path
        if (request.isSimulateFailure()) {
            Payment failedPayment = new Payment(
                    reservation,
                    request.getAmount(),
                    request.getPaymentMethod(),
                    PaymentStatus.FAILED,
                    "FAILED-" + UUID.randomUUID().toString().substring(0, 8)
            );
            failedPayment.setFailureReason("Transaction declined by issuing bank (Insufficient funds / Gateway error).");
            paymentRepository.save(failedPayment);

            // Send notification to customer
            Notification notification = new Notification(
                    reservation.getCustomer().getUser(),
                    "Payment Failed for Reservation #" + reservation.getId(),
                    "Online payment of LKR " + request.getAmount() + " failed. Transaction status marked unsuccessful."
            );
            notificationRepository.save(notification);

            throw new BadRequestException("Payment Gateway Error: Payment processing declined. Status marked UNSUCCESSFUL.");
        }

        // Delegate execution to Strategy Pattern Context (Behavioral Design Pattern)
        Payment existingPayment = paymentRepository.findByReservationId(reservation.getId()).orElse(null);
        Payment payment = paymentStrategyContext.executeStrategy(reservation, request, existingPayment);

        Payment saved = paymentRepository.save(payment);

        // Confirm reservation state
        reservation.setStatus(ReservationStatus.CONFIRMED);
        reservationRepository.save(reservation);

        // Send payment confirmation notification
        Notification notification = new Notification(
                reservation.getCustomer().getUser(),
                "Payment Successful!",
                "Your payment of LKR " + request.getAmount() + " for Reservation #" + reservation.getId() + " was completed successfully. Transaction ID: " + saved.getTransactionId()
        );
        notificationRepository.save(notification);

        return saved;
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAllByOrderByPaymentDateDesc();
    }

    public Payment getPaymentByReservationId(Long reservationId) {
        return paymentRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record for reservation #" + reservationId + " not found."));
    }

    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment #" + id + " not found."));
    }

    // Payment Update Status (Linasha - Component 4)
    @Transactional
    public Payment updatePaymentStatus(Long id, PaymentStatus status) {
        Payment payment = getPaymentById(id);
        payment.setStatus(status);
        return paymentRepository.save(payment);
    }

    // Payment Delete / Refund (Linasha - Component 4)
    @Transactional
    public Payment refundPayment(Long id) {
        Payment payment = getPaymentById(id);
        payment.setStatus(PaymentStatus.REFUNDED);
        payment.setFailureReason("Payment refunded to customer by Reservation Management.");
        Payment saved = paymentRepository.save(payment);

        Notification notification = new Notification(
                payment.getReservation().getCustomer().getUser(),
                "Payment Refunded",
                "Your payment of LKR " + payment.getAmount() + " for Reservation #" + payment.getReservation().getId() + " has been marked REFUNDED."
        );
        notificationRepository.save(notification);

        return saved;
    }
}
