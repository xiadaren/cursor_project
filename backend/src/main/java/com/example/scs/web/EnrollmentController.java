package com.example.scs.web;

import com.example.scs.common.ApiResponse;
import com.example.scs.domain.User;
import com.example.scs.service.CurrentUserService;
import com.example.scs.service.EnrollmentService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {
    private final EnrollmentService enrollmentService;
    private final CurrentUserService currentUserService;

    public EnrollmentController(EnrollmentService enrollmentService, CurrentUserService currentUserService) {
        this.enrollmentService = enrollmentService;
        this.currentUserService = currentUserService;
    }

    public record EnrollRequest(@NotNull @Min(1) Long courseId) {}

    @PostMapping
    public ApiResponse<Void> enroll(@Valid @RequestBody EnrollRequest req, Authentication authentication) {
        User student = currentUserService.requireUser(authentication);
        enrollmentService.enroll(student, req.courseId());
        return ApiResponse.ok(null);
    }

    @DeleteMapping("/{courseId}")
    public ApiResponse<Void> drop(@PathVariable long courseId, Authentication authentication) {
        User student = currentUserService.requireUser(authentication);
        enrollmentService.drop(student, courseId);
        return ApiResponse.ok(null);
    }
}

