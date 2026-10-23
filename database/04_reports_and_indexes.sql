-- ============================================================================
-- Project: Smart College Placement Management System
-- Script: 04_reports_and_indexes.sql
-- Purpose: Placement reporting queries, statistical aggregations & index tuning
-- Target RDBMS: MySQL 8.0+ / MySQL Workbench
-- ============================================================================

USE smart_college_placement;

-- ============================================================================
-- 1. INDEX OPTIMIZATION (Enhance query execution plans)
-- ============================================================================

-- Helper procedure to idempotently create indexes if they don't already exist
DROP PROCEDURE IF EXISTS sp_create_index_safe;
DELIMITER //
CREATE PROCEDURE sp_create_index_safe(
    IN p_table_name VARCHAR(64),
    IN p_index_name VARCHAR(64),
    IN p_columns    VARCHAR(255)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = p_table_name
          AND INDEX_NAME = p_index_name
    ) THEN
        SET @sql = CONCAT('CREATE INDEX ', p_index_name, ' ON ', p_table_name, ' (', p_columns, ')');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //
DELIMITER ;

-- Create composite index to speed up student eligibility filtering by CGPA and backlogs
CALL sp_create_index_safe('students', 'idx_students_cgpa_backlogs', 'cgpa DESC, active_backlogs ASC');

-- Create composite index for application searches by drive and status
CALL sp_create_index_safe('applications', 'idx_applications_drive_status', 'drive_id, application_status');

-- Create composite index for interview scheduling lookups
CALL sp_create_index_safe('interview_rounds', 'idx_interview_schedule_status', 'scheduled_at, round_status');

-- Clean up helper procedure
DROP PROCEDURE IF EXISTS sp_create_index_safe;


-- ============================================================================
-- 2. REPORTING QUERIES FOR PLACEMENT CELL & DASHBOARDS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Report 1: All Currently Open Placement Drives
-- Purpose: Displays active drives, hiring companies, package, and application deadline
-- ----------------------------------------------------------------------------
SELECT 
    d.drive_id,
    c.company_name,
    c.industry,
    d.drive_title,
    d.job_role,
    d.package_lpa,
    d.job_location,
    d.employment_type,
    d.minimum_cgpa,
    d.maximum_backlogs,
    d.application_deadline,
    DATEDIFF(d.application_deadline, NOW()) AS days_remaining
FROM 
    placement_drives d
JOIN 
    companies c ON d.company_id = c.company_id
WHERE 
    d.drive_status = 'open' 
    AND d.application_deadline >= NOW()
ORDER BY 
    d.application_deadline ASC;


-- ----------------------------------------------------------------------------
-- Report 2: Eligible Students for a Specific Placement Drive (e.g. Drive ID = 1)
-- Purpose: Matches students against drive CGPA, backlog thresholds & mandatory skills
-- ----------------------------------------------------------------------------
SELECT 
    s.student_id,
    u.full_name AS student_name,
    s.university_roll_no,
    s.branch,
    s.cgpa,
    s.active_backlogs,
    s.phone,
    u.email
FROM 
    students s
JOIN 
    users u ON s.user_id = u.user_id
CROSS JOIN 
    placement_drives d
WHERE 
    d.drive_id = 1
    AND s.cgpa >= d.minimum_cgpa
    AND s.active_backlogs <= d.maximum_backlogs
    AND u.account_status = 'active'
    -- Mandatory skills verification subquery:
    AND NOT EXISTS (
        SELECT 1 
        FROM drive_required_skills drs
        WHERE drs.drive_id = d.drive_id 
          AND drs.is_mandatory = 1
          AND drs.skill_id NOT IN (
              SELECT ss.skill_id 
              FROM student_skills ss 
              WHERE ss.student_id = s.student_id
          )
    )
ORDER BY 
    s.cgpa DESC;


-- ----------------------------------------------------------------------------
-- Report 3: Company-Wise Applicant and Offer Counts
-- Purpose: Shows total applicants, offers, and average package per recruiting company
-- ----------------------------------------------------------------------------
SELECT 
    c.company_id,
    c.company_name,
    c.industry,
    COUNT(DISTINCT d.drive_id) AS total_drives_conducted,
    COUNT(DISTINCT a.application_id) AS total_applications_received,
    COUNT(DISTINCT CASE WHEN a.application_status = 'selected' THEN a.application_id END) AS total_offers_released,
    COALESCE(ROUND(AVG(d.package_lpa), 2), 0.00) AS avg_package_offered_lpa
