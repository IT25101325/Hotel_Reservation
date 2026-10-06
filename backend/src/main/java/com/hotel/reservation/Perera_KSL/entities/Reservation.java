package com.hotel.reservation.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservations")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "venue_room_id", nullable = false)
    private VenueRoom venueRoom;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "event_package_id")
    private EventPackage eventPackage; // Optional inline selection

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private Integer guestCount;

    @Column(length = 1000)
    private String specialNotes;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ReservationStatus status = ReservationStatus.APPROVED;

    @Column(name = "primary_guest_name")
    private String primaryGuestName;

    @Column(name = "primary_guest_email")
    private String primaryGuestEmail;

    @Column(name = "primary_guest_phone")
    private String primaryGuestPhone;

    @Column(name = "primary_guest_id")
    private String primaryGuestId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Transient
    private Boolean paid;

    public Reservation() {
        this.createdAt = LocalDateTime.now();
    }

    public Reservation(Customer customer, VenueRoom venueRoom, EventPackage eventPackage, LocalDate startDate, LocalDate endDate, Integer guestCount, String specialNotes, BigDecimal totalAmount) {
        this.customer = customer;
        this.venueRoom = venueRoom;
        this.eventPackage = eventPackage;
        this.startDate = startDate;
        this.endDate = endDate;
        this.guestCount = guestCount;
        this.specialNotes = specialNotes;
        this.totalAmount = totalAmount;
        this.status = ReservationStatus.APPROVED;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }

    public VenueRoom getVenueRoom() { return venueRoom; }
    public void setVenueRoom(VenueRoom venueRoom) { this.venueRoom = venueRoom; }

    public EventPackage getEventPackage() { return eventPackage; }
    public void setEventPackage(EventPackage eventPackage) { this.eventPackage = eventPackage; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Integer getGuestCount() { return guestCount; }
    public void setGuestCount(Integer guestCount) { this.guestCount = guestCount; }

    public String getSpecialNotes() { return specialNotes; }
    public void setSpecialNotes(String specialNotes) { this.specialNotes = specialNotes; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public ReservationStatus getStatus() { return status; }
    public void setStatus(ReservationStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Boolean getPaid() { return paid; }
    public void setPaid(Boolean paid) { this.paid = paid; }

    public String getPrimaryGuestName() { return primaryGuestName; }
    public void setPrimaryGuestName(String primaryGuestName) { this.primaryGuestName = primaryGuestName; }

    public String getPrimaryGuestEmail() { return primaryGuestEmail; }
    public void setPrimaryGuestEmail(String primaryGuestEmail) { this.primaryGuestEmail = primaryGuestEmail; }

    public String getPrimaryGuestPhone() { return primaryGuestPhone; }
    public void setPrimaryGuestPhone(String primaryGuestPhone) { this.primaryGuestPhone = primaryGuestPhone; }

    public String getPrimaryGuestId() { return primaryGuestId; }
    public void setPrimaryGuestId(String primaryGuestId) { this.primaryGuestId = primaryGuestId; }
}
