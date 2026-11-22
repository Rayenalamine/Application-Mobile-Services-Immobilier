package com.darlink.controller;

import com.darlink.dto.auth.UserResponse;
import com.darlink.entity.UserEntity;
import com.darlink.exception.ForbiddenException;
import com.darlink.exception.ResourceNotFoundException;
import com.darlink.repository.ContactRequestRepository;
import com.darlink.repository.FavoriteRepository;
import com.darlink.repository.PropertyRepository;
import com.darlink.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
@Tag(name = "Admin", description = "Administration, modération et métriques de la plateforme (V11)")
public class AdminController {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final ContactRequestRepository contactRequestRepository;
    private final FavoriteRepository favoriteRepository;

    public AdminController(
            UserRepository userRepository,
            PropertyRepository propertyRepository,
            ContactRequestRepository contactRequestRepository,
            FavoriteRepository favoriteRepository
    ) {
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.contactRequestRepository = contactRequestRepository;
        this.favoriteRepository = favoriteRepository;
    }

    private void checkAdmin(Authentication auth) {
        if (auth == null) {
            throw new ForbiddenException("Authentification requise.");
        }
        String email = auth.getName();
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ForbiddenException("Utilisateur non trouvé."));
        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new ForbiddenException("Accès réservé exclusivement aux administrateurs DarLink.");
        }
    }

    @GetMapping("/stats")
    @Operation(summary = "Statistiques globales du parc immobilier et des utilisateurs")
    public ResponseEntity<Map<String, Object>> getStats(Authentication auth) {
        checkAdmin(auth);
        return ResponseEntity.ok(Map.of(
                "totalProperties", propertyRepository.count(),
                "totalUsers", userRepository.count(),
                "totalContactRequests", contactRequestRepository.count(),
                "totalFavorites", favoriteRepository.count()
        ));
    }

    @GetMapping("/users")
    @Operation(summary = "Lister l'ensemble des utilisateurs enregistrés")
    public ResponseEntity<List<UserResponse>> getAllUsers(Authentication auth) {
        checkAdmin(auth);
        List<UserResponse> list = userRepository.findAll().stream()
                .map(u -> new UserResponse(u.getId(), u.getFullName(), u.getEmail(), u.getPhone(), u.getRole()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PatchMapping("/users/{id}/role")
    @Operation(summary = "Modifier le rôle d'un utilisateur (CLIENT, AGENT, ADMIN)")
    public ResponseEntity<UserResponse> changeUserRole(
            @PathVariable Long id,
            @RequestParam String role,
            Authentication auth
    ) {
        checkAdmin(auth);
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable."));
        user.setRole(role.toUpperCase().trim());
        user = userRepository.save(user);
        return ResponseEntity.ok(new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getPhone(), user.getRole()));
    }
}
