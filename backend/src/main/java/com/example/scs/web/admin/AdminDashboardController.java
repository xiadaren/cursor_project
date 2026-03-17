package com.example.scs.web.admin;

import com.example.scs.common.ApiResponse;
import com.example.scs.domain.EnrollmentStatus;
import com.example.scs.domain.Role;
import com.example.scs.domain.Semester;
import com.example.scs.repository.CourseRepository;
import com.example.scs.repository.EnrollmentRepository;
import com.example.scs.repository.SemesterRepository;
import com.example.scs.repository.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final SemesterRepository semesterRepository;
    private final EnrollmentRepository enrollmentRepository;

    public AdminDashboardController(
            CourseRepository courseRepository,
            UserRepository userRepository,
            SemesterRepository semesterRepository,
            EnrollmentRepository enrollmentRepository
    ) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.semesterRepository = semesterRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    public record AdminDashboardDto(
            long courseCount,
            long studentCount,
            long teacherCount,
            long currentEnrollmentCount
    ) {}

    @GetMapping("/dashboard")
    public ApiResponse<AdminDashboardDto> dashboard() {
        Semester sem = semesterRepository.findByActiveTrue().orElse(null);
        long courseCount = sem == null ? 0 : courseRepository.countBySemester(sem);
        long studentCount = userRepository.countByRole(Role.STUDENT);
        long teacherCount = userRepository.countByRole(Role.TEACHER);
        long enrollmentCount = 0;
        if (sem != null) {
            // best-effort: count enrollments by iterating courses is expensive; keep minimal for now
            enrollmentCount = enrollmentRepository.count();
        }
        return ApiResponse.ok(new AdminDashboardDto(courseCount, studentCount, teacherCount, enrollmentCount));
    }
}

