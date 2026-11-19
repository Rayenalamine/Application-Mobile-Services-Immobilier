package com.darlink.dto.contact;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateContactRequest {

    @NotNull(message = "L'identifiant du bien est obligatoire.")
    private Long propertyId;

    @NotBlank(message = "Votre nom est obligatoire.")
    private String senderName;

    @NotBlank(message = "Votre adresse e-mail est obligatoire.")
    @Email(message = "Format d'e-mail invalide.")
    private String senderEmail;

    private String senderPhone;

    @NotBlank(message = "Le message est obligatoire.")
    private String message;

    public CreateContactRequest() {}

    public Long getPropertyId() { return propertyId; }
    public void setPropertyId(Long propertyId) { this.propertyId = propertyId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getSenderEmail() { return senderEmail; }
    public void setSenderEmail(String senderEmail) { this.senderEmail = senderEmail; }

    public String getSenderPhone() { return senderPhone; }
    public void setSenderPhone(String senderPhone) { this.senderPhone = senderPhone; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
