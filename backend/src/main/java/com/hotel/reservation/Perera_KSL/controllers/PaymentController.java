package com.hotel.reservation.controller;

import com.hotel.reservation.dto.PaymentRequest;
import com.hotel.reservation.entity.Payment;
import com.hotel.reservation.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/api/customer/payments/process")
    public ResponseEntity<Payment> processPayment(@Valid @RequestBody PaymentRequest request) {
        Payment payment = paymentService.processPayment(request);
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/api/customer/payments/reservation/{reservationId}")
    public ResponseEntity<Payment> getPaymentByReservation(@PathVariable Long reservationId) {
        Payment payment = paymentService.getPaymentByReservationId(reservationId);
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/api/reservations/manage/payments/all")
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/api/reservations/manage/payments/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @PatchMapping("/api/reservations/manage/payments/{id}/status")
    public ResponseEntity<Payment> updatePaymentStatus(
            @PathVariable Long id,
            @RequestParam com.hotel.reservation.entity.PaymentStatus status) {
        return ResponseEntity.ok(paymentService.updatePaymentStatus(id, status));
    }

    @PostMapping("/api/reservations/manage/payments/{id}/refund")
    public ResponseEntity<Payment> refundPayment(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.refundPayment(id));
    }
}
