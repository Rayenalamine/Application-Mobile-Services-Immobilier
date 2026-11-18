package com.darlink.service;

import com.darlink.dto.auth.AuthResponse;
import com.darlink.dto.auth.LoginRequest;
import com.darlink.dto.auth.RegisterRequest;
import com.darlink.dto.auth.UserResponse;
import com.darlink.entity.UserEntity;
import com.darlink.repository.UserRepository;
import com.darlink.security.JwtUtil;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail().toLowerCase().trim())) {
            throw new IllegalArgumentException("Un compte existe déjà avec cette adresse email.");
        }

        String hash = passwordEncoder.encode(req.getPassword());
        UserEntity user = new UserEntity(
                req.getFullName().trim(),
                req.getEmail().toLowerCase().trim(),
                hash,
                req.getPhone(),
                "CLIENT"
        );
        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole());
        UserResponse userResponse = new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole()
        );
        return new AuthResponse(token, userResponse);
    }

    public AuthResponse login(LoginRequest req) {
        UserEntity user = userRepository.findByEmail(req.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new BadCredentialsException("Email ou mot de passe incorrect."));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Email ou mot de passe incorrect.");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole());
        UserResponse userResponse = new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole()
        );
        return new AuthResponse(token, userResponse);
    }

    public UserResponse getProfile(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Utilisateur non trouvé."));
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getPhone(), user.getRole());
    }
}

