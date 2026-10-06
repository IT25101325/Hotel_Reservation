package com.hotel.reservation.controller;

import com.hotel.reservation.dto.ReportDTO;
import com.hotel.reservation.entity.*;
import com.hotel.reservation.service.AdminReportService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminReportService adminReportService;

    // User & Role Management
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminReportService.getAllUsers());
    }

    @PostMapping("/users")
    public ResponseEntity<User> createUser(@Valid @RequestBody User user) {
        return ResponseEntity.ok(adminReportService.createUser(user));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        return ResponseEntity.ok(adminReportService.updateUser(id, user));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        adminReportService.deleteUser(id);
        Map<String, String> res = new HashMap<>();
        res.put("message", "User #" + id + " permanently deleted successfully.");
        return ResponseEntity.ok(res);
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<User> updateUserRole(@PathVariable Long id, @RequestParam RoleName role) {
        User user = adminReportService.updateUserRole(id, role);
        return ResponseEntity.ok(user);
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<User> toggleUserStatus(@PathVariable Long id, @RequestParam boolean active) {
        User user = adminReportService.toggleUserActiveStatus(id, active);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/roles")
    public ResponseEntity<Map<String, Object>> getRolesAndPermissions() {
        return ResponseEntity.ok(adminReportService.getRolesAndPermissions());
    }

    // Complaints & Feedback
    @GetMapping("/feedback")
    public ResponseEntity<List<ComplaintFeedback>> getAllFeedback() {
        return ResponseEntity.ok(adminReportService.getAllFeedback());
    }

    @PostMapping("/feedback")
    public ResponseEntity<ComplaintFeedback> createFeedback(
            @RequestParam(required = false) Long userId,
            @RequestBody ComplaintFeedback complaintFeedback) {
        return ResponseEntity.ok(adminReportService.createComplaintFeedback(userId, complaintFeedback));
    }

    @PostMapping("/feedback/{id}/respond")
    public ResponseEntity<ComplaintFeedback> respondToFeedback(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String response = body.get("response");
        String status = body.get("status");
        ComplaintFeedback fb = adminReportService.respondToFeedback(id, response, status);
        return ResponseEntity.ok(fb);
    }

    @DeleteMapping("/feedback/{id}")
    public ResponseEntity<Map<String, String>> deleteFeedback(@PathVariable Long id) {
        adminReportService.deleteFeedback(id);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Feedback/Complaint #" + id + " archived/deleted successfully.");
        return ResponseEntity.ok(res);
    }

    // Announcements
    @GetMapping("/announcements")
    public ResponseEntity<List<Announcement>> getAnnouncements() {
        return ResponseEntity.ok(adminReportService.getAllAnnouncements());
    }

    @PostMapping("/announcements")
    public ResponseEntity<Announcement> createAnnouncement(@Valid @RequestBody Announcement announcement) {
        Announcement created = adminReportService.createAnnouncement(announcement);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/announcements/{id}")
    public ResponseEntity<Announcement> updateAnnouncement(@PathVariable Long id, @RequestBody Announcement announcement) {
        Announcement updated = adminReportService.updateAnnouncement(id, announcement);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/announcements/{id}")
    public ResponseEntity<Map<String, String>> deleteAnnouncement(@PathVariable Long id) {
        adminReportService.deleteAnnouncement(id);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Announcement #" + id + " deleted.");
        return ResponseEntity.ok(res);
    }

    // Activity Logs
    @GetMapping("/activity-logs")
    public ResponseEntity<List<ActivityLog>> getActivityLogs() {
        return ResponseEntity.ok(adminReportService.getActivityLogs());
    }

    @DeleteMapping("/activity-logs/{id}")
    public ResponseEntity<Map<String, String>> deleteActivityLog(@PathVariable Long id) {
        adminReportService.deleteActivityLog(id);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Activity log #" + id + " purged.");
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/activity-logs/clear-old")
    public ResponseEntity<Map<String, String>> clearOldLogs(@RequestParam(defaultValue = "30") int days) {
        int purged = adminReportService.clearLogsOlderThan(days);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Purged " + purged + " log entries older than " + days + " days.");
        return ResponseEntity.ok(res);
    }

    // Consolidated Reports (UC-06 Generate Report <<include>>)
    @GetMapping("/reports/executive")
    public ResponseEntity<ReportDTO> getExecutiveReport() {
        ReportDTO report = adminReportService.generateExecutiveReport();
        return ResponseEntity.ok(report);
    }

    @PostMapping("/reports/generate")
    public ResponseEntity<Map<String, Object>> generateCustomReport(
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate startDate,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate endDate,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(adminReportService.generateCustomReport(startDate, endDate, category));
    }

    @GetMapping("/reports/custom")
    public ResponseEntity<Map<String, Object>> getCustomReport(
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate startDate,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate endDate,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(adminReportService.generateCustomReport(startDate, endDate, category));
    }
}
