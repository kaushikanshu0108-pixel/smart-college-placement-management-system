-- ============================================================================
-- Project: Smart College Placement Management System
-- Script: 00_create_database.sql
-- Purpose: Safely create and initialize the database with UTF-8 support
-- Target RDBMS: MySQL 8.0+ / MySQL Workbench
-- ============================================================================

-- Step 1: Create the database with full UTF-8 encoding support (utf8mb4)
CREATE DATABASE IF NOT EXISTS smart_college_placement
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Step 2: Switch to the smart_college_placement database
USE smart_college_placement;

-- Step 3: Verification query to confirm character set and collation
SELECT 
    SCHEMA_NAME AS database_name,
    DEFAULT_CHARACTER_SET_NAME AS character_set,
    DEFAULT_COLLATION_NAME AS collation_name
FROM 
    information_schema.SCHEMATA
WHERE 
    SCHEMA_NAME = 'smart_college_placement';

-- ============================================================================
-- End of Script 00_create_database.sql
-- ============================================================================