FROM 
    companies c
LEFT JOIN 
    placement_drives d ON c.company_id = d.company_id
LEFT JOIN 
    applications a ON d.drive_id = a.drive_id
GROUP BY 
    c.company_id, c.company_name, c.industry
ORDER BY 
    total_offers_released DESC, total_applications_received DESC;


-- ----------------------------------------------------------------------------
-- Report 4: Drive-Wise Pipeline Breakdown (Applied, Shortlisted, Selected, Rejected)
-- Purpose: Overview of candidate progression across all stages for each drive
-- ----------------------------------------------------------------------------
SELECT 
    d.drive_id,
    c.company_name,
    d.drive_title,
    d.package_lpa,
    COUNT(a.application_id) AS total_applicants,
    SUM(CASE WHEN a.application_status = 'applied' THEN 1 ELSE 0 END) AS status_applied,
    SUM(CASE WHEN a.application_status = 'shortlisted' THEN 1 ELSE 0 END) AS status_shortlisted,
    SUM(CASE WHEN a.application_status = 'in_progress' THEN 1 ELSE 0 END) AS status_in_progress,
    SUM(CASE WHEN a.application_status = 'selected' THEN 1 ELSE 0 END) AS status_selected,
    SUM(CASE WHEN a.application_status = 'rejected' THEN 1 ELSE 0 END) AS status_rejected
FROM 
    placement_drives d
JOIN 
    companies c ON d.company_id = c.company_id
LEFT JOIN 
    applications a ON d.drive_id = a.drive_id
GROUP BY 
    d.drive_id, c.company_name, d.drive_title, d.package_lpa
ORDER BY 
    d.drive_id ASC;


-- ----------------------------------------------------------------------------
-- Report 5: Detailed Student Application History (e.g. Student ID = 2)
-- Purpose: Lets a student view their complete application timeline and round outcomes
-- ----------------------------------------------------------------------------
SELECT 
    a.application_id,
    c.company_name,
    d.drive_title,
    d.package_lpa,
    a.application_date,
    a.application_status,
    ir.round_number,
    ir.round_name,
    ir.scheduled_at,
    ir.meeting_or_venue,
    res.result_status,
    res.feedback
FROM 
    applications a
JOIN 
    placement_drives d ON a.drive_id = d.drive_id
JOIN 
    companies c ON d.company_id = c.company_id
LEFT JOIN 
    interview_rounds ir ON a.application_id = ir.application_id
LEFT JOIN 
    interview_results res ON ir.round_id = res.round_id
WHERE 
    a.student_id = 2
ORDER BY 
    a.application_date DESC, ir.round_number ASC;


-- ----------------------------------------------------------------------------
-- Report 6: Branch-Wise Placement Statistics
-- Purpose: Evaluates placement performance, placement rate %, and maximum package by branch
-- ----------------------------------------------------------------------------
SELECT 
    s.branch,
    COUNT(DISTINCT s.student_id) AS total_registered_students,
    COUNT(DISTINCT CASE WHEN a.application_status = 'selected' THEN s.student_id END) AS placed_students,
    COUNT(DISTINCT s.student_id) - COUNT(DISTINCT CASE WHEN a.application_status = 'selected' THEN s.student_id END) AS unplaced_students,
    ROUND(
        (COUNT(DISTINCT CASE WHEN a.application_status = 'selected' THEN s.student_id END) * 100.0) / 
        COUNT(DISTINCT s.student_id), 
        1
    ) AS placement_percentage,
    COALESCE(MAX(CASE WHEN a.application_status = 'selected' THEN d.package_lpa END), 0.00) AS highest_package_lpa,
    COALESCE(ROUND(AVG(CASE WHEN a.application_status = 'selected' THEN d.package_lpa END), 2), 0.00) AS avg_package_lpa
FROM 
    students s
LEFT JOIN 
    applications a ON s.student_id = a.student_id
LEFT JOIN 
    placement_drives d ON a.drive_id = d.drive_id
