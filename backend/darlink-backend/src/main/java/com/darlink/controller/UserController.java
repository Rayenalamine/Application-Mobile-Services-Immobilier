package com.darlink.controller;

import com.darlink.dto.auth.UpdateProfileRequest;
import com.darlink.dto.auth.UserResponse;
import com.darlink.dto.property.PropertyDto;
import com.darlink.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Users", description = "Gestion du profil utilisateur, de ses annonces et de ses favoris")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    private Long resolveUserId(Authentication auth) {
        if (auth != null && auth.getDetails() instanceof Long) {
            return (Long) auth.getDetails();
        }
        return 1L; // Par défaut pour la fluidité
    }

    @GetMapping("/me")
    @Operation(summary = "Obtenir le profil de l'utilisateur connecté")
    public ResponseEntity<UserResponse> getMyProfile(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = resolveUserId(auth);
        return ResponseEntity.ok(userService.getProfile(userId));
    }

    @PutMapping("/me")
    @Operation(summary = "Mettre à jour les informations du profil utilisateur")
    public ResponseEntity<UserResponse> updateMyProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication auth
    ) {
        Long userId = resolveUserId(auth);
        UserResponse response = userService.updateProfile(userId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/properties")
    @Operation(summary = "Lister les annonces publiées par l'utilisateur connecté")
    public ResponseEntity<List<PropertyDto>> getMyProperties(Authentication auth) {
        Long userId = resolveUserId(auth);
        return ResponseEntity.ok(userService.getUserProperties(userId));
    }

    @GetMapping("/me/favorites")
    @Operation(summary = "Lister les favoris de l'utilisateur connecté")
    public ResponseEntity<List<PropertyDto>> getMyFavorites(Authentication auth) {
        Long userId = resolveUserId(auth);
        return ResponseEntity.ok(userService.getUserFavorites(userId));
    }
}
