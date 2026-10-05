package com.hotel.reservation.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String address;

    private String passportOrNic;

    private String emergencyContact;

    private String specialPreferences;

    private Integer loyaltyPoints = 0;

    public Customer() {}

    public Customer(User user, String address, String passportOrNic, String emergencyContact, String specialPreferences) {
        this.user = user;
        this.address = address;
        this.passportOrNic = passportOrNic;
        this.emergencyContact = emergencyContact;
        this.specialPreferences = specialPreferences;
        this.loyaltyPoints = 0;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPassportOrNic() { return passportOrNic; }
    public void setPassportOrNic(String passportOrNic) { this.passportOrNic = passportOrNic; }

    public String getEmergencyContact() { return emergencyContact; }
    public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }

    public String getSpecialPreferences() { return specialPreferences; }
    public void setSpecialPreferences(String specialPreferences) { this.specialPreferences = specialPreferences; }

    public Integer getLoyaltyPoints() { return loyaltyPoints; }
    public void setLoyaltyPoints(Integer loyaltyPoints) { this.loyaltyPoints = loyaltyPoints; }
}
