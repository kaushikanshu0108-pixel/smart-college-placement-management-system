-- ============================================================================
-- Project: Smart College Placement Management System
-- Script: 03_business_logic.sql
-- Purpose: Stored procedures, triggers, constraints & transaction management
-- Target RDBMS: MySQL 8.0+ / MySQL Workbench
-- ============================================================================

USE smart_college_placement;

-- ============================================================================
-- 1. STORED PROCEDURE: Check Student Eligibility
-- Evaluates CGPA, active backlogs, drive status, deadline, and mandatory skills
-- ============================================================================
DROP PROCEDURE IF EXISTS sp_check_student_eligibility;

DELIMITER //

CREATE PROCEDURE sp_check_student_eligibility(
    IN  p_student_id         INT UNSIGNED,
    IN  p_drive_id           INT UNSIGNED,
    OUT p_is_eligible        BOOLEAN,
    OUT p_eligibility_reason VARCHAR(255)
)
proc_label: BEGIN
    DECLARE v_student_exists INT DEFAULT 0;
    DECLARE v_drive_exists   INT DEFAULT 0;
    DECLARE v_cgpa           DECIMAL(3, 2);
    DECLARE v_backlogs       INT UNSIGNED;
    DECLARE v_min_cgpa       DECIMAL(3, 2);
    DECLARE v_max_backlogs   INT UNSIGNED;
    DECLARE v_deadline       DATETIME;
    DECLARE v_drive_status   VARCHAR(20);
    DECLARE v_missing_skills INT DEFAULT 0;

    -- Default values
    SET p_is_eligible = FALSE;
    SET p_eligibility_reason = '';

    -- Check if student exists
    SELECT COUNT(*), cgpa, active_backlogs
    INTO v_student_exists, v_cgpa, v_backlogs
    FROM students
    WHERE student_id = p_student_id
    GROUP BY student_id, cgpa, active_backlogs;

    IF v_student_exists = 0 THEN
        SET p_is_eligible = FALSE;
        SET p_eligibility_reason = 'Student record not found in system.';
        LEAVE proc_label;
    END IF;

    -- Check if drive exists
    SELECT COUNT(*), minimum_cgpa, maximum_backlogs, application_deadline, drive_status
    INTO v_drive_exists, v_min_cgpa, v_max_backlogs, v_deadline, v_drive_status
    FROM placement_drives
    WHERE drive_id = p_drive_id
    GROUP BY drive_id, minimum_cgpa, maximum_backlogs, application_deadline, drive_status;

    IF v_drive_exists = 0 THEN
        SET p_is_eligible = FALSE;
        SET p_eligibility_reason = 'Placement drive not found in system.';
        LEAVE proc_label;
    END IF;

    -- Rule 1: Drive must be in 'open' status
    IF v_drive_status != 'open' THEN
        SET p_is_eligible = FALSE;
        SET p_eligibility_reason = CONCAT('Drive is currently not open (status: ', v_drive_status, ').');
        LEAVE proc_label;
    END IF;

    -- Rule 2: Application deadline must not have passed
    IF NOW() > v_deadline THEN
        SET p_is_eligible = FALSE;
        SET p_eligibility_reason = CONCAT('Application deadline expired on ', DATE_FORMAT(v_deadline, '%d-%b-%Y %H:%i'));
        LEAVE proc_label;
    END IF;

    -- Rule 3: CGPA check
    IF v_cgpa < v_min_cgpa THEN
        SET p_is_eligible = FALSE;
        SET p_eligibility_reason = CONCAT('CGPA requirement not met (Student: ', v_cgpa, ', Required: >= ', v_min_cgpa, ').');
        LEAVE proc_label;
    END IF;

    -- Rule 4: Backlogs check
    IF v_backlogs > v_max_backlogs THEN
        SET p_is_eligible = FALSE;
        SET p_eligibility_reason = CONCAT('Active backlogs exceeded (Student: ', v_backlogs, ', Allowed: <= ', v_max_backlogs, ').');
        LEAVE proc_label;
    END IF;

    -- Rule 5: Mandatory skills verification
    SELECT COUNT(*)
    INTO v_missing_skills
    FROM drive_required_skills drs
    WHERE drs.drive_id = p_drive_id
      AND drs.is_mandatory = 1
      AND drs.skill_id NOT IN (
          SELECT ss.skill_id
          FROM student_skills ss
          WHERE ss.student_id = p_student_id
      );

    IF v_missing_skills > 0 THEN
        SET p_is_eligible = FALSE;
        SET p_eligibility_reason = CONCAT('Missing ', v_missing_skills, ' mandatory skill(s) required for this drive.');
        LEAVE proc_label;
    END IF;

    -- All criteria satisfied
    SET p_is_eligible = TRUE;
    SET p_eligibility_reason = 'Student meets all academic criteria, deadlines, and skill requirements.';

END proc_label //

DELIMITER ;

-- ============================================================================
-- 2. STORED PROCEDURE: Apply for Placement Drive
-- Validates eligibility, enforces constraints, logs application and notifies student
-- ============================================================================
DROP PROCEDURE IF EXISTS sp_apply_for_drive;

DELIMITER //

