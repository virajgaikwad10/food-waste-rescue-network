package org.foodrescue.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Service;

@Service
public class JwtAuthService {
    private final JwtProperties jwtProperties;

    public JwtAuthService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    public Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(jwtProperties.getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
