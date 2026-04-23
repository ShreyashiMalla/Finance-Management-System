package com.finance.app.security;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Date;
@Component
public class JwtUtil {
    @Value("${app.jwt.secret}") private String secret;
    @Value("${app.jwt.expiration-ms}") private long expirationMs;
    private SecretKey key() { return Keys.hmacShaKeyFor(java.util.Base64.getDecoder().decode(secret)); }
    public String generate(String email) {
        return Jwts.builder().subject(email).issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis()+expirationMs))
            .signWith(key()).compact();
    }
    public String extractEmail(String token) {
        return Jwts.parser().verifyWith(key()).build().parseSignedClaims(token).getPayload().getSubject();
    }
}
