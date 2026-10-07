package com.hotel.reservation.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "staff_schedules")
public class StaffSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Employee employee;

    @Column(nullable = false)
    private String shiftType; // "MORNING", "EVENING", "NIGHT", "EVENT_DUTY"

    @Column(nullable = false)
    private LocalDate shiftDate;

    private String startTime;

    private String endTime;

    private String notes;

    private String status = "ASSIGNED"; // "ASSIGNED", "COMPLETED", "CANCELLED"

    public StaffSchedule() {}

    public StaffSchedule(Employee employee, String shiftType, LocalDate shiftDate, String startTime, String endTime, String notes, String status) {
        this.employee = employee;
        this.shiftType = shiftType;
        this.shiftDate = shiftDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.notes = notes;
        this.status = status != null ? status : "ASSIGNED";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

    public String getShiftType() { return shiftType; }
    public void setShiftType(String shiftType) { this.shiftType = shiftType; }

    public LocalDate getShiftDate() { return shiftDate; }
    public void setShiftDate(LocalDate shiftDate) { this.shiftDate = shiftDate; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    // Support scheduleDate as alias for shiftDate
    @com.fasterxml.jackson.annotation.JsonProperty("scheduleDate")
    public LocalDate getScheduleDate() {
        return shiftDate;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("scheduleDate")
    public void setScheduleDate(LocalDate scheduleDate) {
        if (scheduleDate != null) {
            this.shiftDate = scheduleDate;
        }
    }

    @com.fasterxml.jackson.annotation.JsonProperty("dutyStation")
    public String getDutyStation() {
        return notes;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("dutyStation")
    public void setDutyStation(String dutyStation) {
        if (dutyStation != null && !dutyStation.isBlank()) {
            if (this.notes == null || this.notes.isBlank()) {
                this.notes = dutyStation;
            } else if (!this.notes.contains(dutyStation)) {
                this.notes = dutyStation + " - " + this.notes;
            }
        }
    }

    @com.fasterxml.jackson.annotation.JsonProperty("department")
    public String getDepartment() {
        return employee != null ? employee.getDepartment() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("department")
    public void setDepartment(String department) {
        // Handled via employee department or notes
    }
}
