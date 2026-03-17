package com.example.scs.web;

import com.example.scs.common.ApiResponse;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UsersController {

    @GetMapping("/profile")
    public ApiResponse<Map<String, Object>> me(Authentication authentication) {
        return ApiResponse.ok(Map.of(
                "subject", authentication == null ? null : authentication.getName(),
                "authorities", authentication == null ? null : authentication.getAuthorities()
        ));
    }
}

