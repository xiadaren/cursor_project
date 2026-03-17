package com.example.scs.web;

import com.example.scs.common.ApiResponse;
import com.example.scs.domain.Course;
import com.example.scs.domain.Enrollment;
import com.example.scs.domain.EnrollmentStatus;
import com.example.scs.domain.Semester;
import com.example.scs.domain.User;
import com.example.scs.repository.CourseRepository;
import com.example.scs.repository.EnrollmentRepository;
import com.example.scs.repository.SemesterRepository;
import com.example.scs.service.CurrentUserService;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api")
public class CoursesController {
    private final SemesterRepository semesterRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CurrentUserService currentUserService;

    public CoursesController(
            SemesterRepository semesterRepository,
            CourseRepository courseRepository,
            EnrollmentRepository enrollmentRepository,
            CurrentUserService currentUserService
    ) {
        this.semesterRepository = semesterRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.currentUserService = currentUserService;
    }

    public record CourseCardDto(
            long id,
            String name,
            String teacherName,
            int credits,
            int capacity,
            int enrolled,
            String schedule,
            int dayOfWeek,
            int startPeriod,
            int endPeriod,
            String location,
            boolean selected
    ) {}

    @GetMapping("/courses")
    public ApiResponse<List<CourseCardDto>> listCourses(
            @RequestParam(required = false) Long semesterId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer credits,
            Authentication authentication
    ) {
        Semester semester = (semesterId != null)
                ? semesterRepository.findById(semesterId).orElseThrow(() -> new IllegalArgumentException("学期不存在"))
                : semesterRepository.findByActiveTrue().orElseThrow(() -> new IllegalArgumentException("当前没有激活的学期"));

        String kw = keyword == null ? "" : keyword.trim();
        List<Course> courses = kw.isEmpty()
                ? courseRepository.findBySemester(semester, PageRequest.of(0, 2000)).getContent()
                : courseRepository.findBySemesterAndNameContainingIgnoreCase(semester, kw, PageRequest.of(0, 2000)).getContent();

        Set<Long> selectedIds = new HashSet<>();
        if (authentication != null) {
            User user = currentUserService.requireUser(authentication);
            List<Enrollment> enrollments = enrollmentRepository.findByStudentAndStatus(user, EnrollmentStatus.ENROLLED);
            for (Enrollment e : enrollments) selectedIds.add(e.getCourse().getId());
        }

        return ApiResponse.ok(
                courses.stream()
                        .filter(c -> credits == null || c.getCredits() == credits)
                        .map(c -> new CourseCardDto(
                                c.getId(),
                                c.getName(),
                                c.getTeacher().getName(),
                                c.getCredits(),
                                c.getCapacity(),
                                c.getEnrolled(),
                                c.getSchedule(),
                                c.getDayOfWeek(),
                                c.getStartPeriod(),
                                c.getEndPeriod(),
                                c.getLocation(),
                                selectedIds.contains(c.getId())
                        ))
                        .toList()
        );
    }

    public record CourseDetailDto(
            long id,
            String name,
            String teacherName,
            int credits,
            int capacity,
            int enrolled,
            String schedule,
            String location,
            String description,
            int dayOfWeek,
            int startPeriod,
            int endPeriod
    ) {}

    @GetMapping("/courses/{id}")
    public ApiResponse<CourseDetailDto> getCourse(@PathVariable long id) {
        Course c = courseRepository.findWithTeacherById(id)
                .orElseThrow(() -> new IllegalArgumentException("课程不存在"));
        return ApiResponse.ok(new CourseDetailDto(
                c.getId(),
                c.getName(),
                c.getTeacher().getName(),
                c.getCredits(),
                c.getCapacity(),
                c.getEnrolled(),
                c.getSchedule(),
                c.getLocation(),
                c.getDescription(),
                c.getDayOfWeek(),
                c.getStartPeriod(),
                c.getEndPeriod()
        ));
    }
}

