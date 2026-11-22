package com.darlink.controller;

import com.darlink.dto.contact.ContactRequestDto;
import com.darlink.dto.contact.CreateContactRequest;
import com.darlink.dto.contact.UpdateContactRequestStatus;
import com.darlink.exception.ForbiddenException;
import com.darlink.service.ContactRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/contact-requests")
@Tag(name = "Contact Requests", description = "Gestion des demandes de contact entre acheteurs et propriétaires")
public class ContactRequestController {

    private final ContactRequestService contactRequestService;

    public ContactRequestController(ContactRequestService contactRequestService) {
        this.contactRequestService = contactRequestService;
    }

    private Long resolveUserId(Authentication auth) {
        if (auth != null && auth.getDetails() instanceof Long) {
            return (Long) auth.getDetails();
        }
        return null;
    }

    @PostMapping
    @Operation(summary = "Envoyer une demande de contact pour un bien immobilier")
    public ResponseEntity<ContactRequestDto> createContactRequest(
            @Valid @RequestBody CreateContactRequest request,
            Authentication auth
    ) {
        Long senderId = resolveUserId(auth);
        ContactRequestDto created = contactRequestService.createContactRequest(request, senderId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/received")
    @Operation(summary = "Lister les demandes de contact reçues pour les biens du propriétaire connecté")
    public ResponseEntity<List<ContactRequestDto>> getReceivedRequests(Authentication auth) {
        Long ownerId = resolveUserId(auth);
        if (ownerId == null) {
            throw new ForbiddenException("Authentification requise pour consulter les demandes reçues.");
        }
        List<ContactRequestDto> list = contactRequestService.getReceivedContactRequests(ownerId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/sent")
    @Operation(summary = "Lister les demandes de contact envoyées par l'utilisateur connecté")
    public ResponseEntity<List<ContactRequestDto>> getSentRequests(Authentication auth) {
        Long senderId = resolveUserId(auth);
        if (senderId == null) {
            throw new ForbiddenException("Authentification requise pour consulter les demandes envoyées.");
        }
        List<ContactRequestDto> list = contactRequestService.getSentContactRequests(senderId);
        return ResponseEntity.ok(list);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Mettre à jour le statut d'une demande de contact reçue")
    public ResponseEntity<ContactRequestDto> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateContactRequestStatus request,
            Authentication auth
    ) {
        Long ownerId = resolveUserId(auth);
        if (ownerId == null) {
            throw new ForbiddenException("Authentification requise pour modifier le statut.");
        }
        ContactRequestDto updated = contactRequestService.updateStatus(id, request.getStatus(), ownerId);
        return ResponseEntity.ok(updated);
    }
}

