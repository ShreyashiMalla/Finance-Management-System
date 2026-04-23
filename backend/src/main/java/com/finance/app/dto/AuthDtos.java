package com.finance.app.dto;
import jakarta.validation.constraints.*;
public class AuthDtos {
    public record RegisterRequest(@NotBlank String name, @Email String email, @Size(min=6) String password) {}
    public record LoginRequest(@Email String email, @NotBlank String password) {}
    public record AuthResponse(String token, String name, String email) {}
}
