package com.hotel.reservation.controller;

import com.hotel.reservation.dto.ReservationRequest;
import com.hotel.reservation.entity.Reservation;
import com.hotel.reservation.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    // Customer endpoints
    @PostMapping("/api/customer/reservations")
    public ResponseEntity<Reservation> createReservation(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ReservationRequest request) {
        Reservation reservation = reservationService.createReservation(userDetails.getUsername(), request);
        return ResponseEntity.ok(reservation);
    }

    @GetMapping("/api/customer/reservations")
    public ResponseEntity<List<Reservation>> getCustomerReservations(@AuthenticationPrincipal UserDetails userDetails) {
        List<Reservation> list = reservationService.getCustomerReservations(userDetails.getUsername());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/api/customer/reservations/{id}")
    public ResponseEntity<Reservation> getReservationById(@PathVariable Long id) {
        Reservation reservation = reservationService.getReservationById(id);
        return ResponseEntity.ok(reservation);
    }

    @PatchMapping("/api/customer/reservations/{id}/cancel")
    public ResponseEntity<Reservation> cancelReservationByCustomer(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        Reservation cancelled = reservationService.cancelReservation(id, userDetails.getUsername());
        return ResponseEntity.ok(cancelled);
    }

    @PutMapping("/api/customer/reservations/{id}")
    public ResponseEntity<Reservation> updateReservationByCustomer(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody ReservationRequest request) {
        Reservation updated = reservationService.updateReservation(id, userDetails.getUsername(), request);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/api/customer/reservations/{id}/guests")
    public ResponseEntity<Reservation> updateGuestInfo(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody ReservationRequest request) {
        Reservation updated = reservationService.updateGuestInformation(id, userDetails.getUsername(), request);
        return ResponseEntity.ok(updated);
    }

    // Reservation Supervisor endpoints
    @GetMapping("/api/reservations/manage/all")
    public ResponseEntity<List<Reservation>> getAllReservationsForSupervisor() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    @PatchMapping("/api/reservations/manage/{id}/approve")
    public ResponseEntity<Reservation> approveReservation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        Reservation approved = reservationService.approveReservation(id, userDetails.getUsername());
        return ResponseEntity.ok(approved);
    }

    @PatchMapping("/api/reservations/manage/{id}/reject")
    public ResponseEntity<Reservation> rejectReservation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : "Conditions not met.";
        Reservation rejected = reservationService.rejectReservation(id, reason, userDetails.getUsername());
        return ResponseEntity.ok(rejected);
    }

    @PatchMapping("/api/reservations/manage/{id}/cancel")
    public ResponseEntity<Reservation> cancelReservationBySupervisor(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        Reservation cancelled = reservationService.cancelReservation(id, userDetails.getUsername());
        return ResponseEntity.ok(cancelled);
    }

    @PatchMapping("/api/reservations/manage/{id}/approve-cancellation")
    public ResponseEntity<Reservation> approveCancellation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        Reservation approved = reservationService.approveCancellation(id, userDetails.getUsername());
        return ResponseEntity.ok(approved);
    }

    @PatchMapping("/api/reservations/manage/{id}/reject-cancellation")
    public ResponseEntity<Reservation> rejectCancellation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : "Cancellation criteria not met.";
        Reservation rejected = reservationService.rejectCancellation(id, reason, userDetails.getUsername());
        return ResponseEntity.ok(rejected);
    }
}
