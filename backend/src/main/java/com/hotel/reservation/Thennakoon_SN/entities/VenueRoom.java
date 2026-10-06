package com.hotel.reservation.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "venue_rooms")
public class VenueRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // ROOM, BANQUET_HALL, GARDEN_VENUE, CONFERENCE_HALL

    @Column(nullable = false)
    private String category; // DELUXE, SUITE, GRAND_BALLROOM, EXECUTIVE, GARDEN

    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerNight;

    @Column(length = 1000)
    private String facilities; // AirCon, Projector, Stage, Wi-Fi, Catering Setup

    @Column(length = 2000)
    private String description;

    private String imageUrl;

    @Column(nullable = false)
    private boolean available = true;

    public VenueRoom() {}

    public VenueRoom(String name, String type, String category, Integer capacity, BigDecimal pricePerNight, String facilities, String description, String imageUrl, boolean available) {
        this.name = name;
        this.type = type;
        this.category = category;
        this.capacity = capacity;
        this.pricePerNight = pricePerNight;
        this.facilities = facilities;
        this.description = description;
        this.imageUrl = imageUrl;
        this.available = available;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public BigDecimal getPricePerNight() { return pricePerNight; }
    public void setPricePerNight(BigDecimal pricePerNight) { this.pricePerNight = pricePerNight; }

    public String getFacilities() { return facilities; }
    public void setFacilities(String facilities) { this.facilities = facilities; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
}
