package com.hotel.reservation.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class ResourceAllocationRequest {

    @NotNull(message = "Reservation ID is required")
    private Long reservationId;

    private Long employeeId;

    private String resourceName;

    private String roleAssigned;

    @NotNull(message = "Allocation date is required")
    private LocalDate allocationDate;

    public ResourceAllocationRequest() {}

    public Long getReservationId() { return reservationId; }
    public void setReservationId(Long reservationId) { this.reservationId = reservationId; }

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public String getResourceName() { return resourceName; }
    public void setResourceName(String resourceName) { this.resourceName = resourceName; }

    public String getRoleAssigned() { return roleAssigned; }
    public void setRoleAssigned(String roleAssigned) { this.roleAssigned = roleAssigned; }

    public LocalDate getAllocationDate() { return allocationDate; }
    public void setAllocationDate(LocalDate allocationDate) { this.allocationDate = allocationDate; }
}