CREATE PROCEDURE sp_apply_for_drive(
    IN  p_student_id         INT UNSIGNED,
    IN  p_drive_id           INT UNSIGNED,
    OUT p_application_id     INT UNSIGNED,
    OUT p_status_message     VARCHAR(255)
)
proc_label: BEGIN
    DECLARE v_is_eligible    BOOLEAN DEFAULT FALSE;
    DECLARE v_reason         VARCHAR(255) DEFAULT '';
    DECLARE v_existing_id    INT UNSIGNED DEFAULT 0;
    DECLARE v_user_id        INT UNSIGNED;
    DECLARE v_drive_title    VARCHAR(150);

    -- Standard SQL exception handler with transaction rollback
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_application_id = 0;
        SET p_status_message = 'Error: Transaction failed. Database state has been rolled back.';
    END;

    -- Step A: Check eligibility
    CALL sp_check_student_eligibility(p_student_id, p_drive_id, v_is_eligible, v_reason);

    IF v_is_eligible = FALSE THEN
        SET p_application_id = 0;
        SET p_status_message = CONCAT('Application Rejected: ', v_reason);
        LEAVE proc_label;
    END IF;

    -- Step B: Prevent duplicate applications
    SELECT application_id INTO v_existing_id
    FROM applications
    WHERE student_id = p_student_id AND drive_id = p_drive_id
    LIMIT 1;

    IF v_existing_id > 0 THEN
        SET p_application_id = v_existing_id;
        SET p_status_message = 'Application Rejected: You have already applied for this placement drive.';
        LEAVE proc_label;
    END IF;

    -- Fetch user_id and drive_title for automated notification
    SELECT user_id INTO v_user_id FROM students WHERE student_id = p_student_id;
    SELECT drive_title INTO v_drive_title FROM placement_drives WHERE drive_id = p_drive_id;

    -- Step C: Atomic insertion within a database transaction
    START TRANSACTION;

        INSERT INTO applications (
            student_id,
            drive_id,
            application_date,
            application_status,
            eligibility_checked,
            eligibility_notes,
            admin_notes
        ) VALUES (
            p_student_id,
            p_drive_id,
            NOW(),
            'applied',
            1,
            v_reason,
            'Submitted via verified eligibility application portal'
        );

        SET p_application_id = LAST_INSERT_ID();

        -- Send automated notification to student
        INSERT INTO notifications (
            user_id,
            title,
            message,
            notification_type,
            is_read
        ) VALUES (
            v_user_id,
            CONCAT('Applied: ', v_drive_title),
            CONCAT('Your application for "', v_drive_title, '" has been successfully submitted and verified.'),
            'application_status',
            0
        );

    COMMIT;

    SET p_status_message = 'Success: Application submitted successfully.';

END proc_label //

DELIMITER ;

-- ============================================================================
-- 3. TRIGGERS: Business Rules & Data Integrity Enforcement
-- ============================================================================

-- Trigger 3.1: Enforce CGPA and non-negative backlogs on INSERT
DROP TRIGGER IF EXISTS trg_validate_student_insert;
DELIMITER //
CREATE TRIGGER trg_validate_student_insert
BEFORE INSERT ON students
FOR EACH ROW
BEGIN
    IF NEW.cgpa < 0.00 OR NEW.cgpa > 10.00 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: CGPA must be between 0.00 and 10.00.';
    END IF;
    IF NEW.active_backlogs < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Active backlogs count cannot be negative.';
    END IF;
END //
DELIMITER ;

-- Trigger 3.2: Enforce CGPA and non-negative backlogs on UPDATE
DROP TRIGGER IF EXISTS trg_validate_student_update;
DELIMITER //
CREATE TRIGGER trg_validate_student_update
BEFORE UPDATE ON students
FOR EACH ROW
BEGIN
    IF NEW.cgpa < 0.00 OR NEW.cgpa > 10.00 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: CGPA must be between 0.00 and 10.00.';
    END IF;
    IF NEW.active_backlogs < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Active backlogs count cannot be negative.';
    END IF;
END //
DELIMITER ;

-- Trigger 3.3: Automatically notify student when application status is updated
DROP TRIGGER IF EXISTS trg_notify_on_application_status_update;
DELIMITER //
CREATE TRIGGER trg_notify_on_application_status_update
AFTER UPDATE ON applications
FOR EACH ROW
BEGIN
    DECLARE v_user_id INT UNSIGNED;
    DECLARE v_drive_title VARCHAR(150);

    IF OLD.application_status != NEW.application_status THEN
        SELECT s.user_id, d.drive_title
        INTO v_user_id, v_drive_title
        FROM students s
        JOIN placement_drives d ON d.drive_id = NEW.drive_id
        WHERE s.student_id = NEW.student_id;

        INSERT INTO notifications (
            user_id,
            title,
            message,
            notification_type,
            is_read
        ) VALUES (
            v_user_id,
            CONCAT('Application Update: ', v_drive_title),
            CONCAT('Your application status has been updated from "', OLD.application_status, '" to "', NEW.application_status, '". Remarks: ', COALESCE(NEW.admin_notes, 'None')),
            'application_status',
            0
        );
    END IF;
END //
DELIMITER ;

-- ============================================================================
-- End of Script 03_business_logic.sql
-- ============================================================================
