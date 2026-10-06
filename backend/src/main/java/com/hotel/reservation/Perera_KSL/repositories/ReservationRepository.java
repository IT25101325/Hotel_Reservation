package com.hotel.reservation.repository;

import com.hotel.reservation.entity.Reservation;
import com.hotel.reservation.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<Reservation> findByCustomerUserUsernameOrderByCreatedAtDesc(String username);

    List<Reservation> findByStatusOrderByCreatedAtDesc(ReservationStatus status);

    List<Reservation> findAllByOrderByCreatedAtDesc();

    // Core double booking prevention overlap query:
    // A booking overlaps if requested StartDate <= Existing EndDate AND requested EndDate >= Existing StartDate
    @Query("SELECT r FROM Reservation r WHERE r.venueRoom.id = :venueRoomId " +
           "AND r.status IN (com.hotel.reservation.entity.ReservationStatus.PENDING, com.hotel.reservation.entity.ReservationStatus.APPROVED, com.hotel.reservation.entity.ReservationStatus.CONFIRMED, com.hotel.reservation.entity.ReservationStatus.CANCEL_REQUESTED) " +
           "AND (r.startDate <= :endDate AND r.endDate >= :startDate)")
    List<Reservation> findOverlappingReservations(@Param("venueRoomId") Long venueRoomId,
                                                   @Param("startDate") LocalDate startDate,
                                                   @Param("endDate") LocalDate endDate);

    @Query("SELECT r FROM Reservation r WHERE r.venueRoom.id = :venueRoomId " +
           "AND r.id <> :excludeId " +
           "AND r.status IN (com.hotel.reservation.entity.ReservationStatus.PENDING, com.hotel.reservation.entity.ReservationStatus.APPROVED, com.hotel.reservation.entity.ReservationStatus.CONFIRMED, com.hotel.reservation.entity.ReservationStatus.CANCEL_REQUESTED) " +
           "AND (r.startDate <= :endDate AND r.endDate >= :startDate)")
    List<Reservation> findOverlappingReservationsExcludingId(@Param("venueRoomId") Long venueRoomId,
                                                              @Param("startDate") LocalDate startDate,
                                                              @Param("endDate") LocalDate endDate,
                                                              @Param("excludeId") Long excludeId);

    @Query("SELECT r FROM Reservation r WHERE r.venueRoom.id = :venueRoomId")
    List<Reservation> findByVenueRoomId(@Param("venueRoomId") Long venueRoomId);

    @Query("SELECT r FROM Reservation r WHERE r.eventPackage.id = :packageId")
    List<Reservation> findByEventPackageId(@Param("packageId") Long packageId);
}
