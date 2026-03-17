package com.example.scs.web;

import com.example.scs.common.ApiResponse;
import com.example.scs.domain.Notification;
import com.example.scs.domain.User;
import com.example.scs.repository.NotificationRepository;
import com.example.scs.service.CurrentUserService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api")
public class NotificationsController {
    private final CurrentUserService currentUserService;
    private final NotificationRepository notificationRepository;

    public NotificationsController(CurrentUserService currentUserService, NotificationRepository notificationRepository) {
        this.currentUserService = currentUserService;
        this.notificationRepository = notificationRepository;
    }

    public record NotificationDto(long id, String content, boolean isRead, LocalDateTime createdAt) {}

    @GetMapping("/student/notifications")
    public ApiResponse<List<NotificationDto>> list(Authentication authentication) {
        User user = currentUserService.requireUser(authentication);
        List<Notification> list = notificationRepository.findTop50ByUserOrderByCreatedAtDesc(user);
        return ApiResponse.ok(list.stream()
                .map(n -> new NotificationDto(n.getId(), n.getContent(), n.isRead(), n.getCreatedAt()))
                .toList());
    }

    @PutMapping("/notifications/{id}/read")
    public ApiResponse<Void> markRead(@PathVariable long id, Authentication authentication) {
        User user = currentUserService.requireUser(authentication);
        Notification n = notificationRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("通知不存在"));
        if (!n.getUser().getId().equals(user.getId())) throw new IllegalArgumentException("无权限");
        n.setRead(true);
        notificationRepository.save(n);
        return ApiResponse.ok(null);
    }
}

