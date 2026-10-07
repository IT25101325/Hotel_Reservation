package com.hotel.reservation.repository;

import com.hotel.reservation.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByEmployeeId(Long employeeId);
    List<LeaveRequest> findAllByOrderByIdDesc();

    @org.springframework.data.jpa.repository.Query("SELECT l FROM LeaveRequest l WHERE l.employee.id = :employeeId AND l.status = 'APPROVED' AND :targetDate BETWEEN l.startDate AND l.endDate")
    List<LeaveRequest> findApprovedLeaveForEmployeeOnDate(
            @org.springframework.data.repository.query.Param("employeeId") Long employeeId,
            @org.springframework.data.repository.query.Param("targetDate") java.time.LocalDate targetDate);
}
