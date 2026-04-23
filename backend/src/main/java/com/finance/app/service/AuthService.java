package com.finance.app.service;
import com.finance.app.dto.AuthDtos.*;
import com.finance.app.entity.User;
import com.finance.app.repository.UserRepository;
import com.finance.app.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
@Service
public class AuthService {
    private final UserRepository repo; private final PasswordEncoder enc; private final JwtUtil jwt;
    public AuthService(UserRepository r, PasswordEncoder e, JwtUtil j){repo=r;enc=e;jwt=j;}
    public AuthResponse register(RegisterRequest req){
        if(repo.existsByEmail(req.email())) throw new RuntimeException("Email already registered");
        User u = User.builder().email(req.email()).name(req.name()).password(enc.encode(req.password())).build();
        repo.save(u);
        return new AuthResponse(jwt.generate(u.getEmail()), u.getName(), u.getEmail());
    }
    public AuthResponse login(LoginRequest req){
        User u = repo.findByEmail(req.email()).orElseThrow(() -> new RuntimeException("Invalid credentials"));
        if(!enc.matches(req.password(), u.getPassword())) throw new RuntimeException("Invalid credentials");
        return new AuthResponse(jwt.generate(u.getEmail()), u.getName(), u.getEmail());
    }
}
