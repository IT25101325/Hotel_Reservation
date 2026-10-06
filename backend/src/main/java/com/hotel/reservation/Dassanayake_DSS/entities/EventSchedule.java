package com.hotel.reservation.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "event_schedules")
public class EventSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "event_package_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private EventPackage eventPackage;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "venue_room_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private VenueRoom venueRoom;

    @Column(nullable = false)
    private LocalDate scheduleDate;

    private String startTime;

    private String endTime;

    private String coordinatorName;

    private String status = "SCHEDULED"; // "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"

    private String notes;

    public EventSchedule() {}

    public EventSchedule(String title, EventPackage eventPackage, VenueRoom venueRoom, LocalDate scheduleDate, String startTime, String endTime, String coordinatorName, String status, String notes) {
        this.title = title;
        this.eventPackage = eventPackage;
        this.venueRoom = venueRoom;
        this.scheduleDate = scheduleDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.coordinatorName = coordinatorName;
        this.status = status != null ? status : "SCHEDULED";
        this.notes = notes;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public EventPackage getEventPackage() { return eventPackage; }
    public void setEventPackage(EventPackage eventPackage) { this.eventPackage = eventPackage; }

    public VenueRoom getVenueRoom() { return venueRoom; }
    public void setVenueRoom(VenueRoom venueRoom) { this.venueRoom = venueRoom; }

    public LocalDate getScheduleDate() { return scheduleDate; }
    public void setScheduleDate(LocalDate scheduleDate) { this.scheduleDate = scheduleDate; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getCoordinatorName() { return coordinatorName; }
    public void setCoordinatorName(String coordinatorName) { this.coordinatorName = coordinatorName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
