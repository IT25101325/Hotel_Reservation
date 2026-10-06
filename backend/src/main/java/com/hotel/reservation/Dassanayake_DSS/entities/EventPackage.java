package com.hotel.reservation.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "event_packages")
public class EventPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String eventType; // WEDDING, CONFERENCE, BIRTHDAY, CORPORATE, BANQUET

    @Column(length = 2000)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer maxCapacity;

    @Column(name = "is_published", nullable = false)
    private boolean published = false; // Step 7 publishing workflow

    private Double discountPercentage = 0.0;

    private String imageUrl;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "package_services", joinColumns = @JoinColumn(name = "package_id"))
    @Column(name = "service_name")
    private List<String> includedServices = new ArrayList<>();

    public EventPackage() {}

    public EventPackage(String name, String eventType, String description, BigDecimal price, Integer maxCapacity, boolean published, Double discountPercentage, String imageUrl, List<String> includedServices) {
        this.name = name;
        this.eventType = eventType;
        this.description = description;
        this.price = price;
        this.maxCapacity = maxCapacity;
        this.published = published;
        this.discountPercentage = discountPercentage;
        this.imageUrl = imageUrl;
        this.includedServices = includedServices != null ? includedServices : new ArrayList<>();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Integer getMaxCapacity() { return maxCapacity; }
    public void setMaxCapacity(Integer maxCapacity) { this.maxCapacity = maxCapacity; }

    public boolean isPublished() { return published; }
    public void setPublished(boolean published) { this.published = published; }

    public Double getDiscountPercentage() { return discountPercentage; }
    public void setDiscountPercentage(Double discountPercentage) { this.discountPercentage = discountPercentage; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public List<String> getIncludedServices() { return includedServices; }
    public void setIncludedServices(List<String> includedServices) { this.includedServices = includedServices; }
}
