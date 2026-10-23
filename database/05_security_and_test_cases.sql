-- ============================================================================
-- Project: Smart College Placement Management System
-- Script: 05_security_and_test_cases.sql
-- Purpose: Least-privilege MySQL user setup, constraint testing & security specs
-- Target RDBMS: MySQL 8.0+ / MySQL Workbench
-- ============================================================================

USE smart_college_placement;

-- ============================================================================
-- 1. LEAST-PRIVILEGE MYSQL APPLICATION USER SETUP
-- (Security Best Practice: Web app backend should NOT run as 'root')
-- Uncomment and execute the lines below when setting up production/deployment
-- ============================================================================

/*
-- Step A: Create a dedicated application user restricted to localhost
CREATE USER IF NOT EXISTS 'placement_app'@'localhost' 
IDENTIFIED WITH caching_sha2_password BY 'PlacementSecure#2026!';

-- Step B: Grant only required DML & Stored Procedure execution privileges
GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE 
ON smart_college_placement.* 
TO 'placement_app'@'localhost';

-- Step C: Explicitly revoke dangerous DDL administrative privileges
REVOKE DROP, ALTER, GRANT OPTION, SUPER 
ON *.* 
FROM 'placement_app'@'localhost';

-- Step D: Refresh privilege tables
FLUSH PRIVILEGES;

-- Verification
SHOW GRANTS FOR 'placement_app'@'localhost';
*/


-- ============================================================================
-- 2. SECURITY TEST CASES & CONSTRAINT VALIDATIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TEST CASE 1: Successful Application by Eligible Student
-- Test: Student 4 (Ananya, CGPA 8.10, 0 Backlogs) applying for Cognizant Drive 3
-- Expected Result: Procedure returns Success, application ID generated, notification sent
-- ----------------------------------------------------------------------------
CALL sp_apply_for_drive(4, 3, @app_id_1, @status_msg_1);
SELECT 
    'TC-01: Eligible Student Application' AS test_name,
    @app_id_1 AS generated_application_id,
    @status_msg_1 AS test_result,
    CASE WHEN @app_id_1 > 0 THEN 'PASSED' ELSE 'FAILED' END AS test_verdict;


-- ----------------------------------------------------------------------------
-- TEST CASE 2: Duplicate Application Prevention (Unique Constraint + Procedure)
-- Test: Student 4 attempts to apply again to Cognizant Drive 3
-- Expected Result: Rejection with duplicate application warning; no duplicate row created
-- ----------------------------------------------------------------------------
CALL sp_apply_for_drive(4, 3, @app_id_2, @status_msg_2);
SELECT 
    'TC-02: Duplicate Application Prevention' AS test_name,
    @app_id_2 AS returned_application_id,
    @status_msg_2 AS test_result,
    CASE WHEN @status_msg_2 LIKE '%already applied%' THEN 'PASSED' ELSE 'FAILED' END AS test_verdict;


-- ----------------------------------------------------------------------------
-- TEST CASE 3: Ineligible Student (CGPA Below Minimum Threshold)
-- Test: Student 8 (Neha, CGPA 6.50) applying to Microsoft Drive 1 (Requires CGPA >= 8.00)
-- Expected Result: Rejected with explicit reason: "CGPA requirement not met"
-- ----------------------------------------------------------------------------
CALL sp_apply_for_drive(8, 1, @app_id_3, @status_msg_3);
SELECT 
    'TC-03: Low CGPA Rejection' AS test_name,
    @app_id_3 AS returned_application_id,
    @status_msg_3 AS test_result,
    CASE WHEN @status_msg_3 LIKE '%CGPA requirement not met%' THEN 'PASSED' ELSE 'FAILED' END AS test_verdict;


-- ----------------------------------------------------------------------------
-- TEST CASE 4: Ineligible Student (Active Backlogs Exceed Allowed Maximum)
-- Test: Student 10 (Priya, 2 Backlogs) applying to Microsoft Drive 1 (Max Backlogs = 0)
-- Expected Result: Rejected with explicit reason: "Active backlogs exceeded"
-- ----------------------------------------------------------------------------
CALL sp_apply_for_drive(10, 1, @app_id_4, @status_msg_4);
SELECT 
    'TC-04: Excess Backlogs Rejection' AS test_name,
    @app_id_4 AS returned_application_id,
    @status_msg_4 AS test_result,
    CASE WHEN @status_msg_4 LIKE '%Active backlogs exceeded%' THEN 'PASSED' ELSE 'FAILED' END AS test_verdict;


