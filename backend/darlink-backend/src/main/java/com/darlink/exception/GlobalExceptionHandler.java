package com.darlink.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ProblemDetailResponse> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        ProblemDetailResponse problem = new ProblemDetailResponse(
                "https://api.darlink.tn/errors/not-found",
                "Ressource introuvable",
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .header("Content-Type", "application/problem+json")
                .body(problem);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetailResponse> handleValidationErrors(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String detail = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));

        ProblemDetailResponse problem = new ProblemDetailResponse(
                "https://api.darlink.tn/errors/validation",
                "Erreur de validation",
                HttpStatus.BAD_REQUEST.value(),
                detail,
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .header("Content-Type", "application/problem+json")
                .body(problem);
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ProblemDetailResponse> handleForbidden(ForbiddenException ex, HttpServletRequest request) {
        ProblemDetailResponse problem = new ProblemDetailResponse(
                "https://api.darlink.tn/errors/forbidden",
                "Accès refusé",
                HttpStatus.FORBIDDEN.value(),
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .header("Content-Type", "application/problem+json")
                .body(problem);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ProblemDetailResponse> handleBadCredentials(BadCredentialsException ex, HttpServletRequest request) {
        ProblemDetailResponse problem = new ProblemDetailResponse(
                "https://api.darlink.tn/errors/unauthorized",
                "Identifiants invalides",
                HttpStatus.UNAUTHORIZED.value(),
                "Email ou mot de passe incorrect.",
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .header("Content-Type", "application/problem+json")
                .body(problem);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ProblemDetailResponse> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest request) {
        ProblemDetailResponse problem = new ProblemDetailResponse(
                "https://api.darlink.tn/errors/bad-request",
                "Requête invalide",
                HttpStatus.BAD_REQUEST.value(),
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .header("Content-Type", "application/problem+json")
                .body(problem);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetailResponse> handleGeneral(Exception ex, HttpServletRequest request) {
        ProblemDetailResponse problem = new ProblemDetailResponse(
                "https://api.darlink.tn/errors/internal",
                "Erreur interne du serveur",
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                ex.getMessage() != null ? ex.getMessage() : "Une erreur inattendue est survenue.",
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .header("Content-Type", "application/problem+json")
                .body(problem);
    }
}

