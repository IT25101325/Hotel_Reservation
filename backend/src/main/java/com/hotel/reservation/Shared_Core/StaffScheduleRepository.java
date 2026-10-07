package com.hotel.reservation.repository;

import com.hotel.reservation.entity.StaffSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface StaffScheduleRepository extends JpaRepository<StaffSchedule, Long> {
    List<StaffSchedule> findByEmployeeIdOrderByShiftDateDesc(Long employeeId);
    List<StaffSchedule> findByShiftDateOrderByStartTimeAsc(LocalDate shiftDate);
    List<StaffSchedule> findAllByOrderByShiftDateDesc();
}
