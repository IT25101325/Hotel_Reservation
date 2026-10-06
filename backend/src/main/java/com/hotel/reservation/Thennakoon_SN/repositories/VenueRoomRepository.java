package com.hotel.reservation.repository;

import com.hotel.reservation.entity.VenueRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VenueRoomRepository extends JpaRepository<VenueRoom, Long> {
    List<VenueRoom> findByType(String type);
    List<VenueRoom> findByCategory(String category);
    List<VenueRoom> findByAvailable(boolean available);
}
