package com.hotel.reservation.service;

import com.hotel.reservation.dto.AuthRequest;
import com.hotel.reservation.dto.AuthResponse;
import com.hotel.reservation.dto.RegisterRequest;
import com.hotel.reservation.entity.Customer;
import com.hotel.reservation.entity.Employee;
import com.hotel.reservation.entity.RoleName;
import com.hotel.reservation.entity.User;
import com.hotel.reservation.exception.BadRequestException;
import com.hotel.reservation.repository.CustomerRepository;
import com.hotel.reservation.repository.EmployeeRepository;
import com.hotel.reservation.repository.UserRepository;
import com.hotel.reservation.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    public AuthResponse login(AuthRequest request) {
        String identifier = request.getUsername() != null ? request.getUsername().trim() : "";

        User user = userRepository.findByUsername(identifier)
                .orElseGet(() -> {
                    java.util.List<User> matches = userRepository.findByIdentifier(identifier);
                    if (matches.isEmpty()) {
                        throw new BadRequestException("Invalid username or password");
                    }
                    return matches.stream()
                            .filter(u -> u.getEmail().equalsIgnoreCase(identifier))
                            .findFirst()
                            .orElse(matches.get(0));
                });

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return new AuthResponse(jwt, user.getId(), user.getUsername(), user.getEmail(), user.getFullName(), user.getPhone(), user.getRole());
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken. Please choose a different username.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered. Please login or use a different email.");
        }

        RoleName assignedRole = request.getRole() != null ? request.getRole() : RoleName.ROLE_CUSTOMER;

        User user = new User(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName(),
                request.getPhone(),
                assignedRole
        );

        User savedUser = userRepository.save(user);

        if (assignedRole == RoleName.ROLE_CUSTOMER) {
            String emergencyContact = request.getEmergencyContact() != null ? request.getEmergencyContact().trim() : "";
            String specialPreferences = request.getSpecialPreferences() != null ? request.getSpecialPreferences().trim() : "";
            Customer customer = new Customer(savedUser, request.getAddress(), request.getPassportOrNic(), emergencyContact, specialPreferences);
            customerRepository.save(customer);
        } else {
            Employee employee = new Employee(
                    savedUser,
                    "EMP-" + System.currentTimeMillis() % 10000,
                    savedUser.getFullName(),
                    "Operations",
                    assignedRole.name().replace("ROLE_", ""),
                    new BigDecimal("45000.00"),
                    savedUser.getPhone(),
                    LocalDate.now()
            );
            employeeRepository.save(employee);
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return new AuthResponse(jwt, savedUser.getId(), savedUser.getUsername(), savedUser.getEmail(), savedUser.getFullName(), savedUser.getPhone(), savedUser.getRole());
    }
}
