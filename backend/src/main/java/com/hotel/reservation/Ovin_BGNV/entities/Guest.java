package com.hotel.reservation.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "guests")
public class Guest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Customer customer;

    @Column(nullable = false)
    private String fullName;

    private String email;

    private String phone;

    private String nicOrPassport;

    private String relationship;

    private String specialNeeds;

    private String ageGroup;

    public Guest() {}

    public Guest(Customer customer, String fullName, String email, String phone, String nicOrPassport, String relationship, String specialNeeds) {
        this.customer = customer;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.nicOrPassport = nicOrPassport;
        this.relationship = relationship;
        this.specialNeeds = specialNeeds;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getNicOrPassport() { return nicOrPassport; }
    public void setNicOrPassport(String nicOrPassport) { this.nicOrPassport = nicOrPassport; }

    // JSON alias for frontend identificationNumber
    public String getIdentificationNumber() { return nicOrPassport; }
    public void setIdentificationNumber(String identificationNumber) { this.nicOrPassport = identificationNumber; }

    public String getRelationship() { return relationship; }
    public void setRelationship(String relationship) { this.relationship = relationship; }

    public String getSpecialNeeds() { return specialNeeds; }
    public void setSpecialNeeds(String specialNeeds) { this.specialNeeds = specialNeeds; }

    // JSON alias for frontend dietaryPreferences
    public String getDietaryPreferences() { return specialNeeds; }
    public void setDietaryPreferences(String dietaryPreferences) { this.specialNeeds = dietaryPreferences; }

    public String getAgeGroup() { return ageGroup; }
    public void setAgeGroup(String ageGroup) { this.ageGroup = ageGroup; }
}
