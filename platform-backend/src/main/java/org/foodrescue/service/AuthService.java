package org.foodrescue.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.foodrescue.domain.User;
import org.foodrescue.dto.AuthenticationResponse;
import org.foodrescue.dto.AuthRequest;
import org.foodrescue.dto.RegisterRequest;
import org.foodrescue.dto.UserDto;
import org.foodrescue.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;
import java.util.Optional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProperties jwtProperties;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtProperties jwtProperties) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtProperties = jwtProperties;
    }

    public AuthenticationResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() == null ? "donor" : request.getRole());
        userRepository.save(user);
        return new AuthenticationResponse(createToken(user), map(user));
    }

    public AuthenticationResponse authenticate(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        return new AuthenticationResponse(createToken(user), map(user));
    }

    private String createToken(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("role", user.getRole())
                .claim("id", user.getId())
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusSeconds(jwtProperties.getExpirationSeconds())))
                .signWith(jwtProperties.getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private UserDto map(User user) {
        return new UserDto(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
