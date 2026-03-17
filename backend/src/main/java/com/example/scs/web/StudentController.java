package com.example.scs.web;

import com.example.scs.common.ApiResponse;
import com.example.scs.domain.*;
import com.example.scs.repository.EnrollmentRepository;
import com.example.scs.repository.EnrollmentWindowRepository;
import com.example.scs.repository.SemesterRepository;
import com.example.scs.service.CurrentUserService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/student")
public class StudentController {
    private final CurrentUserService currentUserService;
    private final SemesterRepository semesterRepository;
    private final EnrollmentWindowRepository enrollmentWindowRepository;
    private final EnrollmentRepository enrollmentRepository;

    public StudentController(
            CurrentUserService currentUserService,
            SemesterRepository semesterRepository,
            EnrollmentWindowRepository enrollmentWindowRepository,
            EnrollmentRepository enrollmentRepository
    ) {
        this.currentUserService = currentUserService;
        this.semesterRepository = semesterRepository;
        this.enrollmentWindowRepository = enrollmentWindowRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    public record DashboardDto(
            String semesterName,
            int totalCredits,
            boolean enrollmentOpen,
            LocalDateTime enrollmentEndAt
    ) {}

    @GetMapping("/dashboard")
    public ApiResponse<DashboardDto> dashboard(Authentication authentication) {
        User user = currentUserService.requireUser(authentication);
        if (user.getRole() != Role.STUDENT) throw new IllegalArgumentException("仅学生可访问");

        Semester sem = semesterRepository.findByActiveTrue()
                .orElseThrow(() -> new IllegalArgumentException("当前没有激活的学期"));
        EnrollmentWindow w = enrollmentWindowRepository.findBySemester(sem)
                .orElseThrow(() -> new IllegalArgumentException("未设置选课周期"));

        LocalDateTime now = LocalDateTime.now();
        boolean open = !now.isBefore(w.getStartAt()) && !now.isAfter(w.getEndAt());

        List<Enrollment> list = enrollmentRepository.findByStudentAndStatus(user, EnrollmentStatus.ENROLLED);
        int credits = list.stream().mapToInt(e -> e.getCourse().getCredits()).sum();

        return ApiResponse.ok(new DashboardDto(sem.getName(), credits, open, w.getEndAt()));
    }

    public record ScheduleCourseDto(
            long courseId,
            String name,
            String teacherName,
            int credits,
            int dayOfWeek,
            int startPeriod,
            int endPeriod,
            String location,
            String schedule
    ) {}

    @GetMapping("/enrollments")
    public ApiResponse<List<ScheduleCourseDto>> myCourses(Authentication authentication) {
        return schedule(authentication);
    }

    @GetMapping("/schedule")
    public ApiResponse<List<ScheduleCourseDto>> schedule(Authentication authentication) {
        User user = currentUserService.requireUser(authentication);
        if (user.getRole() != Role.STUDENT) throw new IllegalArgumentException("仅学生可访问");

        List<Enrollment> enrollments = enrollmentRepository.findByStudentAndStatus(user, EnrollmentStatus.ENROLLED);
        return ApiResponse.ok(enrollments.stream()
                .map(e -> {
                    Course c = e.getCourse();
                    return new ScheduleCourseDto(
                            c.getId(),
                            c.getName(),
                            c.getTeacher().getName(),
                            c.getCredits(),
                            c.getDayOfWeek(),
                            c.getStartPeriod(),
                            c.getEndPeriod(),
                            c.getLocation(),
                            c.getSchedule()
                    );
                })
                .toList());
    }
}

