package com.hotel.reservation.controller;

import com.hotel.reservation.entity.EventPackage;
import com.hotel.reservation.service.EventPackageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class EventPackageController {

    @Autowired
    private EventPackageService eventPackageService;

    // Public endpoints
    @GetMapping("/api/public/packages")
    public ResponseEntity<List<EventPackage>> getPublicPackages() {
        return ResponseEntity.ok(eventPackageService.getPublishedPackages());
    }

    @GetMapping("/api/public/packages/{id}")
    public ResponseEntity<EventPackage> getPackageById(@PathVariable Long id) {
        return ResponseEntity.ok(eventPackageService.getPackageById(id));
    }

    // Event Coordinator Management Endpoints
    @GetMapping("/api/event-packages/manage/all")
    public ResponseEntity<List<EventPackage>> getAllPackages() {
        return ResponseEntity.ok(eventPackageService.getAllPackages());
    }

    @PostMapping("/api/event-packages/manage")
    public ResponseEntity<EventPackage> createPackage(@Valid @RequestBody EventPackage eventPackage) {
        EventPackage created = eventPackageService.createPackage(eventPackage);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/api/event-packages/manage/{id}")
    public ResponseEntity<EventPackage> updatePackage(@PathVariable Long id, @Valid @RequestBody EventPackage eventPackage) {
        EventPackage updated = eventPackageService.updatePackage(id, eventPackage);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/api/event-packages/manage/{id}/publish")
    public ResponseEntity<EventPackage> publishPackage(@PathVariable Long id) {
        EventPackage published = eventPackageService.publishPackage(id);
        return ResponseEntity.ok(published);
    }

    @PatchMapping("/api/event-packages/manage/{id}/unpublish")
    public ResponseEntity<EventPackage> unpublishPackage(@PathVariable Long id) {
        EventPackage unpublished = eventPackageService.unpublishPackage(id);
        return ResponseEntity.ok(unpublished);
    }

    @DeleteMapping("/api/event-packages/manage/{id}")
    public ResponseEntity<Map<String, String>> deletePackage(@PathVariable Long id) {
        eventPackageService.deletePackage(id);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Event Package #" + id + " deleted successfully.");
        return ResponseEntity.ok(res);
    }

    // Granular Package Services Endpoints (Sahathma - Component 3)
    @GetMapping("/api/event-packages/manage/{id}/services")
    public ResponseEntity<List<String>> getPackageServices(@PathVariable Long id) {
        return ResponseEntity.ok(eventPackageService.getPackageServices(id));
    }

    @PostMapping("/api/event-packages/manage/{id}/services")
    public ResponseEntity<EventPackage> addPackageService(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(eventPackageService.addPackageService(id, body.get("serviceName")));
    }

    @DeleteMapping("/api/event-packages/manage/{id}/services")
    public ResponseEntity<EventPackage> removePackageService(
            @PathVariable Long id,
            @RequestParam String serviceName) {
        return ResponseEntity.ok(eventPackageService.removePackageService(id, serviceName));
    }

    // Promotion CRUD Endpoints (Sahathma - Component 3)
    @GetMapping("/api/public/promotions")
    public ResponseEntity<List<com.hotel.reservation.entity.Promotion>> getPublicPromotions() {
        return ResponseEntity.ok(eventPackageService.getAllPromotions());
    }

    @GetMapping("/api/event-packages/promotions")
    public ResponseEntity<List<com.hotel.reservation.entity.Promotion>> getAllPromotions() {
        return ResponseEntity.ok(eventPackageService.getAllPromotions());
    }

    @GetMapping("/api/event-packages/promotions/{id}")
    public ResponseEntity<com.hotel.reservation.entity.Promotion> getPromotionById(@PathVariable Long id) {
        return ResponseEntity.ok(eventPackageService.getPromotionById(id));
    }

    @PostMapping("/api/event-packages/promotions")
    public ResponseEntity<com.hotel.reservation.entity.Promotion> createPromotion(
            @RequestBody com.hotel.reservation.entity.Promotion promotion) {
        return ResponseEntity.ok(eventPackageService.createPromotion(promotion));
    }

    @PutMapping("/api/event-packages/promotions/{id}")
    public ResponseEntity<com.hotel.reservation.entity.Promotion> updatePromotion(
            @PathVariable Long id,
            @RequestBody com.hotel.reservation.entity.Promotion promotion) {
        return ResponseEntity.ok(eventPackageService.updatePromotion(id, promotion));
    }

    @DeleteMapping("/api/event-packages/promotions/{id}")
    public ResponseEntity<Map<String, String>> deletePromotion(@PathVariable Long id) {
        eventPackageService.deletePromotion(id);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Promotion #" + id + " deleted successfully.");
        return ResponseEntity.ok(res);
    }

    // Event Schedule CRUD Endpoints (Sahathma - Component 3)
    @GetMapping("/api/event-packages/schedules")
    public ResponseEntity<List<com.hotel.reservation.entity.EventSchedule>> getAllSchedules() {
        return ResponseEntity.ok(eventPackageService.getAllSchedules());
    }

    @GetMapping("/api/event-packages/schedules/{id}")
    public ResponseEntity<com.hotel.reservation.entity.EventSchedule> getScheduleById(@PathVariable Long id) {
        return ResponseEntity.ok(eventPackageService.getScheduleById(id));
    }

    @PostMapping("/api/event-packages/schedules")
    public ResponseEntity<com.hotel.reservation.entity.EventSchedule> createSchedule(
            @RequestBody com.hotel.reservation.entity.EventSchedule schedule) {
        return ResponseEntity.ok(eventPackageService.createSchedule(schedule));
    }

    @PutMapping("/api/event-packages/schedules/{id}")
    public ResponseEntity<com.hotel.reservation.entity.EventSchedule> updateSchedule(
            @PathVariable Long id,
            @RequestBody com.hotel.reservation.entity.EventSchedule schedule) {
        return ResponseEntity.ok(eventPackageService.updateSchedule(id, schedule));
    }

    @DeleteMapping("/api/event-packages/schedules/{id}")
    public ResponseEntity<Map<String, String>> deleteSchedule(@PathVariable Long id) {
        eventPackageService.deleteSchedule(id);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Event Schedule #" + id + " cancelled/deleted successfully.");
        return ResponseEntity.ok(res);
    }
}
