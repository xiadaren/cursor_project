package com.example.scs.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "audit_logs",
        indexes = {
                @Index(name = "idx_audit_logs_actor", columnList = "actor_user_id"),
                @Index(name = "idx_audit_logs_created", columnList = "created_at")
        })
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_user_id", foreignKey = @ForeignKey(name = "fk_audit_logs_actor"))
    private User actorUser;

    @Column(name = "action", nullable = false, length = 64)
    private String action;

    @Lob
    @Column(name = "detail")
    private String detail;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}

