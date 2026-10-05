package com.hotel.reservation.controller;

import com.hotel.reservation.dto.FeedbackDTO;
import com.hotel.reservation.entity.ComplaintFeedback;
import com.hotel.reservation.entity.Customer;
import com.hotel.reservation.entity.Notification;
import com.hotel.reservation.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin(origins = "*")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @GetMapping("/profile")
    public ResponseEntity<Customer> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        Customer customer = customerService.getCustomerProfile(userDetails.getUsername());
        return ResponseEntity.ok(customer);
    }

    @PutMapping("/profile")
    public ResponseEntity<Customer> updateProfile(@AuthenticationPrincipal UserDetails userDetails,
                                                   @RequestBody Customer updatedData) {
        Customer customer = customerService.updateCustomerProfile(userDetails.getUsername(), updatedData);
        return ResponseEntity.ok(customer);
    }

    @GetMapping("/feedback")
    public ResponseEntity<List<ComplaintFeedback>> getCustomerFeedbacks(@AuthenticationPrincipal UserDetails userDetails) {
        List<ComplaintFeedback> list = customerService.getCustomerFeedbacks(userDetails.getUsername());
        return ResponseEntity.ok(list);
    }

    @PostMapping("/feedback")
    public ResponseEntity<ComplaintFeedback> submitFeedback(@AuthenticationPrincipal UserDetails userDetails,
                                                             @Valid @RequestBody FeedbackDTO dto) {
        ComplaintFeedback feedback = customerService.submitFeedback(userDetails.getUsername(), dto);
        return ResponseEntity.ok(feedback);
    }

    @PutMapping("/feedback/{id}")
    public ResponseEntity<ComplaintFeedback> updateFeedback(@AuthenticationPrincipal UserDetails userDetails,
                                                             @PathVariable Long id,
                                                             @Valid @RequestBody FeedbackDTO dto) {
        ComplaintFeedback feedback = customerService.updateCustomerFeedback(userDetails.getUsername(), id, dto);
        return ResponseEntity.ok(feedback);
    }

    @DeleteMapping("/feedback/{id}")
    public ResponseEntity<Map<String, String>> deleteFeedback(@AuthenticationPrincipal UserDetails userDetails,
                                                               @PathVariable Long id) {
        customerService.deleteCustomerFeedback(userDetails.getUsername(), id);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Feedback #" + id + " deleted successfully.");
        return ResponseEntity.ok(res);
    }

    @Autowired
    private com.hotel.reservation.repository.AnnouncementRepository announcementRepository;

    @GetMapping("/notifications")
    public ResponseEntity<List<Notification>> getNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        List<Notification> notifications = customerService.getCustomerNotifications(userDetails.getUsername());
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/announcements")
    public ResponseEntity<List<com.hotel.reservation.entity.Announcement>> getCustomerAnnouncements() {
        return ResponseEntity.ok(announcementRepository.findByTargetAudienceInOrderByCreatedAtDesc(
                java.util.Arrays.asList("ALL", "CUSTOMERS")
        ));
    }

    // Guest CRUD Endpoints (Ovin - Component 1)
    @PostMapping("/guests")
    public ResponseEntity<com.hotel.reservation.entity.Guest> addGuest(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody com.hotel.reservation.entity.Guest guest) {
        com.hotel.reservation.entity.Guest created = customerService.createGuest(userDetails.getUsername(), guest);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/guests")
    public ResponseEntity<List<com.hotel.reservation.entity.Guest>> getGuests(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(customerService.getCustomerGuests(userDetails.getUsername()));
    }

    @GetMapping("/guests/{id}")
    public ResponseEntity<com.hotel.reservation.entity.Guest> getGuestById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(customerService.getGuestById(userDetails.getUsername(), id));
    }

    @PutMapping("/guests/{id}")
    public ResponseEntity<com.hotel.reservation.entity.Guest> updateGuest(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody com.hotel.reservation.entity.Guest guest) {
        return ResponseEntity.ok(customerService.updateGuest(userDetails.getUsername(), id, guest));
    }

    @DeleteMapping("/guests/{id}")
    public ResponseEntity<Map<String, String>> deleteGuest(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        customerService.deleteGuest(userDetails.getUsername(), id);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Guest #" + id + " removed successfully.");
        return ResponseEntity.ok(res);
    }

    // Customer Account Deactivation / Deletion (Ovin - Component 1)
    @DeleteMapping({"/account", "/profile"})
    public ResponseEntity<Map<String, String>> deactivateAccount(
            @AuthenticationPrincipal UserDetails userDetails,
            java.security.Principal principal,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String username,
            @RequestParam(required = false, defaultValue = "false") boolean permanent) {
        String identifier = null;
        if (userDetails != null && userDetails.getUsername() != null) {
            identifier = userDetails.getUsername();
        } else if (principal != null && principal.getName() != null) {
            identifier = principal.getName();
        } else if (username != null && !username.trim().isEmpty()) {
            identifier = username.trim();
        }

        Map<String, String> res = new HashMap<>();
        if (permanent) {
            customerService.deleteAccountPermanently(identifier, userId);
            res.put("message", "Customer account and associated records deleted permanently.");
        } else {
            customerService.deactivateAccount(identifier, userId);
            res.put("message", "Customer account deactivated successfully.");
        }
        return ResponseEntity.ok(res);
    }
}
