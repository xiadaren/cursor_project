package com.example.scs.service;

import com.example.scs.domain.User;
import com.example.scs.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {
    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User requireUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new IllegalArgumentException("未登录");
        }
        long id = Long.parseLong(authentication.getName());
        return userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("用户不存在"));
    }
}

