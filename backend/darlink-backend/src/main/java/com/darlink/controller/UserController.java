package com.darlink.controller;

import com.darlink.dto.auth.ChangePasswordRequest;
import com.darlink.dto.auth.UpdateProfileRequest;
import com.darlink.dto.auth.UserResponse;
import com.darlink.dto.property.PropertyDto;
import com.darlink.exception.ForbiddenException;
import com.darlink.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Users", description = "Gestion du profil utilisateur, de ses annonces, favoris et mot de passe (V4)")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    private Long resolveUserId(Authentication auth) {
        if (auth != null && auth.getDetails() instanceof Long) {
            return (Long) auth.getDetails();
        }
        throw new ForbiddenException("Authentification requise.");
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

    @PostMapping("/me/change-password")
    @Operation(summary = "Modifier le mot de passe de l'utilisateur connecté")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication auth
    ) {
        Long userId = resolveUserId(auth);
        userService.changePassword(userId, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Mot de passe modifié avec succès."));
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
