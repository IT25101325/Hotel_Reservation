package com.hotel.reservation.service;

import com.hotel.reservation.dto.FeedbackDTO;
import com.hotel.reservation.entity.*;
import com.hotel.reservation.exception.BadRequestException;
import com.hotel.reservation.exception.ResourceNotFoundException;
import com.hotel.reservation.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ComplaintFeedbackRepository complaintFeedbackRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    public Customer getCustomerProfile(String username) {
        return customerRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found for user: " + username));
    }

    @Transactional
    public Customer updateCustomerProfile(String username, Customer updatedData) {
        Customer customer = getCustomerProfile(username);
        User user = customer.getUser();

        if (updatedData.getUser() != null) {
            if (updatedData.getUser().getFullName() != null) user.setFullName(updatedData.getUser().getFullName());
            if (updatedData.getUser().getPhone() != null) user.setPhone(updatedData.getUser().getPhone());
            userRepository.save(user);
        }

        if (updatedData.getAddress() != null) customer.setAddress(updatedData.getAddress());
        if (updatedData.getPassportOrNic() != null) customer.setPassportOrNic(updatedData.getPassportOrNic());
        if (updatedData.getEmergencyContact() != null) customer.setEmergencyContact(updatedData.getEmergencyContact());
        if (updatedData.getSpecialPreferences() != null) customer.setSpecialPreferences(updatedData.getSpecialPreferences());

        return customerRepository.save(customer);
    }

    @Transactional
    public ComplaintFeedback submitFeedback(String username, FeedbackDTO dto) {
        if (dto.getSubject() == null || dto.getSubject().trim().isEmpty()) {
            throw new BadRequestException("Feedback subject cannot be empty.");
        }
        if (dto.getMessage() == null || dto.getMessage().trim().isEmpty()) {
            throw new BadRequestException("Feedback message cannot be empty.");
        }
        if (dto.getRating() == null || dto.getRating() < 1 || dto.getRating() > 5) {
            throw new BadRequestException("Feedback rating must be an integer between 1 and 5 stars.");
        }

        User user = userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findByEmail(username)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username)));

        ComplaintFeedback feedback = new ComplaintFeedback(
                user,
                dto.getType(),
                dto.getSubject().trim(),
                dto.getMessage().trim(),
                dto.getRating()
        );

        return complaintFeedbackRepository.save(feedback);
    }

    public List<ComplaintFeedback> getCustomerFeedbacks(String username) {
        User user = userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findByEmail(username).orElse(null));
        if (user == null) {
            return Collections.emptyList();
        }
        return complaintFeedbackRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    @Transactional
    public ComplaintFeedback updateCustomerFeedback(String username, Long id, FeedbackDTO dto) {
        if (dto.getSubject() == null || dto.getSubject().trim().isEmpty()) {
            throw new BadRequestException("Feedback subject cannot be empty.");
        }
        if (dto.getMessage() == null || dto.getMessage().trim().isEmpty()) {
            throw new BadRequestException("Feedback message cannot be empty.");
        }
        if (dto.getRating() == null || dto.getRating() < 1 || dto.getRating() > 5) {
            throw new BadRequestException("Feedback rating must be an integer between 1 and 5 stars.");
        }

        ComplaintFeedback feedback = complaintFeedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback #" + id + " not found."));

        boolean isOwner = feedback.getUser().getUsername().equalsIgnoreCase(username)
                || feedback.getUser().getEmail().equalsIgnoreCase(username);
        if (!isOwner) {
            throw new BadRequestException("You are not authorized to update this feedback record.");
        }

        feedback.setType(dto.getType());
        feedback.setSubject(dto.getSubject().trim());
        feedback.setMessage(dto.getMessage().trim());
        feedback.setRating(dto.getRating());

        return complaintFeedbackRepository.save(feedback);
    }

    @Autowired
    private GuestRepository guestRepository;

    @Transactional
    public void deleteCustomerFeedback(String username, Long id) {
        ComplaintFeedback feedback = complaintFeedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback #" + id + " not found."));

        boolean isOwner = feedback.getUser().getUsername().equalsIgnoreCase(username)
                || feedback.getUser().getEmail().equalsIgnoreCase(username);
        if (!isOwner) {
            throw new BadRequestException("You are not authorized to delete this feedback record.");
        }

        complaintFeedbackRepository.delete(feedback);
    }

    public List<Notification> getCustomerNotifications(String username) {
        return notificationRepository.findByUserUsernameOrderByCreatedAtDesc(username);
    }

    // Guest CRUD Operations (Ovin - Component 1)
    @Transactional
    public Guest createGuest(String username, Guest guest) {
        if (guest.getFullName() == null || guest.getFullName().trim().isEmpty()) {
            throw new BadRequestException("Guest full name is required and cannot be blank.");
        }
        if (guest.getPhone() == null || guest.getPhone().trim().isEmpty()) {
            throw new BadRequestException("Guest contact phone number is required.");
        }

        Customer customer = getCustomerProfile(username);
        guest.setFullName(guest.getFullName().trim());
        guest.setPhone(guest.getPhone().trim());
        if (guest.getEmail() != null) guest.setEmail(guest.getEmail().trim());
        if (guest.getNicOrPassport() != null) guest.setNicOrPassport(guest.getNicOrPassport().trim());
        if (guest.getRelationship() != null) guest.setRelationship(guest.getRelationship().trim());
        if (guest.getSpecialNeeds() != null) guest.setSpecialNeeds(guest.getSpecialNeeds().trim());
        if (guest.getAgeGroup() != null) guest.setAgeGroup(guest.getAgeGroup().trim());
        guest.setCustomer(customer);
        return guestRepository.save(guest);
    }

    public List<Guest> getCustomerGuests(String username) {
        return guestRepository.findByCustomerUserUsernameOrderByIdDesc(username);
    }

    public Guest getGuestById(String username, Long guestId) {
        Guest guest = guestRepository.findById(guestId)
                .orElseThrow(() -> new ResourceNotFoundException("Guest #" + guestId + " not found."));
        if (!guest.getCustomer().getUser().getUsername().equalsIgnoreCase(username)) {
            throw new BadRequestException("You do not have permission to view this guest record.");
        }
        return guest;
    }

    @Transactional
    public Guest updateGuest(String username, Long guestId, Guest updatedData) {
        Guest guest = getGuestById(username, guestId);
        if (updatedData.getFullName() != null) {
            if (updatedData.getFullName().trim().isEmpty()) {
                throw new BadRequestException("Guest full name cannot be blank.");
            }
            guest.setFullName(updatedData.getFullName().trim());
        }
        if (updatedData.getEmail() != null) guest.setEmail(updatedData.getEmail().trim());
        if (updatedData.getPhone() != null) {
            if (updatedData.getPhone().trim().isEmpty()) {
                throw new BadRequestException("Guest contact phone number cannot be blank.");
            }
            guest.setPhone(updatedData.getPhone().trim());
        }
        if (updatedData.getNicOrPassport() != null) guest.setNicOrPassport(updatedData.getNicOrPassport().trim());
        if (updatedData.getRelationship() != null) guest.setRelationship(updatedData.getRelationship().trim());
        if (updatedData.getSpecialNeeds() != null) guest.setSpecialNeeds(updatedData.getSpecialNeeds().trim());
        if (updatedData.getAgeGroup() != null) guest.setAgeGroup(updatedData.getAgeGroup().trim());
        return guestRepository.save(guest);
    }

    @Transactional
    public void deleteGuest(String username, Long guestId) {
        Guest guest = getGuestById(username, guestId);
        guestRepository.delete(guest);
    }

    // Customer Deactivation (Ovin - Component 1 Delete)
    @Transactional
    public void deactivateAccount(String identifier, Long userId) {
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }
        if (user == null && identifier != null && !identifier.trim().isEmpty()) {
            String cleanId = identifier.trim();
            user = userRepository.findByUsername(cleanId)
                    .orElseGet(() -> {
                        List<User> matches = userRepository.findByIdentifier(cleanId);
                        return matches.isEmpty() ? null : matches.get(0);
                    });
        }
        if (user != null) {
            user.setActive(false);
            userRepository.save(user);
        }
    }

    @Transactional
    public void deactivateAccount(String username) {
        deactivateAccount(username, null);
    }

    @Autowired(required = false)
    @org.springframework.context.annotation.Lazy
    private AdminReportService adminReportService;

    @Transactional
    public void deleteAccountPermanently(String identifier, Long userId) {
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }
        if (user == null && identifier != null && !identifier.trim().isEmpty()) {
            String cleanId = identifier.trim();
            user = userRepository.findByUsername(cleanId)
                    .orElseGet(() -> {
                        List<User> matches = userRepository.findByIdentifier(cleanId);
                        return matches.isEmpty() ? null : matches.get(0);
                    });
        }
        if (user != null) {
            if (adminReportService != null) {
                adminReportService.deleteUser(user.getId());
            } else {
                user.setActive(false);
                userRepository.save(user);
            }
        }
    }
}
