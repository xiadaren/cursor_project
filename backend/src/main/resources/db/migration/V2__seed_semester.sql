INSERT INTO semesters (name, start_date, end_date, is_active)
VALUES ('2025春季', '2025-02-17', '2025-07-06', b'1');

INSERT INTO enrollment_windows (semester_id, start_at, end_at)
VALUES (LAST_INSERT_ID(), '2025-02-01 00:00:00', '2025-03-31 23:59:59');

