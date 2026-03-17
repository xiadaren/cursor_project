package com.example.scs;

import com.example.scs.domain.*;
import com.example.scs.repository.*;
import com.example.scs.service.EnrollmentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class EnrollmentServiceTests {
    @Autowired EnrollmentService enrollmentService;
    @Autowired UserRepository userRepository;
    @Autowired SemesterRepository semesterRepository;
    @Autowired EnrollmentWindowRepository enrollmentWindowRepository;
    @Autowired CourseRepository courseRepository;
    @Autowired EnrollmentRepository enrollmentRepository;

    @Test
    void enroll_success_and_conflict_blocked() {
        Semester sem = new Semester();
        sem.setName("2025春季");
        sem.setStartDate(LocalDate.of(2025, 2, 1));
        sem.setEndDate(LocalDate.of(2025, 7, 1));
        sem.setActive(true);
        semesterRepository.save(sem);

        EnrollmentWindow w = new EnrollmentWindow();
        w.setSemester(sem);
        w.setStartAt(LocalDateTime.now().minusDays(1));
        w.setEndAt(LocalDateTime.now().plusDays(1));
        enrollmentWindowRepository.save(w);

        User teacher = new User();
        teacher.setRole(Role.TEACHER);
        teacher.setEmail("t1@example.com");
        teacher.setName("T1");
        teacher.setPasswordHash("x");
        userRepository.save(teacher);

        User student = new User();
        student.setRole(Role.STUDENT);
        student.setEmail("s1@example.com");
        student.setName("S1");
        student.setStudentId("20250001");
        student.setPasswordHash("x");
        userRepository.save(student);

        Course c1 = new Course();
        c1.setName("课程A");
        c1.setTeacher(teacher);
        c1.setCredits(2);
        c1.setCapacity(10);
        c1.setEnrolled(0);
        c1.setDayOfWeek(1);
        c1.setStartPeriod(3);
        c1.setEndPeriod(4);
        c1.setLocation("A101");
        c1.setSchedule("周一3-4节");
        c1.setSemester(sem);
        courseRepository.save(c1);

        Course c2 = new Course();
        c2.setName("课程B");
        c2.setTeacher(teacher);
        c2.setCredits(2);
        c2.setCapacity(10);
        c2.setEnrolled(0);
        c2.setDayOfWeek(1);
        c2.setStartPeriod(4);
        c2.setEndPeriod(5);
        c2.setLocation("B202");
        c2.setSchedule("周一4-5节");
        c2.setSemester(sem);
        courseRepository.save(c2);

        enrollmentService.enroll(student, c1.getId());
        assertEquals(1, enrollmentRepository.findByStudentAndStatus(student, EnrollmentStatus.ENROLLED).size());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> enrollmentService.enroll(student, c2.getId()));
        assertTrue(ex.getMessage().contains("冲突"));
    }
}

