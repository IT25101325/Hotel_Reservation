package com.hotel.reservation.controller;

import com.hotel.reservation.entity.Invoice;
import com.hotel.reservation.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    // Customer Invoices
    @GetMapping("/api/customer/invoices")
    public ResponseEntity<List<Invoice>> getCustomerInvoices(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(invoiceService.getCustomerInvoices(userDetails.getUsername()));
    }

    @GetMapping("/api/customer/invoices/reservation/{reservationId}")
    public ResponseEntity<Invoice> getInvoiceByReservation(@PathVariable Long reservationId) {
        return ResponseEntity.ok(invoiceService.getInvoiceByReservationId(reservationId));
    }

    @GetMapping("/api/customer/invoices/{id}")
    public ResponseEntity<Invoice> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(id));
    }

    // Reservation Management Invoices
    @GetMapping({"/api/reservations/manage/invoices/all", "/api/invoices"})
    public ResponseEntity<List<Invoice>> getAllInvoices() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    @PostMapping({"/api/customer/invoices/generate/{reservationId}", "/api/reservations/manage/invoices/generate/{reservationId}", "/api/invoices/generate/{reservationId}"})
    public ResponseEntity<Invoice> generateInvoice(@PathVariable Long reservationId) {
        return ResponseEntity.ok(invoiceService.generateInvoiceForReservation(reservationId));
    }

    @PatchMapping({"/api/reservations/manage/invoices/{id}/status", "/api/invoices/{id}/status"})
    public ResponseEntity<Invoice> updateInvoiceStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(invoiceService.updateInvoiceStatus(id, status));
    }
}
