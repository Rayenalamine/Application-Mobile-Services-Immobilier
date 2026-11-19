package com.darlink.controller;

import com.darlink.dto.property.PropertyDto;
import com.darlink.service.FavoriteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/favorites")
@Tag(name = "Favorites", description = "Gestion de la persistance des annonces favorites (V6)")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    private Long resolveUserId(Authentication auth, Long requestedUserId) {
        if (auth != null && auth.getDetails() instanceof Long) {
            return (Long) auth.getDetails();
        }
        if (requestedUserId != null) {
            return requestedUserId;
        }
        return 1L; // Utilisateur par défaut pour la démo
    }

    @GetMapping
    @Operation(summary = "Obtenir la liste des biens favoris de l'utilisateur")
    public ResponseEntity<List<PropertyDto>> getFavorites(
            Authentication auth,
            @RequestParam(required = false) Long userId
    ) {
        Long targetUserId = resolveUserId(auth, userId);
        List<PropertyDto> favorites = favoriteService.getUserFavorites(targetUserId);
        return ResponseEntity.ok(favorites);
    }

    @GetMapping("/ids")
    @Operation(summary = "Obtenir les identifiants de tous les biens favoris")
    public ResponseEntity<List<Long>> getFavoriteIds(
            Authentication auth,
            @RequestParam(required = false) Long userId
    ) {
        Long targetUserId = resolveUserId(auth, userId);
        List<Long> ids = favoriteService.getUserFavoriteIds(targetUserId);
        return ResponseEntity.ok(ids);
    }

    @PostMapping("/{propertyId}")
    @Operation(summary = "Ajouter un bien aux favoris")
    public ResponseEntity<Map<String, Object>> addFavorite(
            @PathVariable Long propertyId,
            Authentication auth,
            @RequestParam(required = false) Long userId
    ) {
        Long targetUserId = resolveUserId(auth, userId);
        favoriteService.addFavorite(targetUserId, propertyId);
        return ResponseEntity.ok(Map.of("message", "Bien ajouté aux favoris", "propertyId", propertyId));
    }

    @DeleteMapping("/{propertyId}")
    @Operation(summary = "Retirer un bien des favoris")
    public ResponseEntity<Map<String, Object>> removeFavorite(
            @PathVariable Long propertyId,
            Authentication auth,
            @RequestParam(required = false) Long userId
    ) {
        Long targetUserId = resolveUserId(auth, userId);
        favoriteService.removeFavorite(targetUserId, propertyId);
        return ResponseEntity.ok(Map.of("message", "Bien retiré des favoris", "propertyId", propertyId));
    }
}

