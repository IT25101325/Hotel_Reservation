package com.hotel.reservation.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "resource_allocations")
public class ResourceAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    private String resourceName; // e.g. Sound System A, Projector 4K, Stage Lighting Set B, Executive Car

    private String roleAssigned; // Lead Coordinator, Catering Staff, Tech Support

    @Column(nullable = false)
    private LocalDate allocationDate;

    public ResourceAllocation() {}

    public ResourceAllocation(Reservation reservation, Employee employee, String resourceName, String roleAssigned, LocalDate allocationDate) {
        this.reservation = reservation;
        this.employee = employee;
        this.resourceName = resourceName;
        this.roleAssigned = roleAssigned;
        this.allocationDate = allocationDate;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Reservation getReservation() { return reservation; }
    public void setReservation(Reservation reservation) { this.reservation = reservation; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

    public String getResourceName() { return resourceName; }
    public void setResourceName(String resourceName) { this.resourceName = resourceName; }

    public String getRoleAssigned() { return roleAssigned; }
    public void setRoleAssigned(String roleAssigned) { this.roleAssigned = roleAssigned; }

    public LocalDate getAllocationDate() { return allocationDate; }
    public void setAllocationDate(LocalDate allocationDate) { this.allocationDate = allocationDate; }
}
