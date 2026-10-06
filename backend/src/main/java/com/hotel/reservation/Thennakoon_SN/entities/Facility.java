package com.hotel.reservation.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "facilities")
public class Facility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    private String facilityType; // e.g. "AUDIO_VISUAL", "CATERING", "COMFORT", "OUTDOOR"

    private String iconName;

    private Boolean active = true;

    public Facility() {}

    public Facility(String name, String description, String facilityType, String iconName) {
        this.name = name;
        this.description = description;
        this.facilityType = facilityType;
        this.iconName = iconName;
        this.active = true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getFacilityType() { return facilityType; }
    public void setFacilityType(String facilityType) { this.facilityType = facilityType; }

    public String getIconName() { return iconName; }
    public void setIconName(String iconName) { this.iconName = iconName; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
