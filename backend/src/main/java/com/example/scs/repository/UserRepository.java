package com.example.scs.repository;

import com.example.scs.domain.Role;
import com.example.scs.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    long countByRole(Role role);
    Page<User> findByRole(Role role, Pageable pageable);
}

