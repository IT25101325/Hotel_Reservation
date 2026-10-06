package com.hotel.reservation.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class ReservationRequest {

    @NotNull(message = "Venue or Room ID is required")
    private Long venueRoomId;

    private Long eventPackageId; // Optional inline event package selection

    @NotNull(message = "Start date is required")
    @FutureOrPresent(message = "Start date must be today or in the future")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotNull(message = "Guest count is required")
    @Min(value = 1, message = "Guest count must be at least 1")
    private Integer guestCount;

    private String specialNotes;

    private String primaryGuestName;
    private String primaryGuestEmail;
    private String primaryGuestPhone;
    private String primaryGuestId;

    public ReservationRequest() {}

    public Long getVenueRoomId() { return venueRoomId; }
    public void setVenueRoomId(Long venueRoomId) { this.venueRoomId = venueRoomId; }

    public Long getEventPackageId() { return eventPackageId; }
    public void setEventPackageId(Long eventPackageId) { this.eventPackageId = eventPackageId; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Integer getGuestCount() { return guestCount; }
    public void setGuestCount(Integer guestCount) { this.guestCount = guestCount; }

    public String getSpecialNotes() { return specialNotes; }
    public void setSpecialNotes(String specialNotes) { this.specialNotes = specialNotes; }

    public String getPrimaryGuestName() { return primaryGuestName; }
    public void setPrimaryGuestName(String primaryGuestName) { this.primaryGuestName = primaryGuestName; }

    public String getPrimaryGuestEmail() { return primaryGuestEmail; }
    public void setPrimaryGuestEmail(String primaryGuestEmail) { this.primaryGuestEmail = primaryGuestEmail; }

    public String getPrimaryGuestPhone() { return primaryGuestPhone; }
    public void setPrimaryGuestPhone(String primaryGuestPhone) { this.primaryGuestPhone = primaryGuestPhone; }

    public String getPrimaryGuestId() { return primaryGuestId; }
    public void setPrimaryGuestId(String primaryGuestId) { this.primaryGuestId = primaryGuestId; }
}
