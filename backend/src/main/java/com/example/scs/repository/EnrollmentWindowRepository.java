package com.example.scs.repository;

import com.example.scs.domain.EnrollmentWindow;
import com.example.scs.domain.Semester;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EnrollmentWindowRepository extends JpaRepository<EnrollmentWindow, Long> {
    Optional<EnrollmentWindow> findBySemester(Semester semester);
}

