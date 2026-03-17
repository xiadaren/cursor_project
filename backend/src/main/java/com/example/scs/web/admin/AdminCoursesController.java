package com.example.scs.web.admin;

import com.example.scs.common.ApiResponse;
import com.example.scs.domain.Course;
import com.example.scs.domain.Role;
import com.example.scs.domain.Semester;
import com.example.scs.domain.User;
import com.example.scs.repository.CourseRepository;
import com.example.scs.repository.SemesterRepository;
import com.example.scs.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/admin/courses")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCoursesController {
    private final CourseRepository courseRepository;
    private final SemesterRepository semesterRepository;
    private final UserRepository userRepository;

    public AdminCoursesController(CourseRepository courseRepository, SemesterRepository semesterRepository, UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.semesterRepository = semesterRepository;
        this.userRepository = userRepository;
    }

    public record CourseDto(
            long id,
            String name,
            long teacherId,
            String teacherName,
            int credits,
            int capacity,
            int enrolled,
            String schedule,
            int dayOfWeek,
            int startPeriod,
            int endPeriod,
            String location,
            String description
    ) {}

    @GetMapping
    public ApiResponse<List<CourseDto>> list(@RequestParam(required = false) String keyword) {
        Semester sem = semesterRepository.findByActiveTrue().orElseThrow(() -> new IllegalArgumentException("当前没有激活的学期"));
        String kw = keyword == null ? "" : keyword.trim();
        List<Course> courses = kw.isEmpty()
                ? courseRepository.findBySemester(sem, PageRequest.of(0, 2000)).getContent()
                : courseRepository.findBySemesterAndNameContainingIgnoreCase(sem, kw, PageRequest.of(0, 2000)).getContent();
        return ApiResponse.ok(courses.stream().map(this::toDto).toList());
    }

    public record CreateOrUpdateCourseRequest(
            @NotBlank String name,
            @NotNull Long teacherId,
            @Min(0) int credits,
            @Min(1) int capacity,
            @NotBlank String schedule,
            @Min(1) int dayOfWeek,
            @Min(1) int startPeriod,
            @Min(1) int endPeriod,
            @NotBlank String location,
            String description
    ) {}

    @PostMapping
    public ApiResponse<CourseDto> create(@Valid @RequestBody CreateOrUpdateCourseRequest req) {
        Semester sem = semesterRepository.findByActiveTrue().orElseThrow(() -> new IllegalArgumentException("当前没有激活的学期"));
        User teacher = userRepository.findById(req.teacherId()).orElseThrow(() -> new IllegalArgumentException("教师不存在"));
        if (teacher.getRole() != Role.TEACHER) throw new IllegalArgumentException("指定用户不是教师");

        Course c = new Course();
        apply(req, c, teacher, sem);
        c.setEnrolled(0);
        Course saved = courseRepository.save(c);
        return ApiResponse.ok(toDto(saved));
    }

    @PutMapping("/{id}")
    public ApiResponse<CourseDto> update(@PathVariable long id, @Valid @RequestBody CreateOrUpdateCourseRequest req) {
        Course c = courseRepository.findWithTeacherById(id).orElseThrow(() -> new IllegalArgumentException("课程不存在"));
        Semester sem = semesterRepository.findByActiveTrue().orElseThrow(() -> new IllegalArgumentException("当前没有激活的学期"));
        User teacher = userRepository.findById(req.teacherId()).orElseThrow(() -> new IllegalArgumentException("教师不存在"));
        if (teacher.getRole() != Role.TEACHER) throw new IllegalArgumentException("指定用户不是教师");

        apply(req, c, teacher, sem);
        Course saved = courseRepository.save(c);
        return ApiResponse.ok(toDto(saved));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable long id) {
        courseRepository.deleteById(id);
        return ApiResponse.ok(null);
    }

    @PostMapping("/import")
    public ApiResponse<Integer> importCsv(@RequestParam("file") MultipartFile file) {
        Semester sem = semesterRepository.findByActiveTrue().orElseThrow(() -> new IllegalArgumentException("当前没有激活的学期"));
        try {
            String text = new String(file.getBytes(), StandardCharsets.UTF_8);
            String[] lines = text.split("\\r?\\n");
            int created = 0;
            for (int i = 0; i < lines.length; i++) {
                String line = lines[i].trim();
                if (line.isEmpty()) continue;
                if (i == 0 && line.toLowerCase().contains("name")) continue; // skip header
                String[] cols = line.split(",");
                if (cols.length < 9) continue;

                // CSV format:
                // name,teacherEmail,credits,capacity,dayOfWeek,startPeriod,endPeriod,location,schedule,description?
                String name = cols[0].trim();
                String teacherEmail = cols[1].trim();
                int credits = Integer.parseInt(cols[2].trim());
                int capacity = Integer.parseInt(cols[3].trim());
                int day = Integer.parseInt(cols[4].trim());
                int start = Integer.parseInt(cols[5].trim());
                int end = Integer.parseInt(cols[6].trim());
                String location = cols[7].trim();
                String schedule = cols[8].trim();
                String desc = cols.length >= 10 ? cols[9].trim() : null;

                User teacher = userRepository.findByEmail(teacherEmail).orElseThrow(() -> new IllegalArgumentException("教师邮箱不存在: " + teacherEmail));
                if (teacher.getRole() != Role.TEACHER) throw new IllegalArgumentException("非教师账号: " + teacherEmail);

                Course c = new Course();
                c.setName(name);
                c.setTeacher(teacher);
                c.setCredits(credits);
                c.setCapacity(capacity);
                c.setEnrolled(0);
                c.setDayOfWeek(day);
                c.setStartPeriod(start);
                c.setEndPeriod(end);
                c.setLocation(location);
                c.setSchedule(schedule);
                c.setDescription(desc);
                c.setSemester(sem);
                courseRepository.save(c);
                created++;
            }
            return ApiResponse.ok(created);
        } catch (Exception e) {
            throw new IllegalArgumentException("CSV导入失败: " + e.getMessage());
        }
    }

    private void apply(CreateOrUpdateCourseRequest req, Course c, User teacher, Semester sem) {
        c.setName(req.name());
        c.setTeacher(teacher);
        c.setCredits(req.credits());
        c.setCapacity(req.capacity());
        c.setDayOfWeek(req.dayOfWeek());
        c.setStartPeriod(req.startPeriod());
        c.setEndPeriod(req.endPeriod());
        c.setLocation(req.location());
        c.setSchedule(req.schedule());
        c.setDescription(req.description());
        c.setSemester(sem);
    }

    private CourseDto toDto(Course c) {
        return new CourseDto(
                c.getId(),
                c.getName(),
                c.getTeacher().getId(),
                c.getTeacher().getName(),
                c.getCredits(),
                c.getCapacity(),
                c.getEnrolled(),
                c.getSchedule(),
                c.getDayOfWeek(),
                c.getStartPeriod(),
                c.getEndPeriod(),
                c.getLocation(),
                c.getDescription()
        );
    }
}

