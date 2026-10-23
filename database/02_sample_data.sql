-- ============================================================================
-- Project: Smart College Placement Management System
-- Script: 02_sample_data.sql
-- Purpose: Seed realistic sample data for demo, testing, and evaluation
-- Target RDBMS: MySQL 8.0+ / MySQL Workbench
-- Passwords:
--   Admin:   Admin@123   (Hash: $2b$10$Q.vdqS0qB2FUxIDPgHZ6QOZFm5TYxD8nvBSjy1sIJRdJX8CNTx2TS)
--   Student: Student@123 (Hash: $2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6)
-- ============================================================================

USE smart_college_placement;

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- 1. Insert Users (1 Admin + 10 Students)
-- ----------------------------------------------------------------------------
INSERT INTO users (user_id, full_name, email, password_hash, role, account_status) VALUES
-- Placement Officer (Admin)
(1, 'Dr. Rajesh Sharma', 'admin@college.edu', '$2b$10$Q.vdqS0qB2FUxIDPgHZ6QOZFm5TYxD8nvBSjy1sIJRdJX8CNTx2TS', 'admin', 'active'),

-- Students (10 student user accounts)
(2, 'Aarav Patel', 'aarav.patel@college.edu', '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(3, 'Diya Sharma', 'diya.sharma@college.edu', '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(4, 'Rohan Verma', 'rohan.verma@college.edu', '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(5, 'Ananya Iyer', 'ananya.iyer@college.edu', '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(6, 'Kabir Mehta', 'kabir.mehta@college.edu', '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(7, 'Sneha Kulkarni', 'sneha.kulkarni@college.edu', '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(8, 'Vikram Malhotra', 'vikram.malhotra@college.edu', '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(9, 'Neha Gupta', 'neha.gupta@college.edu', '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(10, 'Arjun Reddy', 'arjun.reddy@college.edu', '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(11, 'Priya Nair', 'priya.nair@college.edu', '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active')
ON DUPLICATE KEY UPDATE 
    full_name = VALUES(full_name),
    email = VALUES(email),
    password_hash = VALUES(password_hash),
    role = VALUES(role),
    account_status = VALUES(account_status);

-- ----------------------------------------------------------------------------
-- 2. Insert Student Profiles (Linked to User IDs 2 through 11)
-- ----------------------------------------------------------------------------
INSERT INTO students (student_id, user_id, university_roll_no, branch, graduation_year, cgpa, active_backlogs, phone, resume_url, profile_summary) VALUES
(1, 2, '21CSE001', 'Computer Science & Engineering', 2025, 9.42, 0, '+91-9876543210', 'https://storage.college.edu/resumes/21CSE001_Aarav.pdf', 'High-performing CSE undergraduate proficient in C++, Full-Stack JavaScript, and Algorithms.'),
(2, 3, '21CSE002', 'Computer Science & Engineering', 2025, 8.85, 0, '+91-9876543211', 'https://storage.college.edu/resumes/21CSE002_Diya.pdf', 'Aspiring software engineer with strong foundation in Java, Spring Boot, and Cloud Architecture.'),
(3, 4, '21IT001', 'Information Technology', 2025, 8.50, 0, '+91-9876543212', 'https://storage.college.edu/resumes/21IT001_Rohan.pdf', 'IT student passionate about web infrastructure, databases, and microservices.'),
(4, 5, '21AI001', 'Artificial Intelligence & Data Science', 2025, 8.10, 0, '+91-9876543213', 'https://storage.college.edu/resumes/21AI001_Ananya.pdf', 'AI/ML enthusiast experienced in Python, Data Engineering, and Predictive Analytics.'),
(5, 6, '21SE001', 'Software Engineering', 2025, 7.80, 0, '+91-9876543214', 'https://storage.college.edu/resumes/21SE001_Kabir.pdf', 'Keen interest in DevOps, CI/CD automation, and backend API design.'),
(6, 7, '21CSB001', 'Computer Science & Business Systems', 2025, 7.45, 0, '+91-9876543215', 'https://storage.college.edu/resumes/21CSB001_Sneha.pdf', 'Combining technological expertise with business analytics and requirements engineering.'),
(7, 8, '21CSE003', 'Computer Science & Engineering', 2025, 6.95, 1, '+91-9876543216', 'https://storage.college.edu/resumes/21CSE003_Vikram.pdf', 'Enthusiastic developer actively preparing for core product and technical services roles.'),
(8, 9, '21IT002', 'Information Technology', 2025, 6.50, 0, '+91-9876543217', 'https://storage.college.edu/resumes/21IT002_Neha.pdf', 'Frontend and UX enthusiast with solid command over HTML5, CSS3, JavaScript, and React.'),
(9, 10, '21CY001', 'Cyber Security & IoT', 2025, 7.20, 0, '+91-9876543218', 'https://storage.college.edu/resumes/21CY001_Arjun.pdf', 'Security researcher and network enthusiast with expertise in ethical hacking and networking.'),
(10, 11, '21CSE004', 'Computer Science & Engineering', 2025, 8.30, 2, '+91-9876543219', 'https://storage.college.edu/resumes/21CSE004_Priya.pdf', 'Strong algorithmic problem solver currently clearing active academic backlogs.')
ON DUPLICATE KEY UPDATE
    user_id = VALUES(user_id),
    university_roll_no = VALUES(university_roll_no),
    branch = VALUES(branch),
    graduation_year = VALUES(graduation_year),
    cgpa = VALUES(cgpa),
    active_backlogs = VALUES(active_backlogs),
    phone = VALUES(phone),
    resume_url = VALUES(resume_url),
    profile_summary = VALUES(profile_summary);

-- ----------------------------------------------------------------------------
-- 3. Insert Recruiting Companies (4 Diverse Organizations)
-- ----------------------------------------------------------------------------
INSERT INTO companies (company_id, company_name, industry, website, contact_name, contact_email, contact_phone, company_status) VALUES
(1, 'Microsoft India', 'Software Product & Cloud Services', 'https://www.microsoft.com', 'Anita Roy', 'anita.roy@microsoft.com', '+91-80-67891000', 'active'),
(2, 'Infosys Technologies', 'Information Technology & Consulting', 'https://www.infosys.com', 'Vikram Malhotra', 'vikram.m@infosys.com', '+91-80-28520261', 'active'),
(3, 'Cognizant Digital Solutions', 'Enterprise Software & IT Solutions', 'https://www.cognizant.com', 'Pooja Sengupta', 'pooja.s@cognizant.com', '+91-44-42096000', 'active'),
(4, 'Tata Consultancy Services (TCS)', 'Global IT & Consultancy', 'https://www.tcs.com', 'Suresh Nair', 'campus.relations@tcs.com', '+91-22-67789999', 'active')
ON DUPLICATE KEY UPDATE
    company_name = VALUES(company_name),
    industry = VALUES(industry),
    website = VALUES(website),
    contact_name = VALUES(contact_name),
    contact_email = VALUES(contact_email),
    contact_phone = VALUES(contact_phone),
    company_status = VALUES(company_status);

-- ----------------------------------------------------------------------------
-- 4. Insert Placement Drives (4 Drives with Varied Eligibility Criteria)
-- ----------------------------------------------------------------------------
INSERT INTO placement_drives (drive_id, company_id, drive_title, job_role, job_description, job_location, employment_type, package_lpa, minimum_cgpa, maximum_backlogs, application_deadline, drive_status, created_by) VALUES
(1, 1, 'Microsoft Campus Software Engineering Drive 2025', 'Software Development Engineer (SDE-1)', 'Design scalable cloud distributed services, write high-performance microservices, and collaborate in agile engineering teams.', 'Bengaluru / Hyderabad', 'Full-Time', 18.50, 8.00, 0, '2026-11-30 23:59:59', 'open', 1),
(2, 2, 'Infosys Specialist Programmer (SP) Recruitment', 'Specialist Programmer', 'High-end developer role focusing on complex algorithms, cloud architectures, and next-generation application development.', 'Bengaluru / Pune', 'Full-Time', 9.50, 7.00, 0, '2026-11-20 23:59:59', 'open', 1),
(3, 3, 'Cognizant GenC Elevate Placement Drive', 'Associate Software Engineer', 'Engage in enterprise modernization, cloud-native API development, and software lifecycle automation.', 'Chennai / Kolkata', 'Full-Time', 6.50, 6.50, 1, '2026-11-15 23:59:59', 'open', 1),
(4, 4, 'TCS National Qualifier Ninja Drive (Past)', 'Assistant System Engineer', 'Entry level engineering role for system analysis, maintenance, and enterprise application testing.', 'Pan India', 'Full-Time', 3.60, 6.00, 1, '2026-08-31 23:59:59', 'closed', 1)
ON DUPLICATE KEY UPDATE
    company_id = VALUES(company_id),
    drive_title = VALUES(drive_title),
    job_role = VALUES(job_role),
    job_description = VALUES(job_description),
    job_location = VALUES(job_location),
    employment_type = VALUES(employment_type),
    package_lpa = VALUES(package_lpa),
    minimum_cgpa = VALUES(minimum_cgpa),
    maximum_backlogs = VALUES(maximum_backlogs),
    application_deadline = VALUES(application_deadline),
    drive_status = VALUES(drive_status),
    created_by = VALUES(created_by);

-- ----------------------------------------------------------------------------
-- 5. Insert Skills (10 Standardized Industry Technical Skills)
-- ----------------------------------------------------------------------------
INSERT INTO skills (skill_id, skill_name) VALUES
(1, 'Python'),
(2, 'Java'),
(3, 'C++'),
(4, 'JavaScript'),
(5, 'Data Structures & Algorithms'),
(6, 'MySQL & Relational Databases'),
(7, 'Node.js & Express.js'),
(8, 'Cloud Computing (AWS / Azure)'),
(9, 'Machine Learning'),
(10, 'React.js & Frontend')
ON DUPLICATE KEY UPDATE skill_name = VALUES(skill_name);

-- ----------------------------------------------------------------------------
-- 6. Insert Student Skills (Mapping Students to Skills with Proficiency)
-- ----------------------------------------------------------------------------
INSERT INTO student_skills (student_id, skill_id, proficiency) VALUES
-- Student 1 (Aarav - High ranker)
(1, 3, 'advanced'),     -- C++
(1, 4, 'advanced'),     -- JavaScript
(1, 5, 'advanced'),     -- DSA
(1, 6, 'advanced'),     -- MySQL
(1, 7, 'intermediate'), -- Node.js
(1, 8, 'intermediate'), -- Cloud

-- Student 2 (Diya - Strong Java / Cloud)
(2, 2, 'advanced'),     -- Java
(2, 5, 'advanced'),     -- DSA
(2, 6, 'advanced'),     -- MySQL
(2, 8, 'intermediate'), -- Cloud

-- Student 3 (Rohan - IT backend)
(3, 4, 'advanced'),     -- JavaScript
(3, 6, 'advanced'),     -- MySQL
(3, 7, 'advanced'),     -- Node.js
(3, 5, 'intermediate'), -- DSA

-- Student 4 (Ananya - AI / ML)
(4, 1, 'advanced'),     -- Python
(4, 5, 'intermediate'), -- DSA
(4, 6, 'intermediate'), -- MySQL
(4, 9, 'advanced'),     -- Machine Learning

-- Student 5 (Kabir - Software Eng)
(5, 2, 'intermediate'), -- Java
(5, 6, 'intermediate'), -- MySQL
(5, 7, 'intermediate'), -- Node.js

-- Student 6 (Sneha - CSB)
(6, 1, 'intermediate'), -- Python
(6, 6, 'intermediate'), -- MySQL

-- Student 7 (Vikram - 1 Backlog)
(7, 2, 'intermediate'), -- Java
(7, 4, 'beginner'),     -- JavaScript
(7, 6, 'intermediate'), -- MySQL

-- Student 8 (Neha - Frontend)
(8, 4, 'advanced'),     -- JavaScript
(8, 10, 'advanced'),    -- React
(8, 6, 'beginner'),     -- MySQL

-- Student 9 (Arjun - Cyber)
(9, 1, 'intermediate'), -- Python
(9, 3, 'intermediate'), -- C++
(9, 6, 'intermediate'), -- MySQL

-- Student 10 (Priya - 2 Backlogs)
(10, 3, 'intermediate'),-- C++
(10, 5, 'advanced')     -- DSA
ON DUPLICATE KEY UPDATE proficiency = VALUES(proficiency);

-- ----------------------------------------------------------------------------
-- 7. Insert Drive Required Skills
-- ----------------------------------------------------------------------------
INSERT INTO drive_required_skills (drive_id, skill_id, is_mandatory) VALUES
-- Microsoft Drive (Drive 1): DSA & C++/Java mandatory, Cloud preferred
(1, 5, 1), -- Data Structures & Algorithms (Mandatory)
(1, 3, 1), -- C++ (Mandatory)
(1, 8, 0), -- Cloud Computing (Optional/Preferred)

-- Infosys SP Drive (Drive 2): Java & MySQL mandatory, DSA mandatory
(2, 2, 1), -- Java (Mandatory)
(2, 5, 1), -- DSA (Mandatory)
(2, 6, 1), -- MySQL (Mandatory)

-- Cognizant GenC Drive (Drive 3): Java or JavaScript preferred, MySQL mandatory
(3, 6, 1), -- MySQL (Mandatory)
(3, 4, 0), -- JavaScript (Preferred)

-- TCS Ninja Drive (Drive 4)
(4, 6, 1)  -- MySQL (Mandatory)
ON DUPLICATE KEY UPDATE is_mandatory = VALUES(is_mandatory);

-- ----------------------------------------------------------------------------
-- 8. Insert Applications (Realistic Distribution of Application Statuses)
-- ----------------------------------------------------------------------------
INSERT INTO applications (application_id, student_id, drive_id, application_date, application_status, eligibility_checked, eligibility_notes, admin_notes) VALUES
-- Microsoft Drive Applications
(1, 1, 1, '2026-10-01 10:15:00', 'selected', 1, 'Meets CGPA (9.42 >= 8.0), 0 backlogs, and possesses mandatory skills.', 'Candidate demonstrated exceptional coding and system design skills.'),
(2, 2, 1, '2026-10-01 11:30:00', 'in_progress', 1, 'Meets CGPA (8.85 >= 8.0), 0 backlogs.', 'Cleared online assessment and Tech Round 1.'),

-- Infosys Drive Applications
(3, 2, 2, '2026-10-02 09:00:00', 'shortlisted', 1, 'Meets CGPA (8.85 >= 7.0), 0 backlogs, Java and MySQL verified.', 'Shortlisted for technical interview.'),
(4, 3, 2, '2026-10-02 14:20:00', 'applied', 1, 'Meets CGPA (8.50 >= 7.0), 0 backlogs.', 'Awaiting batch review.'),
(5, 5, 2, '2026-10-03 16:45:00', 'rejected', 1, 'Eligible on CGPA but failed technical assessment threshold.', 'Low score in advanced coding round.'),

-- Cognizant Drive Applications
(6, 6, 3, '2026-10-04 11:00:00', 'selected', 1, 'Eligible (CGPA 7.45 >= 6.5, 0 backlogs).', 'Selected for Associate Software Engineer role.'),
(7, 7, 3, '2026-10-04 12:15:00', 'shortlisted', 1, 'Eligible (CGPA 6.95 >= 6.5, 1 backlog <= 1 max allowed).', 'Shortlisted for online aptitude round.'),
(8, 8, 3, '2026-10-05 10:00:00', 'applied', 1, 'Eligible (CGPA 6.50 >= 6.5, 0 backlogs).', 'Application verified.')
ON DUPLICATE KEY UPDATE
    student_id = VALUES(student_id),
    drive_id = VALUES(drive_id),
    application_date = VALUES(application_date),
    application_status = VALUES(application_status),
    eligibility_checked = VALUES(eligibility_checked),
    eligibility_notes = VALUES(eligibility_notes),
    admin_notes = VALUES(admin_notes);

-- ----------------------------------------------------------------------------
-- 9. Insert Interview Rounds
-- ----------------------------------------------------------------------------
INSERT INTO interview_rounds (round_id, application_id, round_number, round_name, scheduled_at, interview_mode, meeting_or_venue, round_status) VALUES
-- For Application 1 (Aarav - Microsoft - Selected)
(1, 1, 1, 'Online Coding Assessment', '2026-10-08 10:00:00', 'online', 'https://meet.microsoft.com/sde-coding-aarav', 'completed'),
(2, 1, 2, 'Technical Architecture & Problem Solving', '2026-10-12 14:00:00', 'online', 'https://meet.microsoft.com/sde-tech-aarav', 'completed'),
(3, 1, 3, 'Director & HR Fitment Round', '2026-10-15 16:30:00', 'online', 'https://meet.microsoft.com/sde-hr-aarav', 'completed'),

-- For Application 2 (Diya - Microsoft - In Progress)
(4, 2, 1, 'Online Coding Assessment', '2026-10-08 10:00:00', 'online', 'https://meet.microsoft.com/sde-coding-diya', 'completed'),
(5, 2, 2, 'Technical Architecture & Problem Solving', '2026-10-25 11:00:00', 'online', 'https://meet.microsoft.com/sde-tech-diya', 'scheduled'),

-- For Application 6 (Sneha - Cognizant - Selected)
(6, 6, 1, 'Online Aptitude & Logical Reasoning', '2026-10-10 10:00:00', 'online', 'https://cognizant.exam.net/gen-c-sneha', 'completed'),
(7, 6, 2, 'Technical & HR Discussion', '2026-10-14 15:00:00', 'offline', 'Placement Cell Seminar Hall 2', 'completed')
ON DUPLICATE KEY UPDATE
    application_id = VALUES(application_id),
    round_number = VALUES(round_number),
    round_name = VALUES(round_name),
    scheduled_at = VALUES(scheduled_at),
    interview_mode = VALUES(interview_mode),
    meeting_or_venue = VALUES(meeting_or_venue),
    round_status = VALUES(round_status);

-- ----------------------------------------------------------------------------
-- 10. Insert Interview Results
-- ----------------------------------------------------------------------------
INSERT INTO interview_results (result_id, round_id, result_status, feedback, evaluated_by) VALUES
-- Aarav results
(1, 1, 'passed', 'Scored 100% test cases in competitive programming challenges.', 1),
(2, 2, 'passed', 'Demonstrated exceptional understanding of low-latency concurrency and caching.', 1),
(3, 3, 'passed', 'Excellent cultural alignment, clarity of thought, and leadership potential. Recommended for hire.', 1),

-- Diya results
(4, 4, 'passed', 'Scored 92% in coding test. Demonstrated clean object-oriented design.', 1),

-- Sneha results
(5, 6, 'passed', 'High percentile in quantitative analysis and core CS fundamentals.', 1),
(6, 7, 'passed', 'Strong communication, positive mindset, and good grasp of relational databases.', 1)
ON DUPLICATE KEY UPDATE
    round_id = VALUES(round_id),
    result_status = VALUES(result_status),
    feedback = VALUES(feedback),
    evaluated_by = VALUES(evaluated_by);

-- ----------------------------------------------------------------------------
-- 11. Insert Notifications
-- ----------------------------------------------------------------------------
INSERT INTO notifications (notification_id, user_id, title, message, notification_type, is_read) VALUES
(1, 2, 'Congratulations! Placement Offer Extended', 'Congratulations Aarav! You have been selected as Software Development Engineer at Microsoft India with a CTC of 18.50 LPA.', 'application_status', 1),
(2, 3, 'Technical Interview Scheduled: Microsoft Drive', 'Your Technical Architecture round with Microsoft India is scheduled for 25th Oct at 11:00 AM online.', 'interview_schedule', 0),
(3, 4, 'Application Received: Infosys SP Drive', 'Your application for Infosys Specialist Programmer has been received and is currently under review.', 'application_status', 1),
(4, 7, 'Placement Offer Extended: Cognizant GenC', 'Congratulations Sneha! You have been selected as Associate Software Engineer at Cognizant with a package of 6.50 LPA.', 'application_status', 1),
(5, 1, 'System Digest: Placement Season In Full Swing', '3 drives are currently active. 2 offers released so far.', 'general', 0)
ON DUPLICATE KEY UPDATE
    user_id = VALUES(user_id),
    title = VALUES(title),
    message = VALUES(message),
    notification_type = VALUES(notification_type),
    is_read = VALUES(is_read);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- End of Script 02_sample_data.sql
-- ============================================================================
