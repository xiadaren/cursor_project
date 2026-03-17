package com.example.scs.web.admin;

import com.example.scs.common.ApiResponse;
import com.example.scs.domain.EnrollmentWindow;
import com.example.scs.domain.Semester;
import com.example.scs.repository.EnrollmentWindowRepository;
import com.example.scs.repository.SemesterRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/semesters")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSemestersController {
    private final SemesterRepository semesterRepository;
    private final EnrollmentWindowRepository enrollmentWindowRepository;

    public AdminSemestersController(SemesterRepository semesterRepository, EnrollmentWindowRepository enrollmentWindowRepository) {
        this.semesterRepository = semesterRepository;
        this.enrollmentWindowRepository = enrollmentWindowRepository;
    }

    public record SemesterDto(long id, String name, LocalDate startDate, LocalDate endDate, boolean isActive) {}
    public record WindowDto(Long id, long semesterId, LocalDateTime startAt, LocalDateTime endAt) {}

    @GetMapping
    public ApiResponse<List<SemesterDto>> list() {
        return ApiResponse.ok(semesterRepository.findAll().stream()
                .map(s -> new SemesterDto(s.getId(), s.getName(), s.getStartDate(), s.getEndDate(), s.isActive()))
                .toList());
    }

    public record CreateSemesterRequest(
            @NotBlank String name,
            @NotNull LocalDate startDate,
            @NotNull LocalDate endDate
    ) {}

    @PostMapping
    public ApiResponse<SemesterDto> create(@Valid @RequestBody CreateSemesterRequest req) {
        Semester s = new Semester();
        s.setName(req.name());
        s.setStartDate(req.startDate());
        s.setEndDate(req.endDate());
        s.setActive(false);
        semesterRepository.save(s);
        return ApiResponse.ok(new SemesterDto(s.getId(), s.getName(), s.getStartDate(), s.getEndDate(), s.isActive()));
    }

    @PutMapping("/{id}/activate")
    @Transactional
    public ApiResponse<Void> activate(@PathVariable long id) {
        Semester target = semesterRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("学期不存在"));
        semesterRepository.findByActiveTrue().ifPresent(s -> {
            s.setActive(false);
            semesterRepository.save(s);
        });
        target.setActive(true);
        semesterRepository.save(target);
        return ApiResponse.ok(null);
    }

    public record UpsertWindowRequest(@NotNull LocalDateTime startAt, @NotNull LocalDateTime endAt) {}

    @GetMapping("/{id}/window")
    public ApiResponse<WindowDto> window(@PathVariable long id) {
        Semester sem = semesterRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("学期不存在"));
        EnrollmentWindow w = enrollmentWindowRepository.findBySemester(sem).orElse(null);
        if (w == null) return ApiResponse.ok(null);
        return ApiResponse.ok(new WindowDto(w.getId(), sem.getId(), w.getStartAt(), w.getEndAt()));
    }

    @PutMapping("/{id}/window")
    @Transactional
    public ApiResponse<WindowDto> upsertWindow(@PathVariable long id, @Valid @RequestBody UpsertWindowRequest req) {
        Semester sem = semesterRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("学期不存在"));
        EnrollmentWindow w = enrollmentWindowRepository.findBySemester(sem).orElseGet(EnrollmentWindow::new);
        w.setSemester(sem);
        w.setStartAt(req.startAt());
        w.setEndAt(req.endAt());
        enrollmentWindowRepository.save(w);
        return ApiResponse.ok(new WindowDto(w.getId(), sem.getId(), w.getStartAt(), w.getEndAt()));
    }
}

