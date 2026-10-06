package com.hotel.reservation.service;

import com.hotel.reservation.entity.Reservation;
import com.hotel.reservation.entity.ResourceAllocation;
import com.hotel.reservation.entity.VenueRoom;
import com.hotel.reservation.exception.BadRequestException;
import com.hotel.reservation.exception.DoubleBookingException;
import com.hotel.reservation.exception.ResourceNotFoundException;
import com.hotel.reservation.repository.PaymentRepository;
import com.hotel.reservation.repository.ReservationRepository;
import com.hotel.reservation.repository.ResourceAllocationRepository;
import com.hotel.reservation.repository.VenueRoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class VenueRoomService {

    @Autowired
    private VenueRoomRepository venueRoomRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ResourceAllocationRepository resourceAllocationRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private com.hotel.reservation.repository.RoomCategoryRepository roomCategoryRepository;

    @Autowired
    private com.hotel.reservation.repository.FacilityRepository facilityRepository;

    public List<VenueRoom> getAllVenueRooms() {
        return venueRoomRepository.findAll();
    }

    public List<VenueRoom> getRoomsOnly() {
        return venueRoomRepository.findAll().stream()
                .filter(v -> "ROOM".equalsIgnoreCase(v.getType()))
                .toList();
    }

    public List<VenueRoom> getVenuesOnly() {
        return venueRoomRepository.findAll().stream()
                .filter(v -> !"ROOM".equalsIgnoreCase(v.getType()))
                .toList();
    }

    public List<VenueRoom> getAvailableVenueRooms() {
        return venueRoomRepository.findByAvailable(true);
    }

    public VenueRoom getVenueRoomById(Long id) {
        return venueRoomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room or Venue with ID " + id + " does not exist."));
    }

    @Transactional
    public VenueRoom createVenueRoom(VenueRoom venueRoom) {
        if (venueRoom.getName() == null || venueRoom.getName().trim().isEmpty()) {
            throw new BadRequestException("Room/Venue name is required and cannot be blank.");
        }
        if (venueRoom.getPricePerNight() == null || venueRoom.getPricePerNight().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Price per night must be greater than zero.");
        }
        if (venueRoom.getCapacity() == null || venueRoom.getCapacity() < 1) {
            throw new BadRequestException("Room/Venue guest capacity must be at least 1 person.");
        }
        if (venueRoom.getImageUrl() == null || venueRoom.getImageUrl().trim().isEmpty()) {
            throw new BadRequestException("High-resolution photo URL is strictly required. Cannot save space without a photo URL.");
        }
        venueRoom.setName(venueRoom.getName().trim());
        venueRoom.setImageUrl(venueRoom.getImageUrl().trim());
        return venueRoomRepository.save(venueRoom);
    }

    @Transactional
    public VenueRoom updateVenueRoom(Long id, VenueRoom updated) {
        VenueRoom existing = getVenueRoomById(id);

        if (updated.getName() != null) {
            if (updated.getName().trim().isEmpty()) {
                throw new BadRequestException("Room/Venue name cannot be blank.");
            }
            existing.setName(updated.getName().trim());
        }
        if (updated.getPricePerNight() != null) {
            if (updated.getPricePerNight().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Price per night must be greater than zero.");
            }
            existing.setPricePerNight(updated.getPricePerNight());
        }
        if (updated.getCapacity() != null) {
            if (updated.getCapacity() < 1) {
                throw new BadRequestException("Room/Venue guest capacity must be at least 1 person.");
            }
            existing.setCapacity(updated.getCapacity());
        }
        if (updated.getType() != null) existing.setType(updated.getType());
        if (updated.getCategory() != null) existing.setCategory(updated.getCategory());
        if (updated.getFacilities() != null) existing.setFacilities(updated.getFacilities());
        if (updated.getDescription() != null) existing.setDescription(updated.getDescription());
        if (updated.getImageUrl() != null) {
            if (updated.getImageUrl().trim().isEmpty()) {
                throw new BadRequestException("High-resolution photo URL cannot be empty. A photo URL is required.");
            }
            existing.setImageUrl(updated.getImageUrl().trim());
        }
        existing.setAvailable(updated.isAvailable());

        return venueRoomRepository.save(existing);
    }

    @Transactional
    public void deleteVenueRoom(Long id) {
        VenueRoom venueRoom = getVenueRoomById(id);

        // Delete all reservations and their child entities (payments, allocations) associated with this venue
        List<Reservation> reservations = reservationRepository.findByVenueRoomId(id);
        for (Reservation res : reservations) {
            List<ResourceAllocation> allocations = resourceAllocationRepository.findByReservationId(res.getId());
            if (!allocations.isEmpty()) {
                resourceAllocationRepository.deleteAll(allocations);
            }
            paymentRepository.findByReservationId(res.getId()).ifPresent(paymentRepository::delete);
            reservationRepository.delete(res);
        }

        venueRoomRepository.delete(venueRoom);
    }

    // Core validation: check if a date range overlaps with existing reservations (UC-02 extension 7a)
    public boolean checkAvailability(Long venueRoomId, LocalDate startDate, LocalDate endDate) {
        VenueRoom room = getVenueRoomById(venueRoomId);
        if (!room.isAvailable()) {
            return false;
        }

        List<Reservation> overlaps = reservationRepository.findOverlappingReservations(venueRoomId, startDate, endDate);
        return overlaps.isEmpty();
    }

    @Transactional
    public VenueRoom updateAvailabilityStatus(Long id, boolean available, LocalDate startDate, LocalDate endDate) {
        VenueRoom room = getVenueRoomById(id);
        
        if (!available && startDate != null && endDate != null) {
            List<Reservation> overlaps = reservationRepository.findOverlappingReservations(id, startDate, endDate);
            if (!overlaps.isEmpty()) {
                throw new DoubleBookingException("Target date " + startDate + " to " + endDate + " already has active reservations. Cannot update availability status.");
            }
        }

        room.setAvailable(available);
        return venueRoomRepository.save(room);
    }

    // Room Category CRUD (Samath - Component 2)
    public List<com.hotel.reservation.entity.RoomCategory> getAllCategories() {
        return roomCategoryRepository.findAll();
    }

    public com.hotel.reservation.entity.RoomCategory getCategoryById(Long id) {
        return roomCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room Category #" + id + " not found."));
    }

    @Transactional
    public com.hotel.reservation.entity.RoomCategory createCategory(com.hotel.reservation.entity.RoomCategory category) {
        if (category.getName() == null || category.getName().trim().isEmpty()) {
            throw new BadRequestException("Room Category name is required.");
        }
        if (category.getCode() == null || category.getCode().trim().isEmpty()) {
            throw new BadRequestException("Room Category code is required.");
        }
        category.setName(category.getName().trim());
        category.setCode(category.getCode().trim().toUpperCase());
        return roomCategoryRepository.save(category);
    }

    @Transactional
    public com.hotel.reservation.entity.RoomCategory updateCategory(Long id, com.hotel.reservation.entity.RoomCategory updated) {
        com.hotel.reservation.entity.RoomCategory existing = getCategoryById(id);
        if (updated.getName() != null) {
            if (updated.getName().trim().isEmpty()) {
                throw new BadRequestException("Category name cannot be blank.");
            }
            existing.setName(updated.getName().trim());
        }
        if (updated.getCode() != null) {
            if (updated.getCode().trim().isEmpty()) {
                throw new BadRequestException("Category code cannot be blank.");
            }
            existing.setCode(updated.getCode().trim().toUpperCase());
        }
        if (updated.getDescription() != null) existing.setDescription(updated.getDescription());
        if (updated.getBasePriceMultiplier() != null) existing.setBasePriceMultiplier(updated.getBasePriceMultiplier());
        if (updated.getActive() != null) existing.setActive(updated.getActive());
        return roomCategoryRepository.save(existing);
    }

    @Transactional
    public void deleteCategory(Long id) {
        com.hotel.reservation.entity.RoomCategory category = getCategoryById(id);
        roomCategoryRepository.delete(category);
    }

    // Facility CRUD (Samath - Component 2)
    public List<com.hotel.reservation.entity.Facility> getAllFacilities() {
        return facilityRepository.findAll();
    }

    public com.hotel.reservation.entity.Facility getFacilityById(Long id) {
        return facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility #" + id + " not found."));
    }

    @Transactional
    public com.hotel.reservation.entity.Facility createFacility(com.hotel.reservation.entity.Facility facility) {
        if (facility.getName() == null || facility.getName().trim().isEmpty()) {
            throw new BadRequestException("Facility name is required.");
        }
        facility.setName(facility.getName().trim());
        return facilityRepository.save(facility);
    }

    @Transactional
    public com.hotel.reservation.entity.Facility updateFacility(Long id, com.hotel.reservation.entity.Facility updated) {
        com.hotel.reservation.entity.Facility existing = getFacilityById(id);
        if (updated.getName() != null) existing.setName(updated.getName());
        if (updated.getDescription() != null) existing.setDescription(updated.getDescription());
        if (updated.getFacilityType() != null) existing.setFacilityType(updated.getFacilityType());
        if (updated.getIconName() != null) existing.setIconName(updated.getIconName());
        if (updated.getActive() != null) existing.setActive(updated.getActive());
        return facilityRepository.save(existing);
    }

    @Transactional
    public void deleteFacility(Long id) {
        com.hotel.reservation.entity.Facility facility = getFacilityById(id);
        facilityRepository.delete(facility);
    }
}
