package com.example.scs.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "student_profiles")
public class StudentProfile {
    @Id
    private Long userId;

    @MapsId
    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "fk_student_profiles_user"))
    private User user;

    @Column(length = 32)
    private String grade;

    @Column(length = 64)
    private String major;
}

