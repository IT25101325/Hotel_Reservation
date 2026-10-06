package com.hotel.reservation.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "room_categories")
public class RoomCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String code;

    private String description;

    private BigDecimal basePriceMultiplier = new BigDecimal("1.0");

    private Boolean active = true;

    public RoomCategory() {}

    public RoomCategory(String name, String code, String description, BigDecimal basePriceMultiplier, Boolean active) {
        this.name = name;
        this.code = code;
        this.description = description;
        this.basePriceMultiplier = basePriceMultiplier != null ? basePriceMultiplier : new BigDecimal("1.0");
        this.active = active != null ? active : true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getBasePriceMultiplier() { return basePriceMultiplier; }
    public void setBasePriceMultiplier(BigDecimal basePriceMultiplier) { this.basePriceMultiplier = basePriceMultiplier; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
