package com.hotel.reservation.controller;

import com.hotel.reservation.entity.VenueRoom;
import com.hotel.reservation.service.VenueRoomService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class VenueRoomController {

    @Autowired
    private VenueRoomService venueRoomService;

    @Autowired
    private com.hotel.reservation.repository.AnnouncementRepository announcementRepository;

    // Public announcements endpoint filtered by audience
    @GetMapping("/api/public/announcements")
    public ResponseEntity<List<com.hotel.reservation.entity.Announcement>> getPublicAnnouncements(
            @RequestParam(required = false) String audience) {
        if ("STAFF".equalsIgnoreCase(audience)) {
            return ResponseEntity.ok(announcementRepository.findByTargetAudienceInOrderByCreatedAtDesc(
                    java.util.Arrays.asList("ALL", "STAFF")
            ));
        } else if ("CUSTOMERS".equalsIgnoreCase(audience)) {
            return ResponseEntity.ok(announcementRepository.findByTargetAudienceInOrderByCreatedAtDesc(
                    java.util.Arrays.asList("ALL", "CUSTOMERS")
            ));
        } else if ("ALL".equalsIgnoreCase(audience)) {
            return ResponseEntity.ok(announcementRepository.findByTargetAudienceOrderByCreatedAtDesc("ALL"));
        } else {
            return ResponseEntity.ok(announcementRepository.findAllByOrderByCreatedAtDesc());
        }
    }

    // Public endpoints
    @GetMapping("/api/public/venues")
    public ResponseEntity<List<VenueRoom>> getPublicVenues() {
        return ResponseEntity.ok(venueRoomService.getAvailableVenueRooms());
    }

    @GetMapping("/api/public/venues/all")
    public ResponseEntity<List<VenueRoom>> getAllPublicVenues() {
        return ResponseEntity.ok(venueRoomService.getAllVenueRooms());
    }

    @GetMapping("/api/public/venues/{id}")
    public ResponseEntity<VenueRoom> getVenueById(@PathVariable Long id) {
        return ResponseEntity.ok(venueRoomService.getVenueRoomById(id));
    }

    @GetMapping("/api/public/venues/check-availability")
    public ResponseEntity<Map<String, Object>> checkAvailability(
            @RequestParam Long venueRoomId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        boolean isAvailable = venueRoomService.checkAvailability(venueRoomId, startDate, endDate);
        Map<String, Object> res = new HashMap<>();
        res.put("venueRoomId", venueRoomId);
        res.put("startDate", startDate);
        res.put("endDate", endDate);
        res.put("available", isAvailable);
        res.put("message", isAvailable ? "Venue/Room is available for selected dates." : "CONFLICT: Selected dates are already booked!");
        
        return ResponseEntity.ok(res);
    }

    // Venue Operations Manager Endpoints
    @GetMapping("/api/venue-ops/manage/all")
    public ResponseEntity<List<VenueRoom>> getManageVenues() {
        return ResponseEntity.ok(venueRoomService.getAllVenueRooms());
    }

    @PostMapping("/api/venue-ops/manage")
    public ResponseEntity<VenueRoom> createVenueRoom(@Valid @RequestBody VenueRoom venueRoom) {
        VenueRoom created = venueRoomService.createVenueRoom(venueRoom);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/api/venue-ops/manage/{id}")
    public ResponseEntity<VenueRoom> updateVenueRoom(@PathVariable Long id, @Valid @RequestBody VenueRoom venueRoom) {
        VenueRoom updated = venueRoomService.updateVenueRoom(id, venueRoom);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/api/venue-ops/manage/{id}/status")
    public ResponseEntity<VenueRoom> updateAvailability(
            @PathVariable Long id,
            @RequestParam boolean available,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        VenueRoom room = venueRoomService.updateAvailabilityStatus(id, available, startDate, endDate);
        return ResponseEntity.ok(room);
    }

    @DeleteMapping("/api/venue-ops/manage/{id}")
    public ResponseEntity<Map<String, String>> deleteVenueRoom(@PathVariable Long id) {
        venueRoomService.deleteVenueRoom(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Venue/Room #" + id + " deleted successfully.");
        return ResponseEntity.ok(response);
    }

    // Room vs Venue Filtering (Samath - Component 2)
    @GetMapping("/api/venue-ops/rooms")
    public ResponseEntity<List<VenueRoom>> getRoomsOnly() {
        return ResponseEntity.ok(venueRoomService.getRoomsOnly());
    }

    @GetMapping("/api/venue-ops/venues")
    public ResponseEntity<List<VenueRoom>> getVenuesOnly() {
        return ResponseEntity.ok(venueRoomService.getVenuesOnly());
    }

    // Room Category CRUD Endpoints (Samath - Component 2)
    @GetMapping("/api/venue-ops/categories")
    public ResponseEntity<List<com.hotel.reservation.entity.RoomCategory>> getAllCategories() {
        return ResponseEntity.ok(venueRoomService.getAllCategories());
    }

    @GetMapping("/api/venue-ops/categories/{id}")
    public ResponseEntity<com.hotel.reservation.entity.RoomCategory> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(venueRoomService.getCategoryById(id));
    }

    @PostMapping("/api/venue-ops/categories")
    public ResponseEntity<com.hotel.reservation.entity.RoomCategory> createCategory(
            @RequestBody com.hotel.reservation.entity.RoomCategory category) {
        return ResponseEntity.ok(venueRoomService.createCategory(category));
    }

    @PutMapping("/api/venue-ops/categories/{id}")
    public ResponseEntity<com.hotel.reservation.entity.RoomCategory> updateCategory(
            @PathVariable Long id,
            @RequestBody com.hotel.reservation.entity.RoomCategory category) {
        return ResponseEntity.ok(venueRoomService.updateCategory(id, category));
    }

    @DeleteMapping("/api/venue-ops/categories/{id}")
    public ResponseEntity<Map<String, String>> deleteCategory(@PathVariable Long id) {
        venueRoomService.deleteCategory(id);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Room Category #" + id + " deleted successfully.");
        return ResponseEntity.ok(res);
    }

    // Facility CRUD Endpoints (Samath - Component 2)
    @GetMapping("/api/venue-ops/facilities")
    public ResponseEntity<List<com.hotel.reservation.entity.Facility>> getAllFacilities() {
        return ResponseEntity.ok(venueRoomService.getAllFacilities());
    }

    @GetMapping("/api/venue-ops/facilities/{id}")
    public ResponseEntity<com.hotel.reservation.entity.Facility> getFacilityById(@PathVariable Long id) {
        return ResponseEntity.ok(venueRoomService.getFacilityById(id));
    }

    @PostMapping("/api/venue-ops/facilities")
    public ResponseEntity<com.hotel.reservation.entity.Facility> createFacility(
            @RequestBody com.hotel.reservation.entity.Facility facility) {
        return ResponseEntity.ok(venueRoomService.createFacility(facility));
    }

    @PutMapping("/api/venue-ops/facilities/{id}")
    public ResponseEntity<com.hotel.reservation.entity.Facility> updateFacility(
            @PathVariable Long id,
            @RequestBody com.hotel.reservation.entity.Facility facility) {
        return ResponseEntity.ok(venueRoomService.updateFacility(id, facility));
    }

    @DeleteMapping("/api/venue-ops/facilities/{id}")
    public ResponseEntity<Map<String, String>> deleteFacility(@PathVariable Long id) {
        venueRoomService.deleteFacility(id);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Facility #" + id + " deleted successfully.");
        return ResponseEntity.ok(res);
    }
}
