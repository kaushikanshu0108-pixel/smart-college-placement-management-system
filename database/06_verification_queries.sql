-- ============================================================================
-- Project: Smart College Placement Management System
-- Script: 06_verification_queries.sql
-- Purpose: Complete system diagnostic, table row counts, and schema health check
-- Target RDBMS: MySQL 8.0+ / MySQL Workbench
-- ============================================================================

USE smart_college_placement;

-- ----------------------------------------------------------------------------
-- Diagnostic 1: Table Names, Storage Engines, and Live Row Counts
-- ----------------------------------------------------------------------------
SELECT 
    TABLE_NAME AS table_name,
    ENGINE AS storage_engine,
    TABLE_ROWS AS approximate_rows,
    TABLE_COLLATION AS collation_name
FROM 
    information_schema.TABLES
WHERE 
    TABLE_SCHEMA = 'smart_college_placement'
ORDER BY 
    TABLE_NAME ASC;

-- ----------------------------------------------------------------------------
-- Diagnostic 2: Exact Live Row Count for Each Entity
-- ----------------------------------------------------------------------------
SELECT 'users' AS entity, COUNT(*) AS exact_row_count FROM users
UNION ALL
SELECT 'students', COUNT(*) FROM students
UNION ALL
SELECT 'companies', COUNT(*) FROM companies
UNION ALL
SELECT 'placement_drives', COUNT(*) FROM placement_drives
UNION ALL
SELECT 'applications', COUNT(*) FROM applications
UNION ALL
SELECT 'skills', COUNT(*) FROM skills
UNION ALL
SELECT 'student_skills', COUNT(*) FROM student_skills
UNION ALL
SELECT 'drive_required_skills', COUNT(*) FROM drive_required_skills
UNION ALL
SELECT 'interview_rounds', COUNT(*) FROM interview_rounds
UNION ALL
SELECT 'interview_results', COUNT(*) FROM interview_results
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications;

-- ----------------------------------------------------------------------------
-- Diagnostic 3: Active Foreign Keys Verification
-- ----------------------------------------------------------------------------
SELECT 
    CONSTRAINT_NAME AS foreign_key_name,
    TABLE_NAME AS child_table,
    COLUMN_NAME AS child_column,
    REFERENCED_TABLE_NAME AS parent_table,
    REFERENCED_COLUMN_NAME AS parent_column
FROM 
    information_schema.KEY_COLUMN_USAGE
WHERE 
    TABLE_SCHEMA = 'smart_college_placement' 
    AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY 
    TABLE_NAME, CONSTRAINT_NAME;

-- ----------------------------------------------------------------------------
-- Diagnostic 4: Active Indexes Verification
-- ----------------------------------------------------------------------------
SELECT 
    TABLE_NAME AS table_name,
    INDEX_NAME AS index_name,
    NON_UNIQUE AS is_non_unique,
    COLUMN_NAME AS column_name,
    SEQ_IN_INDEX AS sequence_in_index
FROM 
    information_schema.STATISTICS
WHERE 
    TABLE_SCHEMA = 'smart_college_placement'
ORDER BY 
    TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- ----------------------------------------------------------------------------
-- Diagnostic 5: Stored Procedures and Triggers Verification
-- ----------------------------------------------------------------------------
SELECT 
    ROUTINE_TYPE AS object_type,
    ROUTINE_NAME AS object_name,
    DEFINER AS definer,
    CREATED AS created_time
FROM 
    information_schema.ROUTINES
WHERE 
    ROUTINE_SCHEMA = 'smart_college_placement';

SELECT 
    TRIGGER_NAME AS trigger_name,
    EVENT_MANIPULATION AS event_type,
    EVENT_OBJECT_TABLE AS target_table,
    ACTION_TIMING AS timing
FROM 
    information_schema.TRIGGERS
WHERE 
    TRIGGER_SCHEMA = 'smart_college_placement';

-- ============================================================================
-- End of Script 06_verification_queries.sql
-- ============================================================================
