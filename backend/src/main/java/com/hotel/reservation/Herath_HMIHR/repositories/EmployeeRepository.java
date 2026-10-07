package com.hotel.reservation.repository;

import com.hotel.reservation.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByUserId(Long userId);
    Optional<Employee> findByUserUsername(String username);
    List<Employee> findByDepartment(String department);
    Optional<Employee> findByEmployeeCode(String employeeCode);
}
