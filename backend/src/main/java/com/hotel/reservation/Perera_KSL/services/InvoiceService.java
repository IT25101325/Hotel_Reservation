package com.hotel.reservation.service;

import com.hotel.reservation.entity.Invoice;
import com.hotel.reservation.entity.Reservation;
import com.hotel.reservation.exception.ResourceNotFoundException;
import com.hotel.reservation.repository.InvoiceRepository;
import com.hotel.reservation.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    public List<Invoice> getCustomerInvoices(String username) {
        return invoiceRepository.findByReservationCustomerUserUsernameOrderByIssueDateDesc(username);
    }

    public Invoice getInvoiceById(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice #" + id + " not found."));
    }

    @Transactional
    public Invoice getInvoiceByReservationId(Long reservationId) {
        return invoiceRepository.findByReservationId(reservationId)
                .orElseGet(() -> generateInvoiceForReservation(reservationId));
    }

    @Transactional
    public Invoice generateInvoiceForReservation(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation #" + reservationId + " not found."));

        return invoiceRepository.findByReservationId(reservationId).orElseGet(() -> {
            String invoiceNum = "INV-" + (20260000 + reservation.getId());
            BigDecimal amount = reservation.getTotalAmount();
            BigDecimal tax = amount.multiply(new BigDecimal("0.10")); // 10% VAT/service charge
            BigDecimal net = amount.add(tax);
            String billing = reservation.getCustomer().getAddress() != null ? reservation.getCustomer().getAddress() : "Hotel Guest Billing";
            String status = "CONFIRMED".equalsIgnoreCase(reservation.getStatus().name()) || "APPROVED".equalsIgnoreCase(reservation.getStatus().name()) ? "PAID" : "ISSUED";

            Invoice invoice = new Invoice(
                    invoiceNum,
                    reservation,
                    amount,
                    tax,
                    BigDecimal.ZERO,
                    net,
                    status,
                    LocalDate.now().plusDays(7),
                    billing
            );
            return invoiceRepository.save(invoice);
        });
    }

    @Transactional
    public Invoice updateInvoiceStatus(Long id, String status) {
        Invoice invoice = getInvoiceById(id);
        invoice.setStatus(status);
        return invoiceRepository.save(invoice);
    }
}
