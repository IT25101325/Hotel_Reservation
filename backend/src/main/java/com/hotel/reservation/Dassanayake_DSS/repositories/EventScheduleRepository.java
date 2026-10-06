package com.hotel.reservation.repository;

import com.hotel.reservation.entity.EventSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventScheduleRepository extends JpaRepository<EventSchedule, Long> {
    List<EventSchedule> findByScheduleDateOrderByStartTimeAsc(LocalDate scheduleDate);
    List<EventSchedule> findAllByOrderByScheduleDateDesc();
}
