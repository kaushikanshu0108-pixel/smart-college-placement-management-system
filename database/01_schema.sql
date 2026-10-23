-- ============================================================================
-- Project: Smart College Placement Management System
-- Script: 01_schema.sql
-- Purpose: Complete relational schema definition (DDL) for all 11 entities
-- Target RDBMS: MySQL 8.0+ / MySQL Workbench
-- Engine: InnoDB | Encoding: utf8mb4 | Normalization: 3NF
-- ============================================================================

USE smart_college_placement;

-- Temporarily disable foreign key checks for safe re-runs
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- Table 1: users
-- Core authentication and identity table for students, placement admins, etc.
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    user_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'student', 'recruiter') NOT NULL DEFAULT 'student',
    account_status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_users_email CHECK (email LIKE '%@%.%'),
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_status (account_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 2: students
-- Academic details, placement metrics, and profile data linked 1:1 to users
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS students;
CREATE TABLE students (
    student_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL UNIQUE,
    university_roll_no VARCHAR(30) NOT NULL UNIQUE,
    branch VARCHAR(50) NOT NULL,
    graduation_year YEAR NOT NULL,
    cgpa DECIMAL(3, 2) NOT NULL,
    active_backlogs INT UNSIGNED NOT NULL DEFAULT 0,
    phone VARCHAR(20) NULL,
    resume_url VARCHAR(255) NULL,
    profile_summary TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_students_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_students_cgpa 
        CHECK (cgpa >= 0.00 AND cgpa <= 10.00),
    CONSTRAINT chk_students_backlogs 
        CHECK (active_backlogs >= 0),
    INDEX idx_students_roll_no (university_roll_no),
    INDEX idx_students_branch (branch),
    INDEX idx_students_cgpa (cgpa),
    INDEX idx_students_backlogs (active_backlogs),
    INDEX idx_students_grad_year (graduation_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 3: companies
-- Registered recruiting organizations and their official contact points
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS companies;
CREATE TABLE companies (
    company_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL UNIQUE,
    industry VARCHAR(100) NOT NULL,
    website VARCHAR(200) NULL,
    contact_name VARCHAR(100) NOT NULL,
    contact_email VARCHAR(120) NOT NULL,
    contact_phone VARCHAR(20) NULL,
    company_status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_companies_email CHECK (contact_email LIKE '%@%.%'),
    INDEX idx_companies_name (company_name),
    INDEX idx_companies_status (company_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 4: placement_drives
-- Placement opportunities and eligibility criteria published by placement cell
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS placement_drives;
CREATE TABLE placement_drives (
    drive_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id INT UNSIGNED NOT NULL,
    drive_title VARCHAR(150) NOT NULL,
    job_role VARCHAR(100) NOT NULL,
    job_description TEXT NULL,
    job_location VARCHAR(100) NOT NULL,
    employment_type ENUM('Full-Time', 'Internship', 'Intern + PPO') NOT NULL DEFAULT 'Full-Time',
    package_lpa DECIMAL(5, 2) NOT NULL,
    minimum_cgpa DECIMAL(3, 2) NOT NULL DEFAULT 6.00,
    maximum_backlogs INT UNSIGNED NOT NULL DEFAULT 0,
    application_deadline DATETIME NOT NULL,
    drive_status ENUM('upcoming', 'open', 'closed', 'completed', 'cancelled') NOT NULL DEFAULT 'open',
    created_by INT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_drives_company
        FOREIGN KEY (company_id) REFERENCES companies(company_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_drives_creator
        FOREIGN KEY (created_by) REFERENCES users(user_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_drives_package 
        CHECK (package_lpa >= 0.00),
    CONSTRAINT chk_drives_min_cgpa 
        CHECK (minimum_cgpa >= 0.00 AND minimum_cgpa <= 10.00),
    CONSTRAINT chk_drives_max_backlogs 
        CHECK (maximum_backlogs >= 0),
    INDEX idx_drives_company (company_id),
    INDEX idx_drives_status (drive_status),
    INDEX idx_drives_deadline (application_deadline),
    INDEX idx_drives_criteria (minimum_cgpa, maximum_backlogs)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 5: applications
-- Job applications submitted by students for placement drives
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS applications;
CREATE TABLE applications (
    application_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id INT UNSIGNED NOT NULL,
    drive_id INT UNSIGNED NOT NULL,
    application_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    application_status ENUM('applied', 'shortlisted', 'in_progress', 'selected', 'rejected') NOT NULL DEFAULT 'applied',
    eligibility_checked TINYINT(1) NOT NULL DEFAULT 0,
    eligibility_notes TEXT NULL,
    admin_notes TEXT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_drive UNIQUE (student_id, drive_id),
    CONSTRAINT fk_applications_student
        FOREIGN KEY (student_id) REFERENCES students(student_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_applications_drive
        FOREIGN KEY (drive_id) REFERENCES placement_drives(drive_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_applications_student (student_id),
    INDEX idx_applications_drive (drive_id),
    INDEX idx_applications_status (application_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 6: skills
-- Master taxonomy/dictionary of standardized industry and programming skills
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS skills;
CREATE TABLE skills (
    skill_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(50) NOT NULL UNIQUE,
    INDEX idx_skills_name (skill_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 7: student_skills
-- Junction table mapping Students to Skills (Many-to-Many)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS student_skills;
CREATE TABLE student_skills (
    student_id INT UNSIGNED NOT NULL,
    skill_id INT UNSIGNED NOT NULL,
    proficiency ENUM('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'intermediate',
    PRIMARY KEY (student_id, skill_id),
    CONSTRAINT fk_studskills_student
        FOREIGN KEY (student_id) REFERENCES students(student_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_studskills_skill
        FOREIGN KEY (skill_id) REFERENCES skills(skill_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_studskills_skill (skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 8: drive_required_skills
-- Junction table mapping Placement Drives to Required Skills (Many-to-Many)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS drive_required_skills;
CREATE TABLE drive_required_skills (
    drive_id INT UNSIGNED NOT NULL,
    skill_id INT UNSIGNED NOT NULL,
    is_mandatory TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (drive_id, skill_id),
    CONSTRAINT fk_driveskills_drive
        FOREIGN KEY (drive_id) REFERENCES placement_drives(drive_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_driveskills_skill
        FOREIGN KEY (skill_id) REFERENCES skills(skill_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_driveskills_skill (skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 9: interview_rounds
-- Sequential interview stages arranged for a candidate's application
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS interview_rounds;
CREATE TABLE interview_rounds (
    round_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    application_id INT UNSIGNED NOT NULL,
    round_number INT UNSIGNED NOT NULL,
    round_name VARCHAR(100) NOT NULL,
    scheduled_at DATETIME NOT NULL,
    interview_mode ENUM('online', 'offline') NOT NULL DEFAULT 'offline',
    meeting_or_venue VARCHAR(255) NOT NULL,
    round_status ENUM('scheduled', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_app_round UNIQUE (application_id, round_number),
    CONSTRAINT fk_rounds_app
        FOREIGN KEY (application_id) REFERENCES applications(application_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_rounds_app (application_id),
    INDEX idx_rounds_schedule (scheduled_at),
    INDEX idx_rounds_status (round_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 10: interview_results
-- Evaluation verdicts and feedback recorded for each interview round
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS interview_results;
CREATE TABLE interview_results (
    result_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    round_id INT UNSIGNED NOT NULL UNIQUE,
    result_status ENUM('pending', 'passed', 'failed') NOT NULL DEFAULT 'pending',
    feedback TEXT NULL,
    evaluated_by INT UNSIGNED NULL,
    evaluated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_results_round
        FOREIGN KEY (round_id) REFERENCES interview_rounds(round_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_results_evaluator
        FOREIGN KEY (evaluated_by) REFERENCES users(user_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_results_round (round_id),
    INDEX idx_results_status (result_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 11: notifications
-- Targeted alert feed for users regarding drives, interviews, and updates
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
    notification_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    notification_type ENUM('drive_alert', 'application_status', 'interview_schedule', 'general') NOT NULL DEFAULT 'general',
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_notifications_user_read (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- End of Script 01_schema.sql
-- ============================================================================
