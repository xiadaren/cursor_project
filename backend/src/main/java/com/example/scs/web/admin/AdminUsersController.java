package com.example.scs.web.admin;

import com.example.scs.common.ApiResponse;
import com.example.scs.domain.Role;
import com.example.scs.domain.User;
import com.example.scs.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUsersController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUsersController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public record UserDto(
            long id,
            String role,
            String email,
            String name,
            String studentId,
            String teacherId
    ) {}

    @GetMapping
    public ApiResponse<List<UserDto>> list(@RequestParam String role) {
        Role r = Role.valueOf(role);
        return ApiResponse.ok(userRepository.findByRole(r, PageRequest.of(0, 2000)).getContent().stream().map(this::toDto).toList());
    }

    public record CreateUserRequest(
            @NotNull Role role,
            @Email @NotBlank String email,
            @NotBlank String name,
            String studentId,
            String teacherId,
            String password
    ) {}

    @PostMapping
    public ApiResponse<UserDto> create(@Valid @RequestBody CreateUserRequest req) {
        if (req.role() == Role.STUDENT) throw new IllegalArgumentException("学生请通过注册创建");
        if (userRepository.findByEmail(req.email()).isPresent()) throw new IllegalArgumentException("邮箱已存在");

        User u = new User();
        u.setRole(req.role());
        u.setEmail(req.email());
        u.setName(req.name());
        u.setStudentId(req.studentId());
        u.setTeacherId(req.teacherId());
        String raw = (req.password() == null || req.password().isBlank())
                ? (req.teacherId() != null ? req.teacherId() : "ChangeMe123")
                : req.password();
        u.setPasswordHash(passwordEncoder.encode(raw));
        userRepository.save(u);
        return ApiResponse.ok(toDto(u));
    }

    public record UpdateUserRequest(
            @Email @NotBlank String email,
            @NotBlank String name,
            String studentId,
            String teacherId
    ) {}

    @PutMapping("/{id}")
    public ApiResponse<UserDto> update(@PathVariable long id, @Valid @RequestBody UpdateUserRequest req) {
        User u = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("用户不存在"));
        u.setEmail(req.email());
        u.setName(req.name());
        u.setStudentId(req.studentId());
        u.setTeacherId(req.teacherId());
        userRepository.save(u);
        return ApiResponse.ok(toDto(u));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable long id) {
        userRepository.deleteById(id);
        return ApiResponse.ok(null);
    }

    @PostMapping("/{id}/reset-password")
    public ApiResponse<Void> resetPassword(@PathVariable long id, @RequestParam(required = false) String password) {
        User u = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("用户不存在"));
        String raw = (password == null || password.isBlank())
                ? (u.getRole() == Role.STUDENT ? (u.getStudentId() == null ? "Student123" : u.getStudentId()) : (u.getTeacherId() == null ? "Teacher123" : u.getTeacherId()))
                : password;
        u.setPasswordHash(passwordEncoder.encode(raw));
        userRepository.save(u);
        return ApiResponse.ok(null);
    }

    private UserDto toDto(User u) {
        return new UserDto(u.getId(), u.getRole().name(), u.getEmail(), u.getName(), u.getStudentId(), u.getTeacherId());
    }
}

