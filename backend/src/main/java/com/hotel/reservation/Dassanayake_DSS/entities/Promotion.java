package com.hotel.reservation.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "promotions")
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, unique = true)
    private String promoCode;

    private Double discountPercentage;

    private LocalDate startDate;

    private LocalDate endDate;

    private String targetEventType;

    private Boolean active = true;

    public Promotion() {}

    public Promotion(String title, String promoCode, Double discountPercentage, LocalDate startDate, LocalDate endDate, String targetEventType, Boolean active) {
        this.title = title;
        this.promoCode = promoCode;
        this.discountPercentage = discountPercentage;
        this.startDate = startDate;
        this.endDate = endDate;
        this.targetEventType = targetEventType;
        this.active = active != null ? active : true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getPromoCode() { return promoCode; }
    public void setPromoCode(String promoCode) { this.promoCode = promoCode; }

    public Double getDiscountPercentage() { return discountPercentage; }
    public void setDiscountPercentage(Double discountPercentage) { this.discountPercentage = discountPercentage; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getTargetEventType() { return targetEventType; }
    public void setTargetEventType(String targetEventType) { this.targetEventType = targetEventType; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
