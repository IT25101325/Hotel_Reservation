package com.hotel.reservation.repository;

import com.hotel.reservation.entity.ComplaintFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintFeedbackRepository extends JpaRepository<ComplaintFeedback, Long> {
    List<ComplaintFeedback> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<ComplaintFeedback> findByUserUsernameOrderByCreatedAtDesc(String username);
    List<ComplaintFeedback> findAllByOrderByCreatedAtDesc();
}
