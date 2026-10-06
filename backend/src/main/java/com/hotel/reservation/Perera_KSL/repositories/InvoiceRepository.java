package com.hotel.reservation.repository;

import com.hotel.reservation.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByReservationId(Long reservationId);
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    List<Invoice> findByReservationCustomerUserUsernameOrderByIssueDateDesc(String username);
}
