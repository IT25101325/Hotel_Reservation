package com.hotel.reservation.repository;

import com.hotel.reservation.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findAllByOrderByCreatedAtDesc();
    List<Announcement> findByTargetAudienceInOrderByCreatedAtDesc(List<String> audiences);
    List<Announcement> findByTargetAudienceOrderByCreatedAtDesc(String targetAudience);
}
