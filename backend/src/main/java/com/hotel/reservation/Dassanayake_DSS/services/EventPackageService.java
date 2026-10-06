package com.hotel.reservation.service;

import com.hotel.reservation.entity.EventPackage;
import com.hotel.reservation.entity.Reservation;
import com.hotel.reservation.exception.BadRequestException;
import com.hotel.reservation.exception.ResourceNotFoundException;
import com.hotel.reservation.repository.EventPackageRepository;
import com.hotel.reservation.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class EventPackageService {

    @Autowired
    private EventPackageRepository eventPackageRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    public List<EventPackage> getPublishedPackages() {
        return eventPackageRepository.findByPublished(true);
    }

    public List<EventPackage> getAllPackages() {
        return eventPackageRepository.findAll();
    }

    public EventPackage getPackageById(Long id) {
        return eventPackageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event Package with ID " + id + " not found."));
    }

    @Transactional
    public EventPackage createPackage(EventPackage eventPackage) {
        if (eventPackage.getName() == null || eventPackage.getName().trim().isEmpty()) {
            throw new BadRequestException("Event package name is required and cannot be blank.");
        }
        if (eventPackage.getPrice() != null && eventPackage.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Event package price cannot be negative.");
        }
        if (eventPackage.getMaxCapacity() != null && eventPackage.getMaxCapacity() < 2) {
            throw new BadRequestException("Package maximum capacity must be at least 2 person.");
        }
        if (eventPackage.getImageUrl() == null || eventPackage.getImageUrl().trim().isEmpty()) {
            throw new BadRequestException("Package photo URL is strictly required. Cannot save package without a photo URL.");
        }
        eventPackage.setName(eventPackage.getName().trim());
        eventPackage.setImageUrl(eventPackage.getImageUrl().trim());
        // Initially saved as unpublished unless validated
        eventPackage.setPublished(false);
        return eventPackageRepository.save(eventPackage);
    }

    @Transactional
    public EventPackage updatePackage(Long id, EventPackage updated) {
        EventPackage pkg = getPackageById(id);

        if (updated.getName() != null && !updated.getName().trim().isEmpty()) {
            pkg.setName(updated.getName().trim());
        }
        pkg.setEventType(updated.getEventType());
        pkg.setDescription(updated.getDescription());
        if (updated.getPrice() != null && updated.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Event package price cannot be negative.");
        }
        pkg.setPrice(updated.getPrice());
        if (updated.getMaxCapacity() != null && updated.getMaxCapacity() < 2) {
            throw new BadRequestException("Package maximum capacity must be at least 2 person.");
        }
        pkg.setMaxCapacity(updated.getMaxCapacity());
        pkg.setDiscountPercentage(updated.getDiscountPercentage());
        if (updated.getImageUrl() != null) {
            if (updated.getImageUrl().trim().isEmpty()) {
                throw new BadRequestException("Package photo URL cannot be empty. A photo URL is required.");
            }
            pkg.setImageUrl(updated.getImageUrl().trim());
        }
        if (updated.getIncludedServices() != null) pkg.setIncludedServices(updated.getIncludedServices());

        return eventPackageRepository.save(pkg);
    }

    @Transactional
    public EventPackage publishPackage(Long id) {
        EventPackage pkg = getPackageById(id);

        // Validation (UC-03 extension 7a): Block publishing if package info is incomplete
        if (pkg.getName() == null || pkg.getName().trim().isEmpty() ||
            pkg.getPrice() == null || pkg.getPrice().compareTo(BigDecimal.ZERO) <= 0 ||
            pkg.getMaxCapacity() == null || pkg.getMaxCapacity() <= 0 ||
            pkg.getIncludedServices() == null || pkg.getIncludedServices().isEmpty()) {
            throw new BadRequestException("Cannot publish package #" + id + ": Package details are incomplete. Ensure name, valid price, capacity, and at least one included service are specified.");
        }

        pkg.setPublished(true);
        return eventPackageRepository.save(pkg);
    }

    @Transactional
    public EventPackage unpublishPackage(Long id) {
        EventPackage pkg = getPackageById(id);
        pkg.setPublished(false);
        return eventPackageRepository.save(pkg);
    }

    @Transactional
    public void deletePackage(Long id) {
        EventPackage pkg = getPackageById(id);
        List<Reservation> reservations = reservationRepository.findByEventPackageId(id);
        for (Reservation r : reservations) {
            r.setEventPackage(null);
            reservationRepository.save(r);
        }
        eventPackageRepository.delete(pkg);
    }

    // Granular Package Service CRUD (Sahathma - Component 3)
    public List<String> getPackageServices(Long packageId) {
        return getPackageById(packageId).getIncludedServices();
    }

    @Transactional
    public EventPackage addPackageService(Long packageId, String serviceName) {
        EventPackage pkg = getPackageById(packageId);
        if (serviceName != null && !serviceName.trim().isEmpty()) {
            pkg.getIncludedServices().add(serviceName.trim());
        }
        return eventPackageRepository.save(pkg);
    }

    @Transactional
    public EventPackage removePackageService(Long packageId, String serviceName) {
        EventPackage pkg = getPackageById(packageId);
        pkg.getIncludedServices().remove(serviceName);
        return eventPackageRepository.save(pkg);
    }

    // Promotion CRUD (Sahathma - Component 3)
    @Autowired
    private com.hotel.reservation.repository.PromotionRepository promotionRepository;

    public List<com.hotel.reservation.entity.Promotion> getAllPromotions() {
        return promotionRepository.findAll();
    }

    public com.hotel.reservation.entity.Promotion getPromotionById(Long id) {
        return promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion #" + id + " not found."));
    }

    @Transactional
    public com.hotel.reservation.entity.Promotion createPromotion(com.hotel.reservation.entity.Promotion promo) {
        if (promo.getTitle() == null || promo.getTitle().trim().isEmpty()) {
            throw new BadRequestException("Promotion title is required.");
        }
        if (promo.getPromoCode() == null || promo.getPromoCode().trim().isEmpty()) {
            throw new BadRequestException("Promotion code is required.");
        }
        if (promo.getDiscountPercentage() != null && (promo.getDiscountPercentage() < 1 || promo.getDiscountPercentage() > 100)) {
            throw new BadRequestException("Discount percentage must be between 1% and 100%.");
        }
        if (promo.getStartDate() != null && promo.getEndDate() != null && promo.getEndDate().isBefore(promo.getStartDate())) {
            throw new BadRequestException("Promotion end date must be on or after start date.");
        }
        promo.setTitle(promo.getTitle().trim());
        promo.setPromoCode(promo.getPromoCode().trim().toUpperCase());
        return promotionRepository.save(promo);
    }

    @Transactional
    public com.hotel.reservation.entity.Promotion updatePromotion(Long id, com.hotel.reservation.entity.Promotion updated) {
        com.hotel.reservation.entity.Promotion existing = getPromotionById(id);
        if (updated.getTitle() != null) {
            if (updated.getTitle().trim().isEmpty()) throw new BadRequestException("Promotion title cannot be blank.");
            existing.setTitle(updated.getTitle().trim());
        }
        if (updated.getPromoCode() != null) {
            if (updated.getPromoCode().trim().isEmpty()) throw new BadRequestException("Promotion code cannot be blank.");
            existing.setPromoCode(updated.getPromoCode().trim().toUpperCase());
        }
        if (updated.getDiscountPercentage() != null) {
            if (updated.getDiscountPercentage() < 1 || updated.getDiscountPercentage() > 100) {
                throw new BadRequestException("Discount percentage must be between 1% and 100%.");
            }
            existing.setDiscountPercentage(updated.getDiscountPercentage());
        }
        if (updated.getStartDate() != null) existing.setStartDate(updated.getStartDate());
        if (updated.getEndDate() != null) existing.setEndDate(updated.getEndDate());
        if (existing.getStartDate() != null && existing.getEndDate() != null && existing.getEndDate().isBefore(existing.getStartDate())) {
            throw new BadRequestException("Promotion end date must be on or after start date.");
        }
        if (updated.getTargetEventType() != null) existing.setTargetEventType(updated.getTargetEventType());
        if (updated.getActive() != null) existing.setActive(updated.getActive());
        return promotionRepository.save(existing);
    }

    @Transactional
    public void deletePromotion(Long id) {
        com.hotel.reservation.entity.Promotion promo = getPromotionById(id);
        promotionRepository.delete(promo);
    }

    // Event Schedule CRUD (Sahathma - Component 3)
    @Autowired
    private com.hotel.reservation.repository.EventScheduleRepository eventScheduleRepository;

    public List<com.hotel.reservation.entity.EventSchedule> getAllSchedules() {
        return eventScheduleRepository.findAllByOrderByScheduleDateDesc();
    }

    public com.hotel.reservation.entity.EventSchedule getScheduleById(Long id) {
        return eventScheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event Schedule #" + id + " not found."));
    }

    @Transactional
    public com.hotel.reservation.entity.EventSchedule createSchedule(com.hotel.reservation.entity.EventSchedule schedule) {
        if (schedule.getTitle() == null || schedule.getTitle().trim().isEmpty()) {
            throw new BadRequestException("Event schedule title is required.");
        }
        if (schedule.getScheduleDate() == null) {
            throw new BadRequestException("Event schedule date is required.");
        }
        schedule.setTitle(schedule.getTitle().trim());
        return eventScheduleRepository.save(schedule);
    }

    @Transactional
    public com.hotel.reservation.entity.EventSchedule updateSchedule(Long id, com.hotel.reservation.entity.EventSchedule updated) {
        com.hotel.reservation.entity.EventSchedule existing = getScheduleById(id);
        if (updated.getTitle() != null) existing.setTitle(updated.getTitle());
        if (updated.getEventPackage() != null) existing.setEventPackage(updated.getEventPackage());
        if (updated.getVenueRoom() != null) existing.setVenueRoom(updated.getVenueRoom());
        if (updated.getScheduleDate() != null) existing.setScheduleDate(updated.getScheduleDate());
        if (updated.getStartTime() != null) existing.setStartTime(updated.getStartTime());
        if (updated.getEndTime() != null) existing.setEndTime(updated.getEndTime());
        if (updated.getCoordinatorName() != null) existing.setCoordinatorName(updated.getCoordinatorName());
        if (updated.getStatus() != null) existing.setStatus(updated.getStatus());
        if (updated.getNotes() != null) existing.setNotes(updated.getNotes());
        return eventScheduleRepository.save(existing);
    }

    @Transactional
    public void deleteSchedule(Long id) {
        com.hotel.reservation.entity.EventSchedule schedule = getScheduleById(id);
        eventScheduleRepository.delete(schedule);
    }
}
