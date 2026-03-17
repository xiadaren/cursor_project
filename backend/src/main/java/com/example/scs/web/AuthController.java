package com.example.scs.web;

import com.example.scs.common.ApiResponse;
import com.example.scs.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    public record LoginRequest(
            @Email @NotBlank String email,
            @NotBlank String password
    ) {}

    public record RegisterRequest(
            @NotBlank String name,
            @Email @NotBlank String email,
            @NotBlank String password,
            @NotBlank String studentId
    ) {}

    public record RefreshTokenRequest(@NotBlank String refreshToken) {}

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        AuthService.LoginResult r = authService.login(req.email(), req.password());
        return ApiResponse.ok(new LoginResponse(r.accessToken(), r.refreshToken(), r.user()));
    }

    @PostMapping("/register")
    public ApiResponse<Void> register(@Valid @RequestBody RegisterRequest req) {
        authService.registerStudent(req.name(), req.email(), req.password(), req.studentId());
        return ApiResponse.ok(null);
    }

    @PostMapping("/refresh-token")
    public ApiResponse<LoginResponse> refresh(@Valid @RequestBody RefreshTokenRequest req) {
        AuthService.LoginResult r = authService.refresh(req.refreshToken());
        return ApiResponse.ok(new LoginResponse(r.accessToken(), r.refreshToken(), r.user()));
    }

    public record LoginResponse(String accessToken, String refreshToken, AuthService.AuthUserDto user) {}
}