GROUP BY 
    s.branch
ORDER BY 
    placement_percentage DESC, total_registered_students DESC;


-- ----------------------------------------------------------------------------
-- Report 7: Placed vs Not-Yet-Placed Student Roster
-- Purpose: University placement officer roster for tracking unplaced candidates
-- ----------------------------------------------------------------------------
SELECT 
    s.student_id,
    u.full_name AS student_name,
    s.university_roll_no,
    s.branch,
    s.cgpa,
    s.active_backlogs,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM applications a 
            WHERE a.student_id = s.student_id AND a.application_status = 'selected'
        ) THEN 'PLACED'
        ELSE 'NOT PLACED'
    END AS placement_status,
    (
        SELECT c.company_name 
        FROM applications a 
        JOIN placement_drives d ON a.drive_id = d.drive_id
        JOIN companies c ON d.company_id = c.company_id
        WHERE a.student_id = s.student_id AND a.application_status = 'selected'
        LIMIT 1
    ) AS placed_company,
    (
        SELECT d.package_lpa 
        FROM applications a 
        JOIN placement_drives d ON a.drive_id = d.drive_id
        WHERE a.student_id = s.student_id AND a.application_status = 'selected'
        LIMIT 1
    ) AS secured_package_lpa
FROM 
    students s
JOIN 
    users u ON s.user_id = u.user_id
ORDER BY 
    placement_status ASC, s.cgpa DESC;


-- ----------------------------------------------------------------------------
-- Report 8: Upcoming Interview Schedules with Candidate Details
-- Purpose: Master schedule for placement coordinators and panel interviewers
-- ----------------------------------------------------------------------------
SELECT 
    ir.round_id,
    c.company_name,
    d.drive_title,
    ir.round_number,
    ir.round_name,
    ir.scheduled_at,
    ir.interview_mode,
    ir.meeting_or_venue,
    u.full_name AS candidate_name,
    s.university_roll_no,
    s.phone,
    u.email
FROM 
    interview_rounds ir
JOIN 
    applications a ON ir.application_id = a.application_id
JOIN 
    students s ON a.student_id = s.student_id
JOIN 
    users u ON s.user_id = u.user_id
JOIN 
    placement_drives d ON a.drive_id = d.drive_id
JOIN 
    companies c ON d.company_id = c.company_id
WHERE 
    ir.round_status = 'scheduled'
ORDER BY 
    ir.scheduled_at ASC;


-- ----------------------------------------------------------------------------
-- Report 9: Students Missing Mandatory Skills for a Drive (Gap Analysis for Drive 1)
-- Purpose: Identifies students who satisfy CGPA but lack mandatory technical skills
-- ----------------------------------------------------------------------------
SELECT 
    s.student_id,
    u.full_name AS student_name,
    s.university_roll_no,
    s.branch,
    s.cgpa,
    sk.skill_name AS missing_mandatory_skill
FROM 
    students s
JOIN 
    users u ON s.user_id = u.user_id
CROSS JOIN 
    placement_drives d
JOIN 
    drive_required_skills drs ON d.drive_id = drs.drive_id AND drs.is_mandatory = 1
JOIN 
    skills sk ON drs.skill_id = sk.skill_id
WHERE 
    d.drive_id = 1
    AND s.cgpa >= d.minimum_cgpa
    AND s.active_backlogs <= d.maximum_backlogs
    AND drs.skill_id NOT IN (
        SELECT ss.skill_id 
        FROM student_skills ss 
        WHERE ss.student_id = s.student_id
    )
ORDER BY 
    s.student_id, sk.skill_name;


-- ============================================================================
-- 3. QUERY OPTIMIZATION DEMONSTRATION WITH EXPLAIN
-- ============================================================================

-- Query Plan Analysis for Drive Application Pipeline using idx_applications_drive_status
EXPLAIN 
SELECT 
    a.application_id,
    s.university_roll_no,
    u.full_name,
    a.application_status
FROM 
    applications a
JOIN 
    students s ON a.student_id = s.student_id
JOIN 
    users u ON s.user_id = u.user_id
WHERE 
    a.drive_id = 1 
    AND a.application_status = 'selected';

-- ============================================================================
-- End of Script 04_reports_and_indexes.sql
-- ============================================================================
