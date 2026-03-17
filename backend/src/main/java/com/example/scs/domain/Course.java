package com.example.scs.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "courses",
        indexes = {
                @Index(name = "idx_courses_semester", columnList = "semester_id"),
                @Index(name = "idx_courses_teacher", columnList = "teacher_id")
        })
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 128)
    private String name;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false, foreignKey = @ForeignKey(name = "fk_courses_teacher"))
    private User teacher;

    @Column(nullable = false)
    private int credits;

    @Column(nullable = false)
    private int capacity;

    @Column(nullable = false)
    private int enrolled;

    @Column(name = "day_of_week", nullable = false)
    private int dayOfWeek; // 1=Mon ... 7=Sun

    @Column(name = "start_period", nullable = false)
    private int startPeriod;

    @Column(name = "end_period", nullable = false)
    private int endPeriod;

    @Column(nullable = false, length = 64)
    private String location;

    @Column(nullable = false, length = 64)
    private String schedule; // display string e.g. "周一3-4节"

    @Lob
    @Column
    private String description;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id", nullable = false, foreignKey = @ForeignKey(name = "fk_courses_semester"))
    private Semester semester;

    @Version
    private Long version;
}

