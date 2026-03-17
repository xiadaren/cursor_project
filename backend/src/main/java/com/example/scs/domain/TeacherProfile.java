package com.example.scs.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "teacher_profiles")
public class TeacherProfile {
    @Id
    private Long userId;

    @MapsId
    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "fk_teacher_profiles_user"))
    private User user;

    @Column(length = 32)
    private String title;

    @Column(length = 64)
    private String department;
}

