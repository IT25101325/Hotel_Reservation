package com.hotel.reservation.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String invoiceNumber;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reservation_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Reservation reservation;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(precision = 10, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal netTotal;

    @Column(nullable = false)
    private String status = "ISSUED"; // "ISSUED", "PAID", "CANCELLED", "REFUNDED"

    private LocalDate issueDate = LocalDate.now();

    private LocalDate dueDate;

    private String billingAddress;

    public Invoice() {}

    public Invoice(String invoiceNumber, Reservation reservation, BigDecimal amount, BigDecimal taxAmount, BigDecimal discountAmount, BigDecimal netTotal, String status, LocalDate dueDate, String billingAddress) {
        this.invoiceNumber = invoiceNumber;
        this.reservation = reservation;
        this.amount = amount;
        this.taxAmount = taxAmount != null ? taxAmount : BigDecimal.ZERO;
        this.discountAmount = discountAmount != null ? discountAmount : BigDecimal.ZERO;
        this.netTotal = netTotal != null ? netTotal : amount;
        this.status = status != null ? status : "ISSUED";
        this.issueDate = LocalDate.now();
        this.dueDate = dueDate;
        this.billingAddress = billingAddress;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }

    public Reservation getReservation() { return reservation; }
    public void setReservation(Reservation reservation) { this.reservation = reservation; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }

    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }

    public BigDecimal getNetTotal() { return netTotal; }
    public void setNetTotal(BigDecimal netTotal) { this.netTotal = netTotal; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public String getBillingAddress() { return billingAddress; }
    public void setBillingAddress(String billingAddress) { this.billingAddress = billingAddress; }

    public BigDecimal getSubtotal() {
        return amount != null ? amount : BigDecimal.ZERO;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.amount = subtotal;
    }

    public BigDecimal getTotalAmount() {
        return netTotal != null ? netTotal : (amount != null ? amount : BigDecimal.ZERO);
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.netTotal = totalAmount;
    }

    public Customer getCustomer() {
        return reservation != null ? reservation.getCustomer() : null;
    }
}
