package com.example.scs.web.admin;

import com.example.scs.common.ApiResponse;
import com.example.scs.domain.AuditLog;
import com.example.scs.repository.AuditLogRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/logs")
@PreAuthorize("hasRole('ADMIN')")
public class AdminLogsController {
    private final AuditLogRepository auditLogRepository;

    public AdminLogsController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public record AuditLogDto(long id, Long actorUserId, String action, String detail, LocalDateTime createdAt) {}

    @GetMapping
    public ApiResponse<List<AuditLogDto>> list(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "50") int size) {
        List<AuditLog> logs = auditLogRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, Math.min(size, 200))).getContent();
        return ApiResponse.ok(logs.stream().map(l -> new AuditLogDto(
                l.getId(),
                l.getActorUser() == null ? null : l.getActorUser().getId(),
                l.getAction(),
                l.getDetail(),
                l.getCreatedAt()
        )).toList());
    }
}

