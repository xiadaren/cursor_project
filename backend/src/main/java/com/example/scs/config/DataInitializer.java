package com.example.scs.config;

import com.example.scs.domain.Role;
import com.example.scs.domain.User;
import com.example.scs.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public ApplicationRunner initAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.default-admin.email:admin@example.com}") String email,
            @Value("${app.default-admin.password:Admin123}") String password
    ) {
        return args -> {
            if (userRepository.findByEmail(email).isPresent()) return;

            User admin = new User();
            admin.setRole(Role.ADMIN);
            admin.setEmail(email);
            admin.setName("系统管理员");
            admin.setPasswordHash(passwordEncoder.encode(password));
            userRepository.save(admin);
        };
    }
}

