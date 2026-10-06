package com.hotel.reservation.dto;

import java.math.BigDecimal;
import java.util.Map;

public class ReportDTO {

    private long totalReservations;
    private BigDecimal totalRevenue;
    private long activeCustomers;
    private long totalEmployees;
    private long pendingReservations;
    private long approvedReservations;
    private long confirmedReservations;
    private long cancelledReservations;

    private Map<String, Long> reservationsByVenueType;
    private Map<String, BigDecimal> revenueByEventType;

    public ReportDTO() {}

    public long getTotalReservations() { return totalReservations; }
    public void setTotalReservations(long totalReservations) { this.totalReservations = totalReservations; }

    public long getTotalBookings() { return totalReservations; }
    public void setTotalBookings(long totalBookings) { this.totalReservations = totalBookings; }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public long getActiveCustomers() { return activeCustomers; }
    public void setActiveCustomers(long activeCustomers) { this.activeCustomers = activeCustomers; }

    public long getTotalEmployees() { return totalEmployees; }
    public void setTotalEmployees(long totalEmployees) { this.totalEmployees = totalEmployees; }

    public long getPendingReservations() { return pendingReservations; }
    public void setPendingReservations(long pendingReservations) { this.pendingReservations = pendingReservations; }

    public long getApprovedReservations() { return approvedReservations; }
    public void setApprovedReservations(long approvedReservations) { this.approvedReservations = approvedReservations; }

    public long getConfirmedReservations() { return confirmedReservations; }
    public void setConfirmedReservations(long confirmedReservations) { this.confirmedReservations = confirmedReservations; }

    public long getCancelledReservations() { return cancelledReservations; }
    public void setCancelledReservations(long cancelledReservations) { this.cancelledReservations = cancelledReservations; }

    public Map<String, Long> getReservationsByVenueType() { return reservationsByVenueType; }
    public void setReservationsByVenueType(Map<String, Long> reservationsByVenueType) { this.reservationsByVenueType = reservationsByVenueType; }

    public Map<String, BigDecimal> getRevenueByEventType() { return revenueByEventType; }
    public void setRevenueByEventType(Map<String, BigDecimal> revenueByEventType) { this.revenueByEventType = revenueByEventType; }
}
