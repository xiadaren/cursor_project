package com.example.scs.repository;

import com.example.scs.domain.Course;
import com.example.scs.domain.Enrollment;
import com.example.scs.domain.EnrollmentStatus;
import com.example.scs.domain.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    Optional<Enrollment> findByStudentAndCourse(User student, Course course);

    @EntityGraph(attributePaths = {"course", "course.teacher", "course.semester"})
    List<Enrollment> findByStudentAndStatus(User student, EnrollmentStatus status);

    @EntityGraph(attributePaths = {"student"})
    List<Enrollment> findByCourseAndStatus(Course course, EnrollmentStatus status);
    long countByCourseAndStatus(Course course, EnrollmentStatus status);
}

