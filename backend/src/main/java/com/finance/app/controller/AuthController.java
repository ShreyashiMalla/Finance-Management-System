package com.finance.app.controller;
import com.finance.app.dto.AuthDtos.*;
import com.finance.app.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/auth")
public class AuthController {
    private final AuthService svc;
    public AuthController(AuthService s){svc=s;}
    @PostMapping("/register") public AuthResponse register(@Valid @RequestBody RegisterRequest r){return svc.register(r);}
    @PostMapping("/login") public AuthResponse login(@Valid @RequestBody LoginRequest r){return svc.login(r);}
}
