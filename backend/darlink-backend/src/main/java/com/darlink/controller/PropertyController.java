package com.darlink.controller;

import com.darlink.dto.property.CreatePropertyRequest;
import com.darlink.dto.property.PageResponse;
import com.darlink.dto.property.PropertyDto;
import com.darlink.dto.property.UpdatePropertyRequest;
import com.darlink.entity.PropertyImageEntity;
import com.darlink.service.FileStorageService;
import com.darlink.service.PropertyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/properties")
@Tag(name = "Properties", description = "Endpoints de gestion, recherche et découverte des biens immobiliers")
public class PropertyController {

    private final PropertyService propertyService;
    private final FileStorageService fileStorageService;

    public PropertyController(PropertyService propertyService, FileStorageService fileStorageService) {
        this.propertyService = propertyService;
        this.fileStorageService = fileStorageService;
    }

    private Long resolveUserId(Authentication auth) {
        if (auth != null && auth.getDetails() instanceof Long) {
            return (Long) auth.getDetails();
        }
        return 1L; // Utilisateur par défaut
    }

    @GetMapping
    @Operation(summary = "Rechercher des biens avec filtres dynamiques, pagination et tri")
    public ResponseEntity<PageResponse<PropertyDto>> getProperties(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Boolean isRental,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer minBedrooms,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sort
    ) {
        PageResponse<PropertyDto> response = propertyService.getProperties(
                page, size, city, type, isRental, minPrice, maxPrice, minBedrooms, search, sort
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consulter le détail d'un bien par son ID")
    public ResponseEntity<PropertyDto> getPropertyById(@PathVariable Long id) {
        PropertyDto dto = propertyService.getPropertyById(id);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/map")
    @Operation(summary = "Obtenir les biens géolocalisés pour la carte interactive")
    public ResponseEntity<List<PropertyDto>> getMapProperties() {
        List<PropertyDto> mapList = propertyService.getMapProperties();
        return ResponseEntity.ok(mapList);
    }

    @PostMapping
    @Operation(summary = "Publier une nouvelle annonce immobilière")
    public ResponseEntity<PropertyDto> createProperty(
            @Valid @RequestBody CreatePropertyRequest request,
            Authentication auth
    ) {
        Long userId = resolveUserId(auth);
        PropertyDto created = propertyService.createProperty(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier une annonce immobilière existante (réservé au propriétaire)")
    public ResponseEntity<PropertyDto> updateProperty(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePropertyRequest request,
            Authentication auth
    ) {
        Long userId = resolveUserId(auth);
        PropertyDto updated = propertyService.updateProperty(id, request, userId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une annonce immobilière (réservé au propriétaire)")
    public ResponseEntity<Map<String, Object>> deleteProperty(
            @PathVariable Long id,
            Authentication auth
    ) {
        Long userId = resolveUserId(auth);
        propertyService.deleteProperty(id, userId);
        return ResponseEntity.ok(Map.of("message", "Bien immobilier supprimé avec succès.", "propertyId", id));
    }

    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Téléverser une image pour une annonce")
    public ResponseEntity<PropertyImageEntity> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "isPrimary", defaultValue = "false") Boolean isPrimary,
            Authentication auth
    ) {
        Long userId = resolveUserId(auth);
        String fileUrl = fileStorageService.storeFile(file);
        PropertyImageEntity img = propertyService.addImage(id, fileUrl, isPrimary, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(img);
    }

    @DeleteMapping("/{id}/images/{imageId}")
    @Operation(summary = "Supprimer une image d'une annonce")
    public ResponseEntity<Map<String, Object>> deleteImage(
            @PathVariable Long id,
            @PathVariable Long imageId,
            Authentication auth
    ) {
        Long userId = resolveUserId(auth);
        propertyService.deleteImage(id, imageId, userId);
        return ResponseEntity.ok(Map.of("message", "Image supprimée avec succès."));
    }

    @GetMapping("/{id}/images")
    @Operation(summary = "Lister les images additionnelles d'un bien")
    public ResponseEntity<List<PropertyImageEntity>> getPropertyImages(@PathVariable Long id) {
        return ResponseEntity.ok(propertyService.getPropertyImages(id));
    }
}
