package com.darlink.service;

import com.darlink.dto.property.PropertyDto;
import com.darlink.entity.FavoriteEntity;
import com.darlink.entity.PropertyEntity;
import com.darlink.exception.ResourceNotFoundException;
import com.darlink.repository.FavoriteRepository;
import com.darlink.repository.PropertyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final PropertyRepository propertyRepository;

    public FavoriteService(FavoriteRepository favoriteRepository, PropertyRepository propertyRepository) {
        this.favoriteRepository = favoriteRepository;
        this.propertyRepository = propertyRepository;
    }

    public List<PropertyDto> getUserFavorites(Long userId) {
        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(fav -> PropertyDto.fromEntity(fav.getProperty()))
                .collect(Collectors.toList());
    }

    public List<Long> getUserFavoriteIds(Long userId) {
        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(fav -> fav.getProperty().getId())
                .collect(Collectors.toList());
    }

    @Transactional
    public void addFavorite(Long userId, Long propertyId) {
        if (!favoriteRepository.existsByUserIdAndPropertyId(userId, propertyId)) {
            PropertyEntity property = propertyRepository.findById(propertyId)
                    .orElseThrow(() -> new ResourceNotFoundException("Bien immobilier non trouvé avec l'id " + propertyId));
            FavoriteEntity favorite = new FavoriteEntity(userId, property);
            favoriteRepository.save(favorite);
        }
    }

    @Transactional
    public void removeFavorite(Long userId, Long propertyId) {
        favoriteRepository.deleteByUserIdAndPropertyId(userId, propertyId);
    }
}

