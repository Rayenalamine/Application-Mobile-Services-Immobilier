package com.darlink.dto.contact;

import jakarta.validation.constraints.NotBlank;

public class UpdateContactRequestStatus {

    @NotBlank(message = "Le statut est obligatoire (PENDING, ACCEPTED, REJECTED).")
    private String status;

    public UpdateContactRequestStatus() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}

