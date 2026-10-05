package com.hotel.reservation.security;

import com.hotel.reservation.entity.User;
import com.hotel.reservation.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        if (identifier == null || identifier.trim().isEmpty()) {
            throw new UsernameNotFoundException("Username or email cannot be empty");
        }
        String cleanId = identifier.trim();

        User user = userRepository.findByUsername(cleanId)
                .orElseGet(() -> {
                    List<User> matches = userRepository.findByIdentifier(cleanId);
                    if (matches.isEmpty()) {
                        return null;
                    }
                    return matches.stream()
                            .filter(u -> u.getEmail().equalsIgnoreCase(cleanId))
                            .findFirst()
                            .orElse(matches.get(0));
                });

        if (user == null) {
            throw new UsernameNotFoundException("User not found with username or email : " + cleanId);
        }

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                user.isActive(),
                true, true, true,
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name()))
        );
    }
}
