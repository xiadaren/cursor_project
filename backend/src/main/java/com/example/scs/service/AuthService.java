package com.example.scs.service;

import com.example.scs.auth.JwtService;
import com.example.scs.domain.RefreshToken;
import com.example.scs.domain.Role;
import com.example.scs.domain.User;
import com.example.scs.repository.RefreshTokenRepository;
import com.example.scs.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public record AuthUserDto(long id, String role, String email, String name) {}
    public record LoginResult(String accessToken, String refreshToken, AuthUserDto user) {}

    @Transactional
    public LoginResult login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("账号或密码错误"));
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("账号或密码错误");
        }
        return issueTokens(user);
    }

    @Transactional
    public void registerStudent(String name, String email, String password, String studentId) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("邮箱已被注册");
        }
        User u = new User();
        u.setRole(Role.STUDENT);
        u.setName(name);
        u.setEmail(email);
        u.setStudentId(studentId);
        u.setPasswordHash(passwordEncoder.encode(password));
        userRepository.save(u);
    }

    @Transactional
    public LoginResult refresh(String refreshToken) {
        RefreshToken rt = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new IllegalArgumentException("刷新令牌无效"));
        if (rt.isRevoked() || rt.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("刷新令牌已过期");
        }
        rt.setRevoked(true); // rotate token
        refreshTokenRepository.save(rt);
        return issueTokens(rt.getUser());
    }

    private LoginResult issueTokens(User user) {
        String subject = String.valueOf(user.getId());
        Map<String, Object> claims = Map.of(
                "role", user.getRole().name(),
                "email", user.getEmail(),
                "name", user.getName()
        );
        String accessToken = jwtService.createAccessToken(subject, claims);

        String refresh = UUID.randomUUID().toString().replace("-", "");
        RefreshToken rt = new RefreshToken();
        rt.setUser(user);
        rt.setToken(refresh);
        rt.setExpiresAt(LocalDateTime.now().plusDays(14));
        rt.setRevoked(false);
        refreshTokenRepository.save(rt);

        AuthUserDto dto = new AuthUserDto(user.getId(), user.getRole().name(), user.getEmail(), user.getName());
        return new LoginResult(accessToken, refresh, dto);
    }
}

