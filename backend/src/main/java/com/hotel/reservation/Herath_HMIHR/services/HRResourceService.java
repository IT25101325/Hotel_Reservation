package com.hotel.reservation.service;

import com.hotel.reservation.dto.LeaveRequestDTO;
import com.hotel.reservation.dto.ResourceAllocationRequest;
import com.hotel.reservation.entity.*;
import com.hotel.reservation.exception.BadRequestException;
import com.hotel.reservation.exception.ResourceNotFoundException;
import com.hotel.reservation.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class HRResourceService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private ResourceAllocationRepository resourceAllocationRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    // Users available for linking
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Employee CRUD
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee with ID " + id + " not found."));
    }

    @Transactional
    public Employee createEmployee(Employee employee) {
        if (employee.getFullName() == null || employee.getFullName().trim().isEmpty()) {
            throw new BadRequestException("Employee full name is required.");
        }
        if (employee.getEmployeeCode() == null || employee.getEmployeeCode().trim().isEmpty()) {
            throw new BadRequestException("Employee code is required.");
        }
        if (employee.getSalary() != null && employee.getSalary().compareTo(java.math.BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Employee salary cannot be negative.");
        }
        employee.setEmployeeCode(employee.getEmployeeCode().trim().toUpperCase());
        employee.setFullName(employee.getFullName().trim());

        if (employee.getPhone() != null && !employee.getPhone().trim().isEmpty()) {
            String cleanPhone = employee.getPhone().replaceAll("[\\s-]", "");
            if (!cleanPhone.matches("^(?:0\\d{9}|\\+94\\d{9}|\\+\\d{10,14})$")) {
                throw new BadRequestException("Invalid phone number format. Must be 10 digits for local (e.g. 0771234567) or 10-15 digits with country code (e.g. +94771234567).");
            }
            employee.setPhone(cleanPhone);
        }
        if (employee.getHireDate() == null) {
            employee.setHireDate(java.time.LocalDate.now());
        }
        if (employee.getUser() != null && employee.getUser().getId() != null) {
            userRepository.findById(employee.getUser().getId()).ifPresent(employee::setUser);
        }

        if (employeeRepository.findByEmployeeCode(employee.getEmployeeCode()).isPresent()) {
            throw new BadRequestException("Employee code " + employee.getEmployeeCode() + " already exists.");
        }
        return employeeRepository.save(employee);
    }

    @Transactional
    public Employee updateEmployee(Long id, Employee updated) {
        Employee emp = getEmployeeById(id);
        if (updated.getFullName() != null) {
            if (updated.getFullName().trim().isEmpty()) throw new BadRequestException("Employee full name cannot be blank.");
            emp.setFullName(updated.getFullName().trim());
        }
        if (updated.getSalary() != null) {
            if (updated.getSalary().compareTo(java.math.BigDecimal.ZERO) < 0) {
                throw new BadRequestException("Employee salary cannot be negative.");
            }
            emp.setSalary(updated.getSalary());
        }
        if (updated.getDepartment() != null) emp.setDepartment(updated.getDepartment());
        if (updated.getDesignation() != null) emp.setDesignation(updated.getDesignation());
        if (updated.getPhone() != null && !updated.getPhone().trim().isEmpty()) {
            String cleanPhone = updated.getPhone().replaceAll("[\\s-]", "");
            if (!cleanPhone.matches("^(?:0\\d{9}|\\+94\\d{9}|\\+\\d{10,14})$")) {
                throw new BadRequestException("Invalid phone number format. Must be 10 digits for local (e.g. 0771234567) or 10-15 digits with country code (e.g. +94771234567).");
            }
            emp.setPhone(cleanPhone);
        }
        if (updated.getHireDate() != null) emp.setHireDate(updated.getHireDate());
        if (updated.getUser() != null) {
            if (updated.getUser().getId() != null) {
                userRepository.findById(updated.getUser().getId()).ifPresent(emp::setUser);
            } else {
                emp.setUser(null);
            }
        }
        emp.setActive(updated.isActive());
        return employeeRepository.save(emp);
    }

    // Delete/Deactivate Employee (Ishika - Component 5)
    @Transactional
    public void deactivateEmployee(Long id) {
        Employee emp = getEmployeeById(id);
        emp.setActive(false);
        employeeRepository.save(emp);
    }

    @Autowired
    private com.hotel.reservation.repository.StaffScheduleRepository staffScheduleRepository;

    // Leave Requests
    public List<LeaveRequest> getAllLeaveRequests() {
        return leaveRequestRepository.findAllByOrderByIdDesc();
    }

    @Transactional
    public LeaveRequest submitLeaveRequest(LeaveRequestDTO dto) {
        if (dto.getStartDate() == null || dto.getEndDate() == null) {
            throw new BadRequestException("Leave start date and end date are required.");
        }
        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new BadRequestException("Leave end date must be on or after start date.");
        }
        if (dto.getReason() == null || dto.getReason().trim().isEmpty()) {
            throw new BadRequestException("Reason for leave request is required.");
        }

        Employee employee = getEmployeeById(dto.getEmployeeId());
        LeaveRequest leave = new LeaveRequest(employee, dto.getStartDate(), dto.getEndDate(), dto.getReason().trim(), "PENDING");
        return leaveRequestRepository.save(leave);
    }

    @Transactional
    public LeaveRequest updateLeaveStatus(Long leaveId, String status) {
        LeaveRequest leave = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request #" + leaveId + " not found."));
        leave.setStatus(status);
        return leaveRequestRepository.save(leave);
    }

    // Event Staff & Resource Allocations (UC-05)
    public List<ResourceAllocation> getAllAllocations() {
        return resourceAllocationRepository.findAll();
    }

    public List<ResourceAllocation> getReservationAllocations(Long reservationId) {
        return resourceAllocationRepository.findByReservationId(reservationId);
    }

    /**
     * Validates that an employee is active and not on approved leave on the given target date.
     */
    public void validateEmployeeAvailability(Employee employee, java.time.LocalDate targetDate, String assignmentContext) {
        if (employee == null) return;

        // 1. Check if employee is inactive
        if (!employee.isActive()) {
            throw new BadRequestException("Staff Availability Conflict: " + employee.getFullName() + 
                    " (" + employee.getEmployeeCode() + ") is currently INACTIVE and cannot be assigned to " + assignmentContext + ".");
        }

        // 2. Check if employee is on approved leave on target date
        if (targetDate != null) {
            List<LeaveRequest> approvedLeaves = leaveRequestRepository.findApprovedLeaveForEmployeeOnDate(employee.getId(), targetDate);
            if (!approvedLeaves.isEmpty()) {
                LeaveRequest leave = approvedLeaves.get(0);
                throw new BadRequestException("Staff Leave Conflict: " + employee.getFullName() + 
                        " is on APPROVED LEAVE from " + leave.getStartDate() + " to " + leave.getEndDate() + 
                        " (" + leave.getReason() + ") and cannot be assigned to " + assignmentContext + " on " + targetDate + ".");
            }
        }
    }

    @Transactional
    public ResourceAllocation allocateResource(ResourceAllocationRequest request) {
        Reservation reservation = reservationRepository.findById(request.getReservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Reservation #" + request.getReservationId() + " not found."));

        Employee employee = null;
        if (request.getEmployeeId() != null) {
            employee = getEmployeeById(request.getEmployeeId());

            // Core Validation: Block inactive employees or employees on approved leave
            validateEmployeeAvailability(employee, request.getAllocationDate(), "an event resource allocation");

            // Core Validation (UC-05 extension 7a): Block assigning already-allocated employee on the same date
            List<ResourceAllocation> conflicts = resourceAllocationRepository.findOverlappingStaffAllocation(
                    employee.getId(), request.getAllocationDate());

            if (!conflicts.isEmpty()) {
                throw new BadRequestException("Staff Allocation Conflict: Employee " + employee.getFullName() +
                        " is already assigned to event reservation #" + conflicts.get(0).getReservation().getId() +
                        " on " + request.getAllocationDate());
            }
        }

        ResourceAllocation allocation = new ResourceAllocation(
                reservation,
                employee,
                request.getResourceName(),
                request.getRoleAssigned(),
                request.getAllocationDate()
        );

        return resourceAllocationRepository.save(allocation);
    }

    @Transactional
    public void removeAllocation(Long id) {
        ResourceAllocation allocation = resourceAllocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Allocation #" + id + " not found."));
        resourceAllocationRepository.delete(allocation);
    }

    // Update Resource Allocation (Ishika - Component 5)
    @Transactional
    public ResourceAllocation updateAllocation(Long id, ResourceAllocationRequest request) {
        ResourceAllocation allocation = resourceAllocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Allocation #" + id + " not found."));
        if (request.getReservationId() != null) {
            Reservation reservation = reservationRepository.findById(request.getReservationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Reservation #" + request.getReservationId() + " not found."));
            allocation.setReservation(reservation);
        }
        if (request.getResourceName() != null && !request.getResourceName().trim().isEmpty()) {
            allocation.setResourceName(request.getResourceName().trim());
        }
        if (request.getRoleAssigned() != null) {
            allocation.setRoleAssigned(request.getRoleAssigned().trim());
        }
        if (request.getAllocationDate() != null) {
            allocation.setAllocationDate(request.getAllocationDate());
        }

        java.time.LocalDate targetDate = allocation.getAllocationDate();
        Employee employeeToValidate = null;
        if (request.getEmployeeId() != null) {
            employeeToValidate = getEmployeeById(request.getEmployeeId());
        } else if (allocation.getEmployee() != null) {
            employeeToValidate = allocation.getEmployee();
        }

        if (employeeToValidate != null) {
            // Validate availability (not inactive and not on approved leave)
            validateEmployeeAvailability(employeeToValidate, targetDate, "an event resource allocation");

            List<ResourceAllocation> conflicts = resourceAllocationRepository.findOverlappingStaffAllocation(
                    employeeToValidate.getId(), targetDate);
            boolean hasOtherConflict = conflicts.stream().anyMatch(c -> !c.getId().equals(id));
            if (hasOtherConflict) {
                throw new BadRequestException("Staff Allocation Conflict: Employee " + employeeToValidate.getFullName() +
                        " is already assigned to another event on " + targetDate);
            }
            allocation.setEmployee(employeeToValidate);
        }
        return resourceAllocationRepository.save(allocation);
    }

    // Update / Modify Leave Request Details
    @Transactional
    public LeaveRequest updateLeaveRequest(Long id, LeaveRequestDTO dto) {
        LeaveRequest leave = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request #" + id + " not found."));
        if (dto.getStartDate() != null) leave.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null) leave.setEndDate(dto.getEndDate());
        if (dto.getReason() != null && !dto.getReason().isBlank()) leave.setReason(dto.getReason().trim());
        if (dto.getStatus() != null && !dto.getStatus().isBlank()) leave.setStatus(dto.getStatus().trim().toUpperCase());
        if (dto.getEmployeeId() != null) {
            Employee employee = getEmployeeById(dto.getEmployeeId());
            leave.setEmployee(employee);
        }
        return leaveRequestRepository.save(leave);
    }

    // Cancel / Delete Leave Request (Ishika - Component 5)
    @Transactional
    public void cancelLeaveRequest(Long id) {
        LeaveRequest leave = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request #" + id + " not found."));
        leaveRequestRepository.delete(leave);
    }

    // Staff Duty Schedule CRUD (Ishika - Component 5)
    public List<com.hotel.reservation.entity.StaffSchedule> getAllSchedules() {
        return staffScheduleRepository.findAllByOrderByShiftDateDesc();
    }

    public com.hotel.reservation.entity.StaffSchedule getScheduleById(Long id) {
        return staffScheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff Schedule #" + id + " not found."));
    }

    @Transactional
    public com.hotel.reservation.entity.StaffSchedule createSchedule(Long employeeId, com.hotel.reservation.entity.StaffSchedule schedule) {
        Employee emp = getEmployeeById(employeeId);
        if (schedule.getShiftDate() == null) {
            schedule.setShiftDate(java.time.LocalDate.now());
        }

        // Validate employee availability (active and not on approved leave)
        validateEmployeeAvailability(emp, schedule.getShiftDate(), "a staff duty shift");

        schedule.setEmployee(emp);
        if (schedule.getStatus() == null || schedule.getStatus().isBlank()) {
            schedule.setStatus("ASSIGNED");
        }
        return staffScheduleRepository.save(schedule);
    }

    @Transactional
    public com.hotel.reservation.entity.StaffSchedule updateSchedule(Long id, com.hotel.reservation.entity.StaffSchedule updated) {
        com.hotel.reservation.entity.StaffSchedule existing = getScheduleById(id);
        Employee emp = existing.getEmployee();
        if (updated.getEmployee() != null && updated.getEmployee().getId() != null) {
            emp = getEmployeeById(updated.getEmployee().getId());
            existing.setEmployee(emp);
        }
        java.time.LocalDate shiftDate = updated.getShiftDate() != null ? updated.getShiftDate() : existing.getShiftDate();
        if (emp != null) {
            validateEmployeeAvailability(emp, shiftDate, "a staff duty shift");
        }

        if (updated.getShiftType() != null) existing.setShiftType(updated.getShiftType());
        if (updated.getShiftDate() != null) existing.setShiftDate(updated.getShiftDate());
        if (updated.getStartTime() != null) existing.setStartTime(updated.getStartTime());
        if (updated.getEndTime() != null) existing.setEndTime(updated.getEndTime());
        if (updated.getNotes() != null) existing.setNotes(updated.getNotes());
        if (updated.getStatus() != null) existing.setStatus(updated.getStatus());
        return staffScheduleRepository.save(existing);
    }

    @Transactional
    public void deleteSchedule(Long id) {
        com.hotel.reservation.entity.StaffSchedule schedule = getScheduleById(id);
        staffScheduleRepository.delete(schedule);
    }
}
