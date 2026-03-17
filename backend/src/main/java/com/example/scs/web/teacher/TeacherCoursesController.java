package com.example.scs.web.teacher;

import com.example.scs.common.ApiResponse;
import com.example.scs.domain.*;
import com.example.scs.repository.CourseRepository;
import com.example.scs.repository.EnrollmentRepository;
import com.example.scs.service.CurrentUserService;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/teacher")
@PreAuthorize("hasRole('TEACHER')")
public class TeacherCoursesController {
    private final CurrentUserService currentUserService;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    public TeacherCoursesController(CurrentUserService currentUserService, CourseRepository courseRepository, EnrollmentRepository enrollmentRepository) {
        this.currentUserService = currentUserService;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    public record TeacherCourseDto(long id, String name, String schedule, int enrolled, int capacity) {}

    @GetMapping("/courses")
    public ApiResponse<List<TeacherCourseDto>> myCourses(Authentication authentication) {
        User teacher = currentUserService.requireUser(authentication);
        List<Course> list = courseRepository.findByTeacher(teacher, PageRequest.of(0, 2000)).getContent();
        return ApiResponse.ok(list.stream()
                .map(c -> new TeacherCourseDto(c.getId(), c.getName(), c.getSchedule(), c.getEnrolled(), c.getCapacity()))
                .toList());
    }

    public record StudentDto(long id, String name, String studentId, String email) {}

    @GetMapping("/courses/{courseId}/students")
    public ApiResponse<List<StudentDto>> students(@PathVariable long courseId, @RequestParam(required = false) String keyword, Authentication authentication) {
        User teacher = currentUserService.requireUser(authentication);
        Course course = courseRepository.findWithTeacherById(courseId).orElseThrow(() -> new IllegalArgumentException("课程不存在"));
        if (!course.getTeacher().getId().equals(teacher.getId())) throw new IllegalArgumentException("无权限");

        String kw = keyword == null ? "" : keyword.trim();
        List<Enrollment> enrollments = enrollmentRepository.findByCourseAndStatus(course, EnrollmentStatus.ENROLLED);
        return ApiResponse.ok(enrollments.stream()
                .map(Enrollment::getStudent)
                .filter(s -> kw.isEmpty()
                        || (s.getName() != null && s.getName().contains(kw))
                        || (s.getStudentId() != null && s.getStudentId().contains(kw)))
                .map(s -> new StudentDto(s.getId(), s.getName(), s.getStudentId(), s.getEmail()))
                .toList());
    }

    @GetMapping("/courses/{courseId}/export")
    public ResponseEntity<byte[]> exportCsv(@PathVariable long courseId, Authentication authentication) {
        User teacher = currentUserService.requireUser(authentication);
        Course course = courseRepository.findWithTeacherById(courseId).orElseThrow(() -> new IllegalArgumentException("课程不存在"));
        if (!course.getTeacher().getId().equals(teacher.getId())) throw new IllegalArgumentException("无权限");

        List<Enrollment> enrollments = enrollmentRepository.findByCourseAndStatus(course, EnrollmentStatus.ENROLLED);
        String csv = "studentId,name,email\n" + enrollments.stream()
                .map(Enrollment::getStudent)
                .map(s -> String.join(",", safe(s.getStudentId()), safe(s.getName()), safe(s.getEmail())))
                .collect(Collectors.joining("\n"));

        byte[] bytes = csv.getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"course-" + courseId + "-students.csv\"")
                .contentType(new MediaType("text", "csv"))
                .body(bytes);
    }

    private static String safe(String s) {
        if (s == null) return "";
        String v = s.replace("\"", "\"\"");
        if (v.contains(",") || v.contains("\n") || v.contains("\r")) {
            return "\"" + v + "\"";
        }
        return v;
    }
}

