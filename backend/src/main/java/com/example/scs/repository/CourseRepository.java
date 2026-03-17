package com.example.scs.repository;

import com.example.scs.domain.Course;
import com.example.scs.domain.Semester;
import com.example.scs.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {
    @EntityGraph(attributePaths = {"teacher", "semester"})
    Page<Course> findBySemesterAndNameContainingIgnoreCase(Semester semester, String keyword, Pageable pageable);

    @EntityGraph(attributePaths = {"teacher", "semester"})
    Page<Course> findByTeacher(User teacher, Pageable pageable);

    @EntityGraph(attributePaths = {"teacher", "semester"})
    Page<Course> findBySemester(Semester semester, Pageable pageable);

    @EntityGraph(attributePaths = {"teacher", "semester"})
    java.util.Optional<Course> findWithTeacherById(Long id);
    long countBySemester(Semester semester);
}

