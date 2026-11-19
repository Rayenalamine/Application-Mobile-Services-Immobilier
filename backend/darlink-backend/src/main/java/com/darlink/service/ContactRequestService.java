package com.darlink.service;

import com.darlink.dto.contact.ContactRequestDto;
import com.darlink.dto.contact.CreateContactRequest;
import com.darlink.entity.ContactRequestEntity;
import com.darlink.entity.PropertyEntity;
import com.darlink.exception.ForbiddenException;
import com.darlink.exception.ResourceNotFoundException;
import com.darlink.repository.ContactRequestRepository;
import com.darlink.repository.PropertyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContactRequestService {

    private final ContactRequestRepository contactRequestRepository;
    private final PropertyRepository propertyRepository;

    public ContactRequestService(ContactRequestRepository contactRequestRepository, PropertyRepository propertyRepository) {
        this.contactRequestRepository = contactRequestRepository;
        this.propertyRepository = propertyRepository;
    }

    @Transactional
    public ContactRequestDto createContactRequest(CreateContactRequest req, Long senderId) {
        // Vérifier que le bien existe
        PropertyEntity property = propertyRepository.findById(req.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Le bien immobilier #" + req.getPropertyId() + " n'existe pas."));

        ContactRequestEntity entity = new ContactRequestEntity();
        entity.setPropertyId(property.getId());
        entity.setSenderId(senderId);
        entity.setSenderName(req.getSenderName().trim());
        entity.setSenderEmail(req.getSenderEmail().trim());
        entity.setSenderPhone(req.getSenderPhone() != null ? req.getSenderPhone().trim() : null);
        entity.setMessage(req.getMessage().trim());
        entity.setStatus("PENDING");

        entity = contactRequestRepository.save(entity);
        return ContactRequestDto.fromEntity(entity);
    }

    public List<ContactRequestDto> getReceivedContactRequests(Long ownerUserId) {
        return contactRequestRepository.findReceivedRequestsByOwnerId(ownerUserId).stream()
                .map(ContactRequestDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ContactRequestDto> getSentContactRequests(Long senderUserId) {
        return contactRequestRepository.findBySenderIdOrderByCreatedAtDesc(senderUserId).stream()
                .map(ContactRequestDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ContactRequestDto updateStatus(Long requestId, String status, Long ownerUserId) {
        ContactRequestEntity req = contactRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Demande de contact #" + requestId + " introuvable."));

        PropertyEntity property = propertyRepository.findById(req.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Bien immobilier associé introuvable."));

        // Seul le propriétaire du bien peut modifier le statut de la demande
        if (property.getOwnerId() != null && ownerUserId != null && !property.getOwnerId().equals(ownerUserId)) {
            throw new ForbiddenException("Vous n'êtes pas autorisé à modifier le statut de cette demande de contact.");
        }

        req.setStatus(status.toUpperCase().trim());
        req = contactRequestRepository.save(req);
        return ContactRequestDto.fromEntity(req);
    }
}
