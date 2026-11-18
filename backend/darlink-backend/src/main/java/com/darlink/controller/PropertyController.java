package com.darlink.controller;

import com.darlink.dto.property.CreatePropertyRequest;
import com.darlink.dto.property.PageResponse;
import com.darlink.dto.property.PropertyDto;
import com.darlink.service.PropertyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/properties")
@Tag(name = "Properties", description = "Endpoints de gestion, recherche et découverte des biens immobiliers (V5, V7, V8)")
public class PropertyController {

    private final PropertyService propertyService;

    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    @GetMapping
    @Operation(summary = "Rechercher des biens immobiliers avec pagination et filtres dynamiques (V5)")
    public ResponseEntity<PageResponse<PropertyDto>> getProperties(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String search
    ) {
        PageResponse<PropertyDto> response = propertyService.getProperties(
                page, size, city, type, minPrice, maxPrice, search
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consulter le détail complet d'un bien immobilier par son ID (V5)")
    public ResponseEntity<PropertyDto> getPropertyById(@PathVariable Long id) {
        PropertyDto dto = propertyService.getPropertyById(id);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/map")
    @Operation(summary = "Obtenir tous les biens immobiliers géolocalisés pour la carte interactive (V8)")
    public ResponseEntity<List<PropertyDto>> getMapProperties() {
        List<PropertyDto> mapList = propertyService.getMapProperties();
        return ResponseEntity.ok(mapList);
    }

    @PostMapping
    @Operation(summary = "Déposer une nouvelle annonce immobilière (V7)")
    public ResponseEntity<PropertyDto> createProperty(@Valid @RequestBody CreatePropertyRequest request) {
        PropertyDto created = propertyService.createProperty(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}

