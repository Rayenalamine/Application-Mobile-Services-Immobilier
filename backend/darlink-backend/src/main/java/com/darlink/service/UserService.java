package com.darlink.service;

import com.darlink.dto.auth.UpdateProfileRequest;
import com.darlink.dto.auth.UserResponse;
import com.darlink.dto.property.PropertyDto;
import com.darlink.entity.UserEntity;
import com.darlink.exception.ForbiddenException;
import com.darlink.exception.ResourceNotFoundException;
import com.darlink.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PropertyService propertyService;
    private final FavoriteService favoriteService;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PropertyService propertyService,
            FavoriteService favoriteService,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.propertyService = propertyService;
        this.favoriteService = favoriteService;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse getProfile(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'identifiant " + userId + "."));
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getPhone(), user.getRole());
    }

    public UserResponse getProfileByEmail(String email) {
        UserEntity user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'email " + email + "."));
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getPhone(), user.getRole());
    }

    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest req) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'identifiant " + userId + "."));

        user.setFullName(req.getFullName().trim());
        if (req.getPhone() != null) {
            user.setPhone(req.getPhone().trim());
        }

        user = userRepository.save(user);
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getPhone(), user.getRole());
    }

    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé."));

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new ForbiddenException("Le mot de passe actuel est incorrect.");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public List<PropertyDto> getUserProperties(Long userId) {
        return propertyService.getUserProperties(userId);
    }

    public List<PropertyDto> getUserFavorites(Long userId) {
        return favoriteService.getUserFavorites(userId);
    }
}
