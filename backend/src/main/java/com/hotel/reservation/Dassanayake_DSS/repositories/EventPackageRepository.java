package com.hotel.reservation.repository;

import com.hotel.reservation.entity.EventPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventPackageRepository extends JpaRepository<EventPackage, Long> {
    List<EventPackage> findByPublished(boolean published);
    List<EventPackage> findByEventTypeAndPublished(String eventType, boolean published);
}
