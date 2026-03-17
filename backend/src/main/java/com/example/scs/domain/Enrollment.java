package com.example.scs.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "enrollments",
        uniqueConstraints = @UniqueConstraint(name = "uk_enrollments_student_course", columnNames = {"student_id", "course_id"}),
        indexes = {
                @Index(name = "idx_enrollments_student", columnList = "student_id"),
                @Index(name = "idx_enrollments_course", columnList = "course_id")
        })
public class Enrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false, foreignKey = @ForeignKey(name = "fk_enrollments_student"))
    private User student;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false, foreignKey = @ForeignKey(name = "fk_enrollments_course"))
    private Course course;

    @Column(name = "enroll_time", nullable = false)
    private LocalDateTime enrollTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private EnrollmentStatus status;

    @PrePersist
    public void prePersist() {
        if (enrollTime == null) enrollTime = LocalDateTime.now();
        if (status == null) status = EnrollmentStatus.ENROLLED;
    }
}

