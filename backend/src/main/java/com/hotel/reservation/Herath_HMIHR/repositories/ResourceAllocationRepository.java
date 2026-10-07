package com.hotel.reservation.repository;

import com.hotel.reservation.entity.ResourceAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ResourceAllocationRepository extends JpaRepository<ResourceAllocation, Long> {
    List<ResourceAllocation> findByReservationId(Long reservationId);
    List<ResourceAllocation> findByEmployeeId(Long employeeId);

    @Query("SELECT r FROM ResourceAllocation r WHERE r.employee.id = :employeeId AND r.allocationDate = :date")
    List<ResourceAllocation> findOverlappingStaffAllocation(@Param("employeeId") Long employeeId, @Param("date") LocalDate date);
}
