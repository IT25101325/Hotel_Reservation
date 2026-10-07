package com.hotel.reservation.controller;

import com.hotel.reservation.dto.LeaveRequestDTO;
import com.hotel.reservation.dto.ResourceAllocationRequest;
import com.hotel.reservation.entity.Employee;
import com.hotel.reservation.entity.LeaveRequest;
import com.hotel.reservation.entity.ResourceAllocation;
import com.hotel.reservation.service.HRResourceService;
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
@RequestMapping("/api/hr")
@CrossOrigin(origins = "*")
public class HRResourceController {

    @Autowired
    private HRResourceService hrResourceService;

    // Employees
    @GetMapping("/users")
    public ResponseEntity<List<com.hotel.reservation.entity.User>> getAllUsers() {
        return ResponseEntity.ok(hrResourceService.getAllUsers());
    }

    @GetMapping("/employees")
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(hrResourceService.getAllEmployees());
    }

    @GetMapping("/employees/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id) {
        return ResponseEntity.ok(hrResourceService.getEmployeeById(id));
    }

    @PostMapping("/employees")
    public ResponseEntity<Employee> createEmployee(@Valid @RequestBody Employee employee) {
        Employee created = hrResourceService.createEmployee(employee);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/employees/{id}")
    public ResponseEntity<Employee> updateEmployee(@PathVariable Long id, @Valid @RequestBody Employee employee) {
        Employee updated = hrResourceService.updateEmployee(id, employee);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/employees/{id}")
    public ResponseEntity<Map<String, String>> deactivateEmployee(@PathVariable Long id) {
        hrResourceService.deactivateEmployee(id);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Employee #" + id + " deactivated successfully.");
        return ResponseEntity.ok(res);
    }

    // Leave Requests
    @GetMapping("/leaves")
    public ResponseEntity<List<LeaveRequest>> getAllLeaves() {
        return ResponseEntity.ok(hrResourceService.getAllLeaveRequests());
    }

    @PostMapping("/leaves")
    public ResponseEntity<LeaveRequest> submitLeave(
            @RequestBody(required = false) LeaveRequestDTO dto,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String reason) {
        if (dto == null) {
            dto = new LeaveRequestDTO(employeeId, startDate, endDate, reason);
        }
        LeaveRequest leave = hrResourceService.submitLeaveRequest(dto);
        return ResponseEntity.ok(leave);
    }

    @PutMapping("/leaves/{id}")
    public ResponseEntity<LeaveRequest> updateLeave(
            @PathVariable Long id,
            @RequestBody LeaveRequestDTO dto) {
        return ResponseEntity.ok(hrResourceService.updateLeaveRequest(id, dto));
    }

    @PatchMapping("/leaves/{id}/status")
    public ResponseEntity<LeaveRequest> updateLeaveStatus(@PathVariable Long id, @RequestParam String status) {
        LeaveRequest leave = hrResourceService.updateLeaveStatus(id, status);
        return ResponseEntity.ok(leave);
    }

    @PatchMapping("/leaves/{id}/approve")
    public ResponseEntity<LeaveRequest> approveLeave(@PathVariable Long id) {
        LeaveRequest leave = hrResourceService.updateLeaveStatus(id, "APPROVED");
        return ResponseEntity.ok(leave);
    }

    @PatchMapping("/leaves/{id}/reject")
    public ResponseEntity<LeaveRequest> rejectLeave(@PathVariable Long id) {
        LeaveRequest leave = hrResourceService.updateLeaveStatus(id, "REJECTED");
        return ResponseEntity.ok(leave);
    }

    @DeleteMapping("/leaves/{id}")
    public ResponseEntity<Map<String, String>> cancelLeave(@PathVariable Long id) {
        hrResourceService.cancelLeaveRequest(id);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Leave request #" + id + " cancelled/deleted successfully.");
        return ResponseEntity.ok(res);
    }

    // Resource Allocations
    @GetMapping("/allocations")
    public ResponseEntity<List<ResourceAllocation>> getAllAllocations() {
        return ResponseEntity.ok(hrResourceService.getAllAllocations());
    }

    @GetMapping("/allocations/reservation/{reservationId}")
    public ResponseEntity<List<ResourceAllocation>> getReservationAllocations(@PathVariable Long reservationId) {
        return ResponseEntity.ok(hrResourceService.getReservationAllocations(reservationId));
    }

    @PostMapping("/allocations")
    public ResponseEntity<ResourceAllocation> allocateResource(@Valid @RequestBody ResourceAllocationRequest request) {
        ResourceAllocation allocation = hrResourceService.allocateResource(request);
        return ResponseEntity.ok(allocation);
    }

    @PutMapping("/allocations/{id}")
    public ResponseEntity<ResourceAllocation> updateAllocation(
            @PathVariable Long id,
            @Valid @RequestBody ResourceAllocationRequest request) {
        return ResponseEntity.ok(hrResourceService.updateAllocation(id, request));
    }

    @DeleteMapping("/allocations/{id}")
    public ResponseEntity<Map<String, String>> removeAllocation(@PathVariable Long id) {
        hrResourceService.removeAllocation(id);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Allocation #" + id + " removed successfully.");
        return ResponseEntity.ok(res);
    }

    // Staff Duty Schedule CRUD Endpoints (Ishika - Component 5)
    @GetMapping("/schedules")
    public ResponseEntity<List<com.hotel.reservation.entity.StaffSchedule>> getAllSchedules() {
        return ResponseEntity.ok(hrResourceService.getAllSchedules());
    }

    @GetMapping("/schedules/{id}")
    public ResponseEntity<com.hotel.reservation.entity.StaffSchedule> getScheduleById(@PathVariable Long id) {
        return ResponseEntity.ok(hrResourceService.getScheduleById(id));
    }

    @PostMapping("/schedules")
    public ResponseEntity<com.hotel.reservation.entity.StaffSchedule> createSchedule(
            @RequestParam(required = false) Long employeeId,
            @RequestBody com.hotel.reservation.entity.StaffSchedule schedule) {
        Long empId = employeeId;
        if (empId == null && schedule.getEmployee() != null) {
            empId = schedule.getEmployee().getId();
        }
        if (empId == null) {
            throw new com.hotel.reservation.exception.BadRequestException("Employee ID is required to create a duty schedule.");
        }
        return ResponseEntity.ok(hrResourceService.createSchedule(empId, schedule));
    }

    @PutMapping("/schedules/{id}")
    public ResponseEntity<com.hotel.reservation.entity.StaffSchedule> updateSchedule(
            @PathVariable Long id,
            @RequestBody com.hotel.reservation.entity.StaffSchedule schedule) {
        return ResponseEntity.ok(hrResourceService.updateSchedule(id, schedule));
    }

    @DeleteMapping("/schedules/{id}")
    public ResponseEntity<Map<String, String>> deleteSchedule(@PathVariable Long id) {
        hrResourceService.deleteSchedule(id);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Staff duty schedule #" + id + " cancelled/deleted successfully.");
        return ResponseEntity.ok(res);
    }
}
