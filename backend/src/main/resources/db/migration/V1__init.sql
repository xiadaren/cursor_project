-- Core schema for Student Course Selection (SCS)

CREATE TABLE users (
                       id BIGINT PRIMARY KEY AUTO_INCREMENT,
                       role VARCHAR(16) NOT NULL,
                       email VARCHAR(128) NOT NULL,
                       password_hash VARCHAR(100) NOT NULL,
                       name VARCHAR(64) NOT NULL,
                       student_id VARCHAR(32) NULL,
                       teacher_id VARCHAR(32) NULL,
                       created_at DATETIME(6) NOT NULL,
                       CONSTRAINT uk_users_email UNIQUE (email),
                       CONSTRAINT uk_users_student_id UNIQUE (student_id),
                       CONSTRAINT uk_users_teacher_id UNIQUE (teacher_id)
);

CREATE TABLE student_profiles (
                                  user_id BIGINT PRIMARY KEY,
                                  grade VARCHAR(32) NULL,
                                  major VARCHAR(64) NULL,
                                  CONSTRAINT fk_student_profiles_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE teacher_profiles (
                                  user_id BIGINT PRIMARY KEY,
                                  title VARCHAR(32) NULL,
                                  department VARCHAR(64) NULL,
                                  CONSTRAINT fk_teacher_profiles_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE semesters (
                           id BIGINT PRIMARY KEY AUTO_INCREMENT,
                           name VARCHAR(32) NOT NULL,
                           start_date DATE NOT NULL,
                           end_date DATE NOT NULL,
                           is_active BIT(1) NOT NULL DEFAULT 0
);

CREATE TABLE enrollment_windows (
                                    id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                    semester_id BIGINT NOT NULL,
                                    start_at DATETIME(6) NOT NULL,
                                    end_at DATETIME(6) NOT NULL,
                                    CONSTRAINT fk_enrollment_windows_semester FOREIGN KEY (semester_id) REFERENCES semesters (id),
                                    INDEX idx_enrollment_windows_semester (semester_id)
);

CREATE TABLE courses (
                         id BIGINT PRIMARY KEY AUTO_INCREMENT,
                         name VARCHAR(128) NOT NULL,
                         teacher_id BIGINT NOT NULL,
                         credits INT NOT NULL,
                         capacity INT NOT NULL,
                         enrolled INT NOT NULL DEFAULT 0,
                         day_of_week INT NOT NULL,
                         start_period INT NOT NULL,
                         end_period INT NOT NULL,
                         location VARCHAR(64) NOT NULL,
                         schedule VARCHAR(64) NOT NULL,
                         description TINYTEXT NULL, -- 改 LONGTEXT 为 TINYTEXT
                         semester_id BIGINT NOT NULL,
                         version BIGINT NULL,
                         CONSTRAINT fk_courses_teacher FOREIGN KEY (teacher_id) REFERENCES users (id),
                         CONSTRAINT fk_courses_semester FOREIGN KEY (semester_id) REFERENCES semesters (id),
                         INDEX idx_courses_semester (semester_id),
                         INDEX idx_courses_teacher (teacher_id)
);

CREATE TABLE enrollments (
                             id BIGINT PRIMARY KEY AUTO_INCREMENT,
                             student_id BIGINT NOT NULL,
                             course_id BIGINT NOT NULL,
                             enroll_time DATETIME(6) NOT NULL,
                             status VARCHAR(16) NOT NULL,
                             CONSTRAINT fk_enrollments_student FOREIGN KEY (student_id) REFERENCES users (id),
                             CONSTRAINT fk_enrollments_course FOREIGN KEY (course_id) REFERENCES courses (id),
                             CONSTRAINT uk_enrollments_student_course UNIQUE (student_id, course_id),
                             INDEX idx_enrollments_student (student_id),
                             INDEX idx_enrollments_course (course_id)
);

CREATE TABLE notifications (
                               id BIGINT PRIMARY KEY AUTO_INCREMENT,
                               user_id BIGINT NOT NULL,
                               content TINYTEXT NOT NULL, -- 改 LONGTEXT 为 TINYTEXT（提前修复，避免后续报错）
                               is_read BIT(1) NOT NULL DEFAULT 0,
                               created_at DATETIME(6) NOT NULL,
                               CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id),
                               INDEX idx_notifications_user (user_id)
);

CREATE TABLE audit_logs (
                            id BIGINT PRIMARY KEY AUTO_INCREMENT,
                            actor_user_id BIGINT NULL,
                            action VARCHAR(64) NOT NULL,
                            detail TINYTEXT NULL, -- 改 LONGTEXT 为 TINYTEXT
                            created_at DATETIME(6) NOT NULL,
                            CONSTRAINT fk_audit_logs_actor FOREIGN KEY (actor_user_id) REFERENCES users (id),
                            INDEX idx_audit_logs_actor (actor_user_id),
                            INDEX idx_audit_logs_created (created_at)
);