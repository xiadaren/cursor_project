package com.example.scs.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "enrollment_windows",
        indexes = @Index(name = "idx_enrollment_windows_semester", columnList = "semester_id"))
public class EnrollmentWindow {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id", nullable = false, foreignKey = @ForeignKey(name = "fk_enrollment_windows_semester"))
    private Semester semester;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @Column(name = "end_at", nullable = false)
    private LocalDateTime endAt;
}

