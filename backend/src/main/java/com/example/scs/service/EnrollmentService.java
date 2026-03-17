package com.example.scs.service;

import com.example.scs.domain.*;
import com.example.scs.repository.*;
import jakarta.persistence.OptimisticLockException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EnrollmentService {
    private final SemesterRepository semesterRepository;
    private final EnrollmentWindowRepository enrollmentWindowRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;

    public EnrollmentService(
            SemesterRepository semesterRepository,
            EnrollmentWindowRepository enrollmentWindowRepository,
            CourseRepository courseRepository,
            EnrollmentRepository enrollmentRepository,
            NotificationRepository notificationRepository,
            AuditLogRepository auditLogRepository
    ) {
        this.semesterRepository = semesterRepository;
        this.enrollmentWindowRepository = enrollmentWindowRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.notificationRepository = notificationRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void enroll(User student, long courseId) {
        requireStudent(student);
        Semester sem = semesterRepository.findByActiveTrue()
                .orElseThrow(() -> new IllegalArgumentException("当前没有激活的学期"));
        ensureWindowOpen(sem);

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("课程不存在"));
        if (!course.getSemester().getId().equals(sem.getId())) {
            throw new IllegalArgumentException("课程不属于当前学期");
        }

        Enrollment existing = enrollmentRepository.findByStudentAndCourse(student, course).orElse(null);
        if (existing != null && existing.getStatus() == EnrollmentStatus.ENROLLED) {
            throw new IllegalArgumentException("你已选过该课程");
        }

        // time conflict check with current enrollments
        List<Enrollment> current = enrollmentRepository.findByStudentAndStatus(student, EnrollmentStatus.ENROLLED);
        for (Enrollment e : current) {
            Course c = e.getCourse();
            if (!c.getSemester().getId().equals(sem.getId())) continue;
            if (isConflict(course, c)) {
                throw new IllegalArgumentException("与已选课程时间冲突：" + c.getName());
            }
        }

        if (course.getEnrolled() >= course.getCapacity()) {
            throw new IllegalArgumentException("课程容量已满");
        }

        try {
            course.setEnrolled(course.getEnrolled() + 1);
            courseRepository.save(course);

            Enrollment en = existing != null ? existing : new Enrollment();
            en.setStudent(student);
            en.setCourse(course);
            en.setStatus(EnrollmentStatus.ENROLLED);
            en.setEnrollTime(LocalDateTime.now());
            enrollmentRepository.save(en);

            notify(student, "选课成功：" + course.getName());
            audit(student, "ENROLL", "courseId=" + course.getId());
        } catch (OptimisticLockException ex) {
            throw new IllegalArgumentException("选课人数更新冲突，请重试");
        }
    }

    @Transactional
    public void drop(User student, long courseId) {
        requireStudent(student);
        Semester sem = semesterRepository.findByActiveTrue()
                .orElseThrow(() -> new IllegalArgumentException("当前没有激活的学期"));
        ensureWindowOpen(sem);

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("课程不存在"));
        Enrollment en = enrollmentRepository.findByStudentAndCourse(student, course)
                .orElseThrow(() -> new IllegalArgumentException("你未选择该课程"));
        if (en.getStatus() != EnrollmentStatus.ENROLLED) {
            throw new IllegalArgumentException("该课程已退课");
        }

        try {
            en.setStatus(EnrollmentStatus.DROPPED);
            enrollmentRepository.save(en);

            course.setEnrolled(Math.max(0, course.getEnrolled() - 1));
            courseRepository.save(course);

            notify(student, "退课成功：" + course.getName());
            audit(student, "DROP", "courseId=" + course.getId());
        } catch (OptimisticLockException ex) {
            throw new IllegalArgumentException("退课人数更新冲突，请重试");
        }
    }

    private void ensureWindowOpen(Semester sem) {
        EnrollmentWindow w = enrollmentWindowRepository.findBySemester(sem)
                .orElseThrow(() -> new IllegalArgumentException("未设置选课周期"));
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(w.getStartAt()) || now.isAfter(w.getEndAt())) {
            throw new IllegalArgumentException("当前不在选课开放时间");
        }
    }

    private static boolean isConflict(Course a, Course b) {
        if (a.getDayOfWeek() != b.getDayOfWeek()) return false;
        return !(a.getEndPeriod() < b.getStartPeriod() || a.getStartPeriod() > b.getEndPeriod());
    }

    private static void requireStudent(User u) {
        if (u.getRole() != Role.STUDENT) throw new IllegalArgumentException("仅学生可进行选课操作");
    }

    private void notify(User user, String content) {
        Notification n = new Notification();
        n.setUser(user);
        n.setContent(content);
        n.setRead(false);
        notificationRepository.save(n);
    }

    private void audit(User actor, String action, String detail) {
        AuditLog log = new AuditLog();
        log.setActorUser(actor);
        log.setAction(action);
        log.setDetail(detail);
        auditLogRepository.save(log);
    }
}

