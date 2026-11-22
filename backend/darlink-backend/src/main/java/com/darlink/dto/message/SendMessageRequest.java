package com.darlink.dto.message;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SendMessageRequest {

    @NotNull(message = "L'identifiant du destinataire est requis.")
    private Long receiverId;

    private Long propertyId;

    @NotBlank(message = "Le message ne peut pas être vide.")
    private String content;

    public SendMessageRequest() {}

    public SendMessageRequest(Long receiverId, Long propertyId, String content) {
        this.receiverId = receiverId;
        this.propertyId = propertyId;
        this.content = content;
    }

    public Long getReceiverId() { return receiverId; }
    public void setReceiverId(Long receiverId) { this.receiverId = receiverId; }

    public Long getPropertyId() { return propertyId; }
    public void setPropertyId(Long propertyId) { this.propertyId = propertyId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