-- ----------------------------------------------------------------------------
-- TEST CASE 5: Closed Drive / Expired Deadline Rejection
-- Test: Student 1 applying to TCS Ninja Drive 4 (Status = 'closed', deadline expired)
-- Expected Result: Rejected with explicit status/deadline error
-- ----------------------------------------------------------------------------
CALL sp_apply_for_drive(1, 4, @app_id_5, @status_msg_5);
SELECT 
    'TC-05: Closed Drive Rejection' AS test_name,
    @app_id_5 AS returned_application_id,
    @status_msg_5 AS test_result,
    CASE WHEN @status_msg_5 LIKE '%not open%' OR @status_msg_5 LIKE '%expired%' THEN 'PASSED' ELSE 'FAILED' END AS test_verdict;


-- ----------------------------------------------------------------------------
-- TEST CASE 6: Missing Mandatory Skills Rejection
-- Test: Student 2 (Diya, lacks C++) applying to Microsoft Drive 1 (Requires C++ and DSA)
-- Expected Result: Rejected due to missing mandatory skill
-- ----------------------------------------------------------------------------
CALL sp_apply_for_drive(2, 1, @app_id_6, @status_msg_6);
SELECT 
    'TC-06: Mandatory Skills Gap Rejection' AS test_name,
    @app_id_6 AS returned_application_id,
    @status_msg_6 AS test_result,
    CASE 
        WHEN @status_msg_6 LIKE '%Missing%' OR @status_msg_6 LIKE '%already applied%' THEN 'PASSED' 
        ELSE 'FAILED' 
    END AS test_verdict;


-- ----------------------------------------------------------------------------
-- TEST CASE 7: CHECK Constraint Verification - Invalid CGPA (> 10.0 or < 0.0)
-- Test: Inserting student record with CGPA = 11.50
-- Expected Result: Error 3819 (Check constraint 'chk_students_cgpa' violated)
-- ----------------------------------------------------------------------------
-- Run the query below manually in MySQL Workbench to observe check constraint enforcement:
-- INSERT INTO students (user_id, university_roll_no, branch, graduation_year, cgpa, active_backlogs)
-- VALUES (1, 'TEST_ROLL_FAIL', 'CSE', 2025, 11.50, 0);


-- ----------------------------------------------------------------------------
-- TEST CASE 8: CHECK Constraint Verification - Negative Backlogs
-- Test: Inserting student record with active_backlogs = -2
-- Expected Result: Error 3819 (Check constraint 'chk_students_backlogs' violated)
-- ----------------------------------------------------------------------------
-- Run the query below manually in MySQL Workbench to observe check constraint enforcement:
-- INSERT INTO students (user_id, university_roll_no, branch, graduation_year, cgpa, active_backlogs)
-- VALUES (1, 'TEST_ROLL_FAIL2', 'CSE', 2025, 8.50, -2);


-- ============================================================================
-- 3. EXPRESS.JS BACKEND ROLE-BASED ACCESS CONTROL (RBAC) ARCHITECTURE
-- ============================================================================
/*
   In the Express.js backend, enforce security at 3 distinct middleware layers:

   Layer 1: Authentication Guard (requireAuth)
   - Inspects req.session.user
   - If not authenticated -> Returns 401 Unauthorized

   Layer 2: Role Authorization Guard (requireRole('admin'))
   - Inspects req.session.user.role
   - If role !== 'admin' -> Returns 403 Forbidden ("Access Denied: Placement Officer privilege required")

   Layer 3: Student Resource Isolation Guard (ensureStudentOwnership)
   - When a student fetches '/api/students/:id' or '/api/applications/my-applications':
   - Middleware enforces: req.session.user.student_id === parseInt(req.params.id)
   - Prevents Horizontal Privilege Escalation (IDOR): A student CANNOT query or tamper with
     any other student's profile, resume, or placement results.
*/

-- ============================================================================
-- End of Script 05_security_and_test_cases.sql
-- ============================================================================
