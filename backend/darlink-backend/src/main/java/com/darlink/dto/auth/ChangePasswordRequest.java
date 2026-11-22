package com.darlink.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ChangePasswordRequest {

    @NotBlank(message = "Le mot de passe actuel est requis.")
    private String currentPassword;

    @NotBlank(message = "Le nouveau mot de passe est requis.")
    @Size(min = 6, message = "Le nouveau mot de passe doit comporter au moins 6 caractères.")
    private String newPassword;

    public ChangePasswordRequest() {}

    public ChangePasswordRequest(String currentPassword, String newPassword) {
        this.currentPassword = currentPassword;
        this.newPassword = newPassword;
    }

    public String getCurrentPassword() { return currentPassword; }
    public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }

    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}
