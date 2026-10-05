package com.hotel.reservation.dto;

import com.hotel.reservation.entity.RoleName;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Full Name is required")
    private String fullName;

    private String phone;

    private RoleName role = RoleName.ROLE_CUSTOMER;

    private String address;
    private String passportOrNic;
    private String emergencyContact;
    private String specialPreferences;

    public RegisterRequest() {}

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public RoleName getRole() { return role; }
    public void setRole(RoleName role) { this.role = role; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPassportOrNic() { return passportOrNic; }
    public void setPassportOrNic(String passportOrNic) { this.passportOrNic = passportOrNic; }

    public String getEmergencyContact() { return emergencyContact; }
    public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }

    public String getSpecialPreferences() { return specialPreferences; }
    public void setSpecialPreferences(String specialPreferences) { this.specialPreferences = specialPreferences; }
}
