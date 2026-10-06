package com.hotel.reservation.repository;

import com.hotel.reservation.entity.Guest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GuestRepository extends JpaRepository<Guest, Long> {
    List<Guest> findByCustomerIdOrderByIdDesc(Long customerId);
    List<Guest> findByCustomerUserUsernameOrderByIdDesc(String username);
}
