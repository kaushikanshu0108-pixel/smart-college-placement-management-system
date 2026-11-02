-- ============================================================================
-- Project: Smart College Placement Management System
-- Script: 02_sample_data.sql
-- Purpose: LARGE Seed Data — 50 Students, 20 Companies, 15 Drives, rich applications
-- Target RDBMS: MySQL 8.0+ / MySQL Workbench
-- Passwords:
--   Admin:   Admin@123456  (Hash: $2b$10$Q.vdqS0qB2FUxIDPgHZ6QOZFm5TYxD8nvBSjy1sIJRdJX8CNTx2TS)
--   Student: Student@123   (Hash: $2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6)
-- ============================================================================

USE smart_college_placement;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- 1. INSERT USERS: 1 Admin + 50 Students
-- ============================================================================
INSERT INTO users (user_id, full_name, email, password_hash, role, account_status) VALUES
-- Admin
(1, 'Dr. Rajesh Sharma',       'admin@college.edu',              '$2b$10$Q.vdqS0qB2FUxIDPgHZ6QOZFm5TYxD8nvBSjy1sIJRdJX8CNTx2TS', 'admin',   'active'),
-- Students (IDs 2-51)
(2,  'Aarav Patel',            'aarav.patel@college.edu',        '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(3,  'Diya Sharma',            'diya.sharma@college.edu',        '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(4,  'Rohan Verma',            'rohan.verma@college.edu',        '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(5,  'Ananya Iyer',            'ananya.iyer@college.edu',        '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(6,  'Kabir Mehta',            'kabir.mehta@college.edu',        '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(7,  'Sneha Kulkarni',         'sneha.kulkarni@college.edu',     '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(8,  'Vikram Malhotra',        'vikram.malhotra@college.edu',    '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(9,  'Neha Gupta',             'neha.gupta@college.edu',         '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(10, 'Arjun Reddy',            'arjun.reddy@college.edu',        '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(11, 'Priya Nair',             'priya.nair@college.edu',         '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(12, 'Rahul Singh',            'rahul.singh@college.edu',        '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(13, 'Pooja Mishra',           'pooja.mishra@college.edu',       '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(14, 'Amit Kumar',             'amit.kumar@college.edu',         '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(15, 'Kavya Pillai',           'kavya.pillai@college.edu',       '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(16, 'Saurabh Tiwari',         'saurabh.tiwari@college.edu',     '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(17, 'Meera Bhat',             'meera.bhat@college.edu',         '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(18, 'Dev Agarwal',            'dev.agarwal@college.edu',        '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(19, 'Ishaan Chopra',          'ishaan.chopra@college.edu',      '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(20, 'Tanvi Joshi',            'tanvi.joshi@college.edu',        '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(21, 'Shivam Yadav',           'shivam.yadav@college.edu',       '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(22, 'Ritika Das',             'ritika.das@college.edu',         '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(23, 'Kunal Bansal',           'kunal.bansal@college.edu',       '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(24, 'Ayesha Khan',            'ayesha.khan@college.edu',        '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(25, 'Nikhil Rao',             'nikhil.rao@college.edu',         '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(26, 'Akshita Garg',           'akshita.garg@college.edu',       '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(27, 'Lakshay Batra',          'lakshay.batra@college.edu',      '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(28, 'Sanya Menon',            'sanya.menon@college.edu',        '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(29, 'Harsh Dubey',            'harsh.dubey@college.edu',        '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(30, 'Riya Mathur',            'riya.mathur@college.edu',        '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(31, 'Karan Saxena',           'karan.saxena@college.edu',       '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(32, 'Zara Siddiqui',          'zara.siddiqui@college.edu',      '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(33, 'Pranav Hegde',           'pranav.hegde@college.edu',       '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(34, 'Aishwarya Pillai',       'aishwarya.pillai@college.edu',   '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(35, 'Siddhant Jain',          'siddhant.jain@college.edu',      '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(36, 'Palak Arora',            'palak.arora@college.edu',        '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(37, 'Vedant Bhatt',           'vedant.bhatt@college.edu',       '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(38, 'Simran Kaur',            'simran.kaur@college.edu',        '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(39, 'Anirudh Chandra',        'anirudh.chandra@college.edu',    '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(40, 'Divya Sharma',           'divya.sharma@college.edu',       '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(41, 'Naman Gupta',            'naman.gupta@college.edu',        '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(42, 'Trisha Iyer',            'trisha.iyer@college.edu',        '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(43, 'Yash Srivastava',        'yash.srivastava@college.edu',    '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(44, 'Kritika Sharma',         'kritika.sharma@college.edu',     '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(45, 'Manav Tripathi',         'manav.tripathi@college.edu',     '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(46, 'Navya Reddy',            'navya.reddy@college.edu',        '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(47, 'Ankit Nair',             'ankit.nair@college.edu',         '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(48, 'Shruthi Balan',          'shruthi.balan@college.edu',      '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(49, 'Harshit Rawat',          'harshit.rawat@college.edu',      '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(50, 'Roshni Fernandez',       'roshni.fernandez@college.edu',   '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active'),
(51, 'Arnav Chaudhary',        'arnav.chaudhary@college.edu',    '$2b$10$KOmiCZT3fhLJ9kbBSiDjWOpregforfacCmlAGHhs4CsUA042xs.z6', 'student', 'active')
ON DUPLICATE KEY UPDATE
    full_name = VALUES(full_name), email = VALUES(email),
    password_hash = VALUES(password_hash), role = VALUES(role), account_status = VALUES(account_status);

-- ============================================================================
-- 2. INSERT STUDENTS PROFILES (50 students, IDs 1-50)
-- ============================================================================
INSERT INTO students (student_id, user_id, university_roll_no, branch, graduation_year, cgpa, active_backlogs, phone, resume_url, profile_summary) VALUES
(1,  2,  '21CSE001', 'Computer Science & Engineering',       2025, 9.42, 0, '+91-9876543210', 'https://drive.google.com/resume/aarav',      'High-performing CSE undergraduate; expert in C++, Full-Stack JavaScript, and distributed systems.'),
(2,  3,  '21CSE002', 'Computer Science & Engineering',       2025, 8.85, 0, '+91-9876543211', 'https://drive.google.com/resume/diya',       'Aspiring software engineer with strong Java, Spring Boot, and Cloud Architecture skills.'),
(3,  4,  '21IT001',  'Information Technology',               2025, 8.50, 0, '+91-9876543212', 'https://drive.google.com/resume/rohan',      'IT student passionate about web infrastructure, databases, and microservices.'),
(4,  5,  '21AI001',  'Artificial Intelligence & Data Science',2025, 8.10, 0, '+91-9876543213', 'https://drive.google.com/resume/ananya',    'AI/ML enthusiast experienced in Python, Data Engineering, and Predictive Analytics.'),
(5,  6,  '21SE001',  'Software Engineering',                 2025, 7.80, 0, '+91-9876543214', 'https://drive.google.com/resume/kabir',      'Keen interest in DevOps, CI/CD automation, and backend API design.'),
(6,  7,  '21CSB001', 'Computer Science & Business Systems',  2025, 7.45, 0, '+91-9876543215', 'https://drive.google.com/resume/sneha',      'Combining tech expertise with business analytics and requirements engineering.'),
(7,  8,  '21CSE003', 'Computer Science & Engineering',       2025, 6.95, 1, '+91-9876543216', 'https://drive.google.com/resume/vikram',     'Developer preparing for core product and technical services roles.'),
(8,  9,  '21IT002',  'Information Technology',               2025, 6.50, 0, '+91-9876543217', 'https://drive.google.com/resume/neha',       'Frontend and UX enthusiast with expertise in HTML5, CSS3, JavaScript, and React.'),
(9,  10, '21CY001',  'Cyber Security & IoT',                 2025, 7.20, 0, '+91-9876543218', 'https://drive.google.com/resume/arjun',      'Security researcher with expertise in ethical hacking and network security.'),
(10, 11, '21CSE004', 'Computer Science & Engineering',       2025, 8.30, 2, '+91-9876543219', 'https://drive.google.com/resume/priya',      'Strong algorithmic problem solver clearing academic backlogs.'),
(11, 12, '21CSE005', 'Computer Science & Engineering',       2025, 9.10, 0, '+91-9876543220', 'https://drive.google.com/resume/rahul',      'Top-ranked CSE student specializing in competitive programming and distributed systems.'),
(12, 13, '21IT003',  'Information Technology',               2025, 8.65, 0, '+91-9876543221', 'https://drive.google.com/resume/pooja',      'Database architect and full-stack developer with expertise in PostgreSQL and Node.js.'),
(13, 14, '21AI002',  'Artificial Intelligence & Data Science',2025, 8.90, 0, '+91-9876543222', 'https://drive.google.com/resume/amit',      'Data scientist with published research in NLP and computer vision; Python & TensorFlow expert.'),
(14, 15, '21CSE006', 'Computer Science & Engineering',       2025, 9.25, 0, '+91-9876543223', 'https://drive.google.com/resume/kavya',      'System design enthusiast and competitive programmer; internship at Amazon.'),
(15, 16, '21SE002',  'Software Engineering',                 2025, 7.55, 0, '+91-9876543224', 'https://drive.google.com/resume/saurabh',    'Agile practitioner with expertise in software testing, quality assurance, and automation.'),
(16, 17, '21ECE001', 'Electronics & Communication',          2025, 8.20, 0, '+91-9876543225', 'https://drive.google.com/resume/meera',      'VLSI design and embedded systems enthusiast; FPGA and RISC-V expert.'),
(17, 18, '21CSE007', 'Computer Science & Engineering',       2025, 7.70, 0, '+91-9876543226', 'https://drive.google.com/resume/dev',        'Backend engineer with Node.js, Go, and Kubernetes expertise; open-source contributor.'),
(18, 19, '21AI003',  'Artificial Intelligence & Data Science',2025, 8.45, 0, '+91-9876543227', 'https://drive.google.com/resume/ishaan',    'ML researcher with expertise in reinforcement learning and generative AI models.'),
(19, 20, '21CSB002', 'Computer Science & Business Systems',  2025, 7.90, 0, '+91-9876543228', 'https://drive.google.com/resume/tanvi',      'Business analyst bridging IT and management; strong in ERP and enterprise architecture.'),
(20, 21, '21IT004',  'Information Technology',               2025, 6.80, 1, '+91-9876543229', 'https://drive.google.com/resume/shivam',     'Network and cybersecurity enthusiast with CEH certification.'),
(21, 22, '21CSE008', 'Computer Science & Engineering',       2025, 9.55, 0, '+91-9876543230', 'https://drive.google.com/resume/ritika',     'Campus rank 2; expert in competitive programming (Codeforces Expert), OS, and compilers.'),
(22, 23, '21CSE009', 'Computer Science & Engineering',       2025, 8.00, 0, '+91-9876543231', 'https://drive.google.com/resume/kunal',      'Full-stack MERN developer with 3 production projects and freelance experience.'),
(23, 24, '21IT005',  'Information Technology',               2025, 7.40, 0, '+91-9876543232', 'https://drive.google.com/resume/ayesha',     'Cloud DevOps engineer experienced in AWS, Docker, Terraform, and Jenkins pipelines.'),
(24, 25, '21SE003',  'Software Engineering',                 2025, 8.10, 0, '+91-9876543233', 'https://drive.google.com/resume/nikhil',     'Mobile app developer with 5+ published apps on Play Store; Flutter and React Native expert.'),
(25, 26, '21CY002',  'Cyber Security & IoT',                 2025, 7.65, 0, '+91-9876543234', 'https://drive.google.com/resume/akshita',    'Penetration tester and bug bounty hunter; expertise in reverse engineering and exploit development.'),
(26, 27, '21CSE010', 'Computer Science & Engineering',       2025, 8.75, 0, '+91-9876543235', 'https://drive.google.com/resume/lakshay',    'Blockchain developer with smart contract and DApp experience; Ethereum & Solana.'),
(27, 28, '21AI004',  'Artificial Intelligence & Data Science',2025, 8.35, 0, '+91-9876543236', 'https://drive.google.com/resume/sanya',     'Computer vision researcher; YOLO, OpenCV, and medical image segmentation expert.'),
(28, 29, '21CSE011', 'Computer Science & Engineering',       2025, 6.70, 2, '+91-9876543237', 'https://drive.google.com/resume/harsh',      'Game developer with Unity3D expertise; working on clearing academic backlogs.'),
(29, 30, '21IT006',  'Information Technology',               2025, 7.85, 0, '+91-9876543238', 'https://drive.google.com/resume/riya',       'Full-stack developer specializing in React, TypeScript, and microservices architecture.'),
(30, 31, '21CSE012', 'Computer Science & Engineering',       2025, 9.00, 0, '+91-9876543239', 'https://drive.google.com/resume/karan',      'Performance optimization expert and SDE intern at Flipkart; algorithms and system design guru.'),
(31, 32, '21SE004',  'Software Engineering',                 2025, 7.25, 0, '+91-9876543240', 'https://drive.google.com/resume/zara',       'UX/UI designer with full-stack capability; Figma, React, and design systems expertise.'),
(32, 33, '21CSE013', 'Computer Science & Engineering',       2025, 8.60, 0, '+91-9876543241', 'https://drive.google.com/resume/pranav',     'Database engineer and backend architect; PostgreSQL, Redis, and distributed caching expert.'),
(33, 34, '21AI005',  'Artificial Intelligence & Data Science',2025, 9.15, 0, '+91-9876543242', 'https://drive.google.com/resume/aishwarya', 'NLP researcher; built production-grade conversational AI for healthcare startup.'),
(34, 35, '21CSE014', 'Computer Science & Engineering',       2025, 7.50, 1, '+91-9876543243', 'https://drive.google.com/resume/siddhant',  'DevSecOps practitioner with focus on container security and infrastructure as code.'),
(35, 36, '21IT007',  'Information Technology',               2025, 8.05, 0, '+91-9876543244', 'https://drive.google.com/resume/palak',      'Data engineer specializing in ETL pipelines, Apache Spark, and data lake architecture.'),
(36, 37, '21CSE015', 'Computer Science & Engineering',       2025, 7.15, 0, '+91-9876543245', 'https://drive.google.com/resume/vedant',     'Compiler design enthusiast and systems programmer; Rust and WebAssembly developer.'),
(37, 38, '21ECE002', 'Electronics & Communication',          2025, 8.40, 0, '+91-9876543246', 'https://drive.google.com/resume/simran',     'IoT systems developer with expertise in embedded Linux, MQTT, and sensor fusion.'),
(38, 39, '21CSE016', 'Computer Science & Engineering',       2025, 8.95, 0, '+91-9876543247', 'https://drive.google.com/resume/anirudh',    'Site reliability engineer (SRE) with cloud-native and Kubernetes orchestration expertise.'),
(39, 40, '21AI006',  'Artificial Intelligence & Data Science',2025, 7.60, 0, '+91-9876543248', 'https://drive.google.com/resume/divya',      'Time series forecasting specialist; energy analytics and stock prediction models.'),
(40, 41, '21CSE017', 'Computer Science & Engineering',       2025, 6.90, 1, '+91-9876543249', 'https://drive.google.com/resume/naman',      'Cybersecurity enthusiast transitioning to software development; Python and Django focus.'),
(41, 42, '21IT008',  'Information Technology',               2025, 8.70, 0, '+91-9876543250', 'https://drive.google.com/resume/trisha',     'Product-focused full stack developer; experience in B2B SaaS startup as frontend lead.'),
(42, 43, '21CSE018', 'Computer Science & Engineering',       2025, 7.35, 0, '+91-9876543251', 'https://drive.google.com/resume/yash',       'AR/VR developer with Unity, WebXR, and spatial computing projects.'),
(43, 44, '21AI007',  'Artificial Intelligence & Data Science',2025, 8.80, 0, '+91-9876543252', 'https://drive.google.com/resume/kritika',   'Robotics and autonomous systems researcher; ROS2 and SLAM expert.'),
(44, 45, '21CSE019', 'Computer Science & Engineering',       2025, 9.30, 0, '+91-9876543253', 'https://drive.google.com/resume/manav',      'High-frequency trading algorithm developer; quantitative analysis and financial modeling.'),
(45, 46, '21SE005',  'Software Engineering',                 2025, 7.10, 0, '+91-9876543254', 'https://drive.google.com/resume/navya',      'Product manager at heart with engineering depth; Agile scrum and roadmap planning.'),
(46, 47, '21CSE020', 'Computer Science & Engineering',       2025, 8.15, 0, '+91-9876543255', 'https://drive.google.com/resume/ankit',      'Distributed systems and consensus protocols researcher; etcd and Raft implementation.'),
(47, 48, '21IT009',  'Information Technology',               2025, 7.45, 0, '+91-9876543256', 'https://drive.google.com/resume/shruthi',    'ML Ops engineer with focus on model deployment, monitoring, and CI/CD for AI pipelines.'),
(48, 49, '21CSE021', 'Computer Science & Engineering',       2025, 6.60, 2, '+91-9876543257', 'https://drive.google.com/resume/harshit',    'Android developer with 2 apps on Play Store; working on academic improvement.'),
(49, 50, '21CY003',  'Cyber Security & IoT',                 2025, 7.95, 0, '+91-9876543258', 'https://drive.google.com/resume/roshni',     'Digital forensics expert and malware analyst with CTF competition experience.'),
(50, 51, '21CSE022', 'Computer Science & Engineering',       2025, 8.55, 0, '+91-9876543259', 'https://drive.google.com/resume/arnav',      'Fintech developer with expertise in payment gateways, OAuth, and API security.')
ON DUPLICATE KEY UPDATE
    user_id = VALUES(user_id), university_roll_no = VALUES(university_roll_no), branch = VALUES(branch),
    graduation_year = VALUES(graduation_year), cgpa = VALUES(cgpa), active_backlogs = VALUES(active_backlogs),
    phone = VALUES(phone), resume_url = VALUES(resume_url), profile_summary = VALUES(profile_summary);

-- ============================================================================
-- 3. INSERT COMPANIES (20 diverse recruiting organizations)
-- ============================================================================
INSERT INTO companies (company_id, company_name, industry, website, contact_name, contact_email, contact_phone, company_status) VALUES
(1,  'Microsoft India',              'Software Product & Cloud Services',        'https://www.microsoft.com',    'Anita Roy',           'campus.hr@microsoft.com',         '+91-80-67891000', 'active'),
(2,  'Infosys Technologies',         'Information Technology & Consulting',       'https://www.infosys.com',      'Vikram Nair',         'campus@infosys.com',               '+91-80-28520261', 'active'),
(3,  'Cognizant Digital Solutions',  'Enterprise Software & IT Services',         'https://www.cognizant.com',    'Pooja Sengupta',      'genc@cognizant.com',               '+91-44-42096000', 'active'),
(4,  'Tata Consultancy Services',    'Global IT & Business Consulting',           'https://www.tcs.com',          'Suresh Nair',         'campus.relations@tcs.com',         '+91-22-67789999', 'active'),
(5,  'Google India',                 'AI, Search & Advertising Technology',       'https://www.google.com',       'Priya Krishnan',      'university-relations@google.com',  '+91-80-42080000', 'active'),
(6,  'Amazon India',                 'E-Commerce & Cloud Infrastructure',         'https://www.amazon.in',        'Rajeev Menon',        'campus-recruiting@amazon.com',     '+91-80-67894000', 'active'),
(7,  'Wipro Technologies',           'IT Consulting & System Integration',        'https://www.wipro.com',        'Lakshmi Rao',         'hr.campus@wipro.com',              '+91-80-28440011', 'active'),
(8,  'HCL Technologies',             'Engineering R&D & IT Services',             'https://www.hcltech.com',      'Manish Kumar',        'campus@hcl.com',                   '+91-120-6125000', 'active'),
(9,  'Accenture India',              'Digital Transformation & Consulting',       'https://www.accenture.com',    'Shruti Joshi',        'india.recruitment@accenture.com',  '+91-80-49441000', 'active'),
(10, 'Flipkart',                     'E-Commerce & Fintech',                      'https://www.flipkart.com',     'Divya Shenoy',        'campus@flipkart.com',              '+91-80-42150000', 'active'),
(11, 'Zomato',                       'FoodTech & Hyper-local Delivery',           'https://www.zomato.com',       'Ankur Jain',          'talent@zomato.com',                '+91-124-4902847', 'active'),
(12, 'PhonePe',                      'Financial Technology & Digital Payments',   'https://www.phonepe.com',      'Rekha Pillai',        'campus.hire@phonepe.com',          '+91-80-61400000', 'active'),
(13, 'Paytm',                        'Fintech & Digital Commerce Platform',       'https://www.paytm.com',        'Rishabh Gupta',       'hr@paytm.com',                     '+91-120-4770770', 'active'),
(14, 'Swiggy',                       'FoodTech & Logistics Technology',           'https://www.swiggy.com',       'Aakash Mehta',        'campus@swiggy.in',                 '+91-80-61002222', 'active'),
(15, 'NVIDIA India',                 'GPU Computing & AI Hardware',               'https://www.nvidia.com',       'Sreedhar Rao',        'india.recruiting@nvidia.com',      '+91-80-45645100', 'active'),
(16, 'Oracle India',                 'Enterprise Cloud & Database Systems',       'https://www.oracle.com',       'Sunita Reddy',        'campus@oracle.com',                '+91-80-67920000', 'active'),
(17, 'Samsung R&D India',            'Consumer Electronics & AI Research',        'https://www.samsung.com/in',   'Jinwook Park',        'srd.campus@samsung.com',           '+91-80-40219000', 'active'),
(18, 'Ola Electric',                 'EV Technology & Smart Mobility',            'https://www.olaelectric.com',  'Bhavish Patel',       'talent@olaelectric.com',           '+91-80-68777777', 'active'),
(19, 'Byju''s',                      'EdTech & AI-driven Learning',               'https://byjus.com',            'Divya Das',           'campus@byjus.com',                 '+91-80-47478000', 'active'),
(20, 'HDFC Bank IT Division',        'Banking Technology & Fintech',              'https://www.hdfcbank.com',     'Kamlesh Pant',        'itrecruitment@hdfcbank.com',       '+91-22-66521000', 'active')
ON DUPLICATE KEY UPDATE
    company_name = VALUES(company_name), industry = VALUES(industry), website = VALUES(website),
    contact_name = VALUES(contact_name), contact_email = VALUES(contact_email),
    contact_phone = VALUES(contact_phone), company_status = VALUES(company_status);

-- ============================================================================
-- 4. INSERT PLACEMENT DRIVES (15 drives with varied criteria)
-- ============================================================================
INSERT INTO placement_drives (drive_id, company_id, drive_title, job_role, job_description, job_location, employment_type, package_lpa, minimum_cgpa, maximum_backlogs, application_deadline, drive_status, created_by) VALUES
(1,  1,  'Microsoft Campus SDE Drive 2025',               'Software Development Engineer (SDE-1)',         'Design scalable cloud services, microservices, and collaborate in agile engineering teams at Azure.',                  'Bengaluru / Hyderabad',   'Full-Time',  45.00, 8.00, 0, '2026-12-15 23:59:59', 'open',      1),
(2,  5,  'Google STEP Internship 2025',                    'Software Engineering Intern (STEP)',             'Work on large-scale distributed systems, search algorithms, and AI-powered products at Google core teams.',          'Bengaluru / Hyderabad',   'Internship', 12.00, 8.50, 0, '2026-12-01 23:59:59', 'open',      1),
(3,  6,  'Amazon SDE Campus Recruitment 2025',             'Software Development Engineer',                  'Build world-class shopping experiences, logistics algorithms, and AWS cloud infrastructure services.',              'Bengaluru / Chennai',     'Full-Time',  26.00, 7.50, 0, '2026-11-30 23:59:59', 'open',      1),
(4,  10, 'Flipkart Big Billion SDE Drive',                 'SDE-1 (Backend/Platform)',                       'Work on India''s largest e-commerce platform; big data, recommendation engines, and payment systems.',            'Bengaluru',               'Full-Time',  18.00, 7.00, 0, '2026-11-25 23:59:59', 'open',      1),
(5,  15, 'NVIDIA GPU Computing Engineer Hiring',           'GPU Software Engineer',                          'Develop CUDA kernels, GPU drivers, and AI inference optimization for next-gen hardware.',                          'Pune / Bengaluru',        'Full-Time',  38.00, 8.00, 0, '2026-12-10 23:59:59', 'open',      1),
(6,  12, 'PhonePe Fintech Developer Drive 2025',           'Software Engineer (Payments Platform)',           'Build real-time payment rails, UPI gateway, and financial data analytics infrastructure.',                        'Bengaluru',               'Full-Time',  22.00, 7.50, 0, '2026-11-28 23:59:59', 'open',      1),
(7,  2,  'Infosys Specialist Programmer (SP) 2025',        'Specialist Programmer',                          'High-end developer role focusing on complex algorithms, cloud architectures, and application modernization.',       'Bengaluru / Pune',        'Full-Time',   9.50, 7.00, 0, '2026-12-20 23:59:59', 'open',      1),
(8,  3,  'Cognizant GenC Elevate Drive 2025',              'Associate Software Engineer',                    'Enterprise modernization, cloud-native API development, and software lifecycle automation.',                       'Chennai / Kolkata',       'Full-Time',   6.50, 6.50, 1, '2026-12-18 23:59:59', 'open',      1),
(9,  7,  'Wipro Elite NLTH Recruitment',                   'Project Engineer',                               'Work on enterprise IT solutions, digital transformation initiatives, and client-facing agile projects.',            'Hyderabad / Mumbai',      'Full-Time',   6.00, 6.00, 1, '2026-12-22 23:59:59', 'open',      1),
(10, 4,  'TCS National Qualifier Ninja 2025',              'Assistant System Engineer',                      'Entry level engineering for system analysis, maintenance, and enterprise application testing.',                    'Pan India',               'Full-Time',   3.60, 6.00, 1, '2026-08-31 23:59:59', 'closed',    1),
(11, 11, 'Zomato SDE Summer Internship 2025',              'Software Engineer Intern (Backend)',              'Build food delivery logistics, routing algorithms, and real-time tracking systems.',                               'Gurugram / Bengaluru',    'Intern + PPO',10.00, 7.50, 0, '2026-11-20 23:59:59', 'open',      1),
(12, 14, 'Swiggy Instamart Tech Drive',                    'SDE-1 (Hyperlocal Logistics)',                   'Optimize last-mile delivery, dark store inventory management, and demand forecasting systems.',                    'Bengaluru',               'Full-Time',  15.00, 7.00, 0, '2026-11-22 23:59:59', 'open',      1),
(13, 17, 'Samsung R&D AI Research Engineer',               'Research Engineer (AI/ML)',                      'Work on advanced AI algorithms for Samsung SmartTV, mobile devices, and Exynos chip neural engines.',              'Bengaluru / Noida',       'Full-Time',  20.00, 8.00, 0, '2026-12-05 23:59:59', 'open',      1),
(14, 20, 'HDFC Bank Technology Trainee Drive',             'Technology Trainee (IT Division)',               'Digital banking platform development, core banking integration, and cybersecurity compliance.',                    'Mumbai / Pune',           'Full-Time',   8.50, 6.50, 1, '2026-12-08 23:59:59', 'open',      1),
(15, 9,  'Accenture ASE & SE Hiring 2025',                 'Associate Software Engineer',                    'Deliver cutting-edge digital transformation projects across cloud, AI, and enterprise clients globally.',           'Bengaluru / Hyderabad / Pune', 'Full-Time',4.50, 6.00, 2, '2026-12-30 23:59:59', 'open',      1)
ON DUPLICATE KEY UPDATE
    company_id = VALUES(company_id), drive_title = VALUES(drive_title), job_role = VALUES(job_role),
    job_description = VALUES(job_description), job_location = VALUES(job_location),
    employment_type = VALUES(employment_type), package_lpa = VALUES(package_lpa),
    minimum_cgpa = VALUES(minimum_cgpa), maximum_backlogs = VALUES(maximum_backlogs),
    application_deadline = VALUES(application_deadline), drive_status = VALUES(drive_status), created_by = VALUES(created_by);

-- ============================================================================
-- 5. INSERT SKILLS (20 standardized technical skills)
-- ============================================================================
INSERT INTO skills (skill_id, skill_name) VALUES
(1,  'Python'),
(2,  'Java'),
(3,  'C++'),
(4,  'JavaScript'),
(5,  'Data Structures & Algorithms'),
(6,  'MySQL & Relational Databases'),
(7,  'Node.js & Express.js'),
(8,  'Cloud Computing (AWS / Azure)'),
(9,  'Machine Learning'),
(10, 'React.js & Frontend'),
(11, 'Go (Golang)'),
(12, 'Docker & Kubernetes'),
(13, 'Computer Networks & Security'),
(14, 'TypeScript'),
(15, 'Spring Boot & Java EE'),
(16, 'Data Engineering & Apache Spark'),
(17, 'Embedded C & RTOS'),
(18, 'TensorFlow & PyTorch'),
(19, 'System Design & Architecture'),
(20, 'Android / iOS Development')
ON DUPLICATE KEY UPDATE skill_name = VALUES(skill_name);

-- ============================================================================
-- 6. INSERT STUDENT SKILLS (comprehensive mapping)
-- ============================================================================
INSERT INTO student_skills (student_id, skill_id, proficiency) VALUES
-- Aarav Patel (ID 1) - CSE top performer
(1,3,'advanced'),(1,4,'advanced'),(1,5,'advanced'),(1,6,'advanced'),(1,7,'intermediate'),(1,8,'intermediate'),(1,19,'intermediate'),
-- Diya Sharma (ID 2)
(2,2,'advanced'),(2,5,'advanced'),(2,6,'advanced'),(2,8,'intermediate'),(2,15,'advanced'),
-- Rohan Verma (ID 3)
(3,4,'advanced'),(3,6,'advanced'),(3,7,'advanced'),(3,5,'intermediate'),(3,12,'beginner'),
-- Ananya Iyer (ID 4)
(4,1,'advanced'),(4,5,'intermediate'),(4,6,'intermediate'),(4,9,'advanced'),(4,18,'advanced'),
-- Kabir Mehta (ID 5)
(5,2,'intermediate'),(5,6,'intermediate'),(5,7,'intermediate'),(5,12,'intermediate'),
-- Sneha Kulkarni (ID 6)
(6,1,'intermediate'),(6,6,'intermediate'),(6,10,'beginner'),
-- Vikram Malhotra (ID 7)
(7,2,'intermediate'),(7,4,'beginner'),(7,6,'intermediate'),
-- Neha Gupta (ID 8)
(8,4,'advanced'),(8,10,'advanced'),(8,6,'beginner'),(8,14,'intermediate'),
-- Arjun Reddy (ID 9)
(9,1,'intermediate'),(9,3,'intermediate'),(9,6,'intermediate'),(9,13,'advanced'),
-- Priya Nair (ID 10)
(10,3,'intermediate'),(10,5,'advanced'),(10,2,'beginner'),
-- Rahul Singh (ID 11)
(11,3,'advanced'),(11,5,'advanced'),(11,4,'advanced'),(11,19,'advanced'),(11,8,'intermediate'),
-- Pooja Mishra (ID 12)
(12,6,'advanced'),(12,7,'advanced'),(12,4,'advanced'),(12,1,'intermediate'),
-- Amit Kumar (ID 13)
(13,1,'advanced'),(13,9,'advanced'),(13,18,'advanced'),(13,5,'advanced'),(13,16,'intermediate'),
-- Kavya Pillai (ID 14)
(14,3,'advanced'),(14,5,'advanced'),(14,4,'advanced'),(14,8,'advanced'),(14,19,'advanced'),
-- Saurabh Tiwari (ID 15)
(15,2,'intermediate'),(15,4,'intermediate'),(15,6,'intermediate'),(15,12,'beginner'),
-- Meera Bhat (ID 16)
(16,3,'advanced'),(16,17,'advanced'),(16,6,'beginner'),
-- Dev Agarwal (ID 17)
(17,7,'advanced'),(17,11,'advanced'),(17,12,'advanced'),(17,4,'intermediate'),
-- Ishaan Chopra (ID 18)
(18,1,'advanced'),(18,9,'advanced'),(18,18,'advanced'),(18,5,'advanced'),
-- Tanvi Joshi (ID 19)
(19,6,'advanced'),(19,2,'intermediate'),(19,4,'beginner'),
-- Shivam Yadav (ID 20)
(20,13,'advanced'),(20,1,'intermediate'),(20,6,'intermediate'),
-- Ritika Das (ID 21)
(21,3,'advanced'),(21,5,'advanced'),(21,4,'advanced'),(21,6,'advanced'),(21,19,'advanced'),(21,8,'advanced'),
-- Kunal Bansal (ID 22)
(22,4,'advanced'),(22,7,'advanced'),(22,10,'advanced'),(22,14,'advanced'),
-- Ayesha Khan (ID 23)
(23,8,'advanced'),(23,12,'advanced'),(23,11,'intermediate'),(23,1,'intermediate'),
-- Nikhil Rao (ID 24)
(24,4,'advanced'),(24,20,'advanced'),(24,14,'intermediate'),
-- Akshita Garg (ID 25)
(25,13,'advanced'),(25,1,'intermediate'),(25,3,'intermediate'),
-- Lakshay Batra (ID 26)
(26,4,'advanced'),(26,7,'advanced'),(26,5,'advanced'),(26,8,'intermediate'),
-- Sanya Menon (ID 27)
(27,1,'advanced'),(27,9,'advanced'),(27,18,'advanced'),
-- Harsh Dubey (ID 28)
(28,4,'beginner'),(28,6,'beginner'),(28,3,'intermediate'),
-- Riya Mathur (ID 29)
(29,4,'advanced'),(29,10,'advanced'),(29,14,'advanced'),(29,7,'intermediate'),
-- Karan Saxena (ID 30)
(30,5,'advanced'),(30,3,'advanced'),(30,4,'advanced'),(30,19,'advanced'),(30,6,'advanced'),
-- Zara Siddiqui (ID 31)
(31,4,'advanced'),(31,10,'advanced'),(31,14,'advanced'),
-- Pranav Hegde (ID 32)
(32,6,'advanced'),(32,1,'advanced'),(32,7,'intermediate'),
-- Aishwarya Pillai (ID 33)
(33,1,'advanced'),(33,9,'advanced'),(33,18,'advanced'),(33,5,'advanced'),(33,19,'advanced'),
-- Siddhant Jain (ID 34)
(34,12,'advanced'),(34,8,'advanced'),(34,11,'intermediate'),
-- Palak Arora (ID 35)
(35,1,'advanced'),(35,16,'advanced'),(35,6,'advanced'),
-- Vedant Bhatt (ID 36)
(36,3,'advanced'),(36,5,'advanced'),(36,4,'intermediate'),
-- Simran Kaur (ID 37)
(37,17,'advanced'),(37,3,'advanced'),(37,13,'intermediate'),
-- Anirudh Chandra (ID 38)
(38,12,'advanced'),(38,8,'advanced'),(38,11,'advanced'),(38,19,'intermediate'),
-- Divya Sharma (ID 39)
(39,1,'advanced'),(39,9,'advanced'),(39,6,'intermediate'),
-- Naman Gupta (ID 40)
(40,1,'intermediate'),(40,13,'intermediate'),(40,6,'beginner'),
-- Trisha Iyer (ID 41)
(41,4,'advanced'),(41,10,'advanced'),(41,7,'advanced'),(41,14,'advanced'),
-- Yash Srivastava (ID 42)
(42,4,'advanced'),(42,14,'intermediate'),(42,10,'advanced'),
-- Kritika Sharma (ID 43)
(43,1,'advanced'),(43,9,'advanced'),(43,18,'advanced'),(43,17,'intermediate'),
-- Manav Tripathi (ID 44)
(44,3,'advanced'),(44,5,'advanced'),(44,4,'advanced'),(44,19,'advanced'),(44,6,'advanced'),
-- Navya Reddy (ID 45)
(45,4,'intermediate'),(45,6,'intermediate'),(45,2,'beginner'),
-- Ankit Nair (ID 46)
(46,3,'advanced'),(46,5,'advanced'),(46,19,'advanced'),(46,8,'intermediate'),
-- Shruthi Balan (ID 47)
(47,1,'advanced'),(47,9,'intermediate'),(47,12,'advanced'),
-- Harshit Rawat (ID 48)
(48,20,'advanced'),(48,4,'intermediate'),(48,6,'beginner'),
-- Roshni Fernandez (ID 49)
(49,13,'advanced'),(49,1,'advanced'),(49,3,'intermediate'),
-- Arnav Chaudhary (ID 50)
(50,4,'advanced'),(50,7,'advanced'),(50,13,'advanced'),(50,8,'intermediate')
ON DUPLICATE KEY UPDATE proficiency = VALUES(proficiency);

-- ============================================================================
-- 7. INSERT DRIVE REQUIRED SKILLS
-- ============================================================================
INSERT INTO drive_required_skills (drive_id, skill_id, is_mandatory) VALUES
-- Drive 1: Microsoft SDE (DSA + C++ mandatory, Cloud & System Design preferred)
(1,5,1),(1,3,1),(1,8,0),(1,19,1),
-- Drive 2: Google STEP Intern (DSA + C++/Python mandatory)
(2,5,1),(2,3,0),(2,1,0),(2,19,1),
-- Drive 3: Amazon SDE (DSA + Java/Python mandatory, Cloud preferred)
(3,5,1),(3,2,0),(3,1,0),(3,8,0),(3,19,1),
-- Drive 4: Flipkart SDE-1 (Java/Python mandatory, MySQL mandatory, DSA mandatory)
(4,5,1),(4,2,0),(4,6,1),(4,8,0),
-- Drive 5: NVIDIA GPU Engineer (C++ mandatory, DSA mandatory)
(5,3,1),(5,5,1),(5,19,0),
-- Drive 6: PhonePe Fintech (Java/Python mandatory, MySQL mandatory, Cloud preferred)
(6,6,1),(6,2,0),(6,5,1),(6,8,0),
-- Drive 7: Infosys SP (Java mandatory, DSA mandatory, MySQL mandatory)
(7,2,1),(7,5,1),(7,6,1),
-- Drive 8: Cognizant GenC (MySQL mandatory, JavaScript preferred)
(8,6,1),(8,4,0),
-- Drive 9: Wipro NLTH (Java or Python mandatory, MySQL mandatory)
(9,6,1),(9,2,0),(9,1,0),
-- Drive 10: TCS Ninja (MySQL mandatory)
(10,6,1),
-- Drive 11: Zomato Intern (Python/Java mandatory, MySQL preferred, DSA mandatory)
(11,5,1),(11,1,0),(11,6,0),
-- Drive 12: Swiggy Instamart (Python mandatory, DSA mandatory, Cloud preferred)
(12,1,1),(12,5,1),(12,8,0),
-- Drive 13: Samsung R&D AI (ML + Python mandatory, TensorFlow mandatory)
(13,1,1),(13,9,1),(13,18,1),
-- Drive 14: HDFC Bank IT (Java or Python mandatory, MySQL mandatory)
(14,6,1),(14,2,0),(14,1,0),
-- Drive 15: Accenture ASE (Any programming skill mandatory)
(15,6,0),(15,4,0),(15,1,0),(15,2,0)
ON DUPLICATE KEY UPDATE is_mandatory = VALUES(is_mandatory);

-- ============================================================================
-- 8. INSERT APPLICATIONS (rich distribution of 60+ applications)
-- ============================================================================
INSERT INTO applications (application_id, student_id, drive_id, application_date, application_status, eligibility_checked, eligibility_notes, admin_notes) VALUES
-- Drive 1: Microsoft SDE (package: 45 LPA, min CGPA 8.0)
(1,  1,  1, '2026-10-01 10:15:00', 'selected',    1, 'CGPA 9.42 >= 8.0, 0 backlogs, DSA+C++ verified.', 'Exceptional coding and system design. Highest performer in batch.'),
(2,  2,  1, '2026-10-01 11:30:00', 'in_progress', 1, 'CGPA 8.85 >= 8.0, 0 backlogs.', 'Cleared OA and Tech Round 1. Awaiting final round.'),
(3,  11, 1, '2026-10-02 09:00:00', 'shortlisted', 1, 'CGPA 9.10 >= 8.0, 0 backlogs.', 'Shortlisted for technical interview round.'),
(4,  14, 1, '2026-10-02 10:30:00', 'shortlisted', 1, 'CGPA 9.25 >= 8.0, 0 backlogs.', 'Strong competitive programming background.'),
(5,  21, 1, '2026-10-03 09:15:00', 'applied',     1, 'CGPA 9.55 >= 8.0, 0 backlogs.', 'Application under review.'),
(6,  30, 1, '2026-10-03 14:00:00', 'applied',     1, 'CGPA 9.00 >= 8.0, 0 backlogs.', 'Application under review.'),
(7,  44, 1, '2026-10-04 11:00:00', 'applied',     1, 'CGPA 9.30 >= 8.0, 0 backlogs.', 'Application under review.'),

-- Drive 2: Google STEP Intern (min CGPA 8.5)
(8,  1,  2, '2026-10-05 10:00:00', 'shortlisted', 1, 'CGPA 9.42 >= 8.5, 0 backlogs.', 'Shortlisted for Google STEP coding round.'),
(9,  14, 2, '2026-10-05 11:00:00', 'selected',    1, 'CGPA 9.25 >= 8.5, 0 backlogs.', 'Selected for Google STEP. Offer letter issued.'),
(10, 21, 2, '2026-10-06 09:30:00', 'in_progress', 1, 'CGPA 9.55 >= 8.5, 0 backlogs.', 'Advanced to interview stage.'),
(11, 33, 2, '2026-10-06 14:00:00', 'applied',     1, 'CGPA 9.15 >= 8.5, 0 backlogs.', 'Application under review.'),

-- Drive 3: Amazon SDE (min CGPA 7.5)
(12, 2,  3, '2026-10-07 09:00:00', 'selected',    1, 'CGPA 8.85 >= 7.5, 0 backlogs.', 'Selected. Amazon SDE offer at 26 LPA.'),
(13, 3,  3, '2026-10-07 10:15:00', 'in_progress', 1, 'CGPA 8.50 >= 7.5, 0 backlogs.', 'Cleared OA. Technical interview scheduled.'),
(14, 4,  3, '2026-10-07 11:00:00', 'shortlisted', 1, 'CGPA 8.10 >= 7.5, 0 backlogs.', 'Shortlisted.'),
(15, 22, 3, '2026-10-08 09:00:00', 'applied',     1, 'CGPA 8.00 >= 7.5, 0 backlogs.', 'Application under review.'),
(16, 29, 3, '2026-10-08 10:00:00', 'applied',     1, 'CGPA 7.85 >= 7.5, 0 backlogs.', 'Application under review.'),

-- Drive 4: Flipkart (min CGPA 7.0)
(17, 3,  4, '2026-10-09 09:30:00', 'selected',    1, 'CGPA 8.50 >= 7.0, 0 backlogs.', 'Flipkart SDE offer accepted. 18 LPA.'),
(18, 5,  4, '2026-10-09 10:00:00', 'shortlisted', 1, 'CGPA 7.80 >= 7.0, 0 backlogs.', 'Shortlisted after aptitude test.'),
(19, 22, 4, '2026-10-09 11:00:00', 'in_progress', 1, 'CGPA 8.00 >= 7.0, 0 backlogs.', 'Technical round in progress.'),
(20, 26, 4, '2026-10-10 09:00:00', 'applied',     1, 'CGPA 8.75 >= 7.0, 0 backlogs.', 'Application under review.'),
(21, 30, 4, '2026-10-10 10:00:00', 'applied',     1, 'CGPA 9.00 >= 7.0, 0 backlogs.', 'Application under review.'),

-- Drive 5: NVIDIA (min CGPA 8.0)
(22, 1,  5, '2026-10-11 09:00:00', 'selected',    1, 'CGPA 9.42 >= 8.0, 0 backlogs.', 'NVIDIA GPU Engineer offer. 38 LPA.'),
(23, 11, 5, '2026-10-11 10:00:00', 'shortlisted', 1, 'CGPA 9.10 >= 8.0, 0 backlogs.', 'Shortlisted for technical evaluation.'),
(24, 21, 5, '2026-10-11 11:00:00', 'applied',     1, 'CGPA 9.55 >= 8.0, 0 backlogs.', 'Application under review.'),
(25, 44, 5, '2026-10-12 09:00:00', 'applied',     1, 'CGPA 9.30 >= 8.0, 0 backlogs.', 'Application under review.'),

-- Drive 6: PhonePe (min CGPA 7.5)
(26, 12, 6, '2026-10-12 10:00:00', 'selected',    1, 'CGPA 8.65 >= 7.5, 0 backlogs.', 'PhonePe SWE offer. 22 LPA.'),
(27, 29, 6, '2026-10-12 11:00:00', 'shortlisted', 1, 'CGPA 7.85 >= 7.5, 0 backlogs.', 'Shortlisted for fintech interview.'),
(28, 41, 6, '2026-10-13 09:00:00', 'in_progress', 1, 'CGPA 8.70 >= 7.5, 0 backlogs.', 'Technical round in progress.'),
(29, 50, 6, '2026-10-13 10:00:00', 'applied',     1, 'CGPA 8.55 >= 7.5, 0 backlogs.', 'Application under review.'),

-- Drive 7: Infosys SP (min CGPA 7.0)
(30, 2,  7, '2026-10-14 09:00:00', 'shortlisted', 1, 'CGPA 8.85 >= 7.0, 0 backlogs.', 'Shortlisted for Infosys SP technical interview.'),
(31, 3,  7, '2026-10-14 10:00:00', 'applied',     1, 'CGPA 8.50 >= 7.0, 0 backlogs.', 'Application received.'),
(32, 5,  7, '2026-10-14 11:00:00', 'rejected',    1, 'Eligible on CGPA, failed technical test.', 'Low score in advanced coding round.'),
(33, 17, 7, '2026-10-15 09:00:00', 'applied',     1, 'CGPA 7.70 >= 7.0, 0 backlogs.', 'Application under review.'),
(34, 22, 7, '2026-10-15 10:00:00', 'applied',     1, 'CGPA 8.00 >= 7.0, 0 backlogs.', 'Application under review.'),

-- Drive 8: Cognizant GenC (min CGPA 6.5, max 1 backlog)
(35, 6,  8, '2026-10-16 09:00:00', 'selected',    1, 'CGPA 7.45 >= 6.5, 0 backlogs.', 'Selected. Cognizant ASE offer at 6.5 LPA.'),
(36, 7,  8, '2026-10-16 10:00:00', 'shortlisted', 1, 'CGPA 6.95 >= 6.5, 1 backlog <= 1 max.', 'Shortlisted for aptitude round.'),
(37, 8,  8, '2026-10-16 11:00:00', 'applied',     1, 'CGPA 6.50 >= 6.5, 0 backlogs.', 'Application verified.'),
(38, 15, 8, '2026-10-17 09:00:00', 'applied',     1, 'CGPA 7.55 >= 6.5, 0 backlogs.', 'Application under review.'),
(39, 31, 8, '2026-10-17 10:00:00', 'applied',     1, 'CGPA 7.25 >= 6.5, 0 backlogs.', 'Application under review.'),

-- Drive 9: Wipro (min CGPA 6.0, max 1 backlog)
(40, 9,  9, '2026-10-18 09:00:00', 'selected',    1, 'CGPA 7.20 >= 6.0, 0 backlogs.', 'Wipro Project Engineer offer accepted.'),
(41, 20, 9, '2026-10-18 10:00:00', 'shortlisted', 1, 'CGPA 6.80 >= 6.0, 1 backlog <= 1 max.', 'Shortlisted for Wipro interview.'),
(42, 36, 9, '2026-10-18 11:00:00', 'applied',     1, 'CGPA 7.15 >= 6.0, 0 backlogs.', 'Application under review.'),
(43, 45, 9, '2026-10-19 09:00:00', 'applied',     1, 'CGPA 7.10 >= 6.0, 0 backlogs.', 'Application under review.'),

-- Drive 11: Zomato Intern (min CGPA 7.5)
(44, 4,  11, '2026-10-19 10:00:00', 'selected',   1, 'CGPA 8.10 >= 7.5, 0 backlogs.', 'Zomato SWE Intern offer with PPO.'),
(45, 18, 11, '2026-10-19 11:00:00', 'shortlisted', 1, 'CGPA 8.45 >= 7.5, 0 backlogs.', 'Shortlisted for technical interview.'),
(46, 27, 11, '2026-10-20 09:00:00', 'applied',    1, 'CGPA 8.35 >= 7.5, 0 backlogs.', 'Application under review.'),

-- Drive 12: Swiggy Instamart (min CGPA 7.0)
(47, 4,  12, '2026-10-20 10:00:00', 'shortlisted', 1, 'CGPA 8.10 >= 7.0, 0 backlogs.', 'Shortlisted for Swiggy technical round.'),
(48, 12, 12, '2026-10-20 11:00:00', 'applied',    1, 'CGPA 8.65 >= 7.0, 0 backlogs.', 'Application under review.'),
(49, 35, 12, '2026-10-21 09:00:00', 'applied',    1, 'CGPA 8.05 >= 7.0, 0 backlogs.', 'Application under review.'),

-- Drive 13: Samsung R&D AI (min CGPA 8.0)
(50, 13, 13, '2026-10-21 10:00:00', 'selected',   1, 'CGPA 8.90 >= 8.0, 0 backlogs.', 'Samsung AI Engineer offer. 20 LPA.'),
(51, 33, 13, '2026-10-21 11:00:00', 'in_progress', 1, 'CGPA 9.15 >= 8.0, 0 backlogs.', 'Advanced to interview stage.'),
(52, 43, 13, '2026-10-22 09:00:00', 'applied',    1, 'CGPA 8.80 >= 8.0, 0 backlogs.', 'Application under review.'),

-- Drive 14: HDFC Bank IT (min CGPA 6.5, max 1 backlog)
(53, 6,  14, '2026-10-22 10:00:00', 'shortlisted', 1, 'CGPA 7.45 >= 6.5, 0 backlogs.', 'Shortlisted for HDFC IT technical interview.'),
(54, 19, 14, '2026-10-22 11:00:00', 'applied',    1, 'CGPA 7.90 >= 6.5, 0 backlogs.', 'Application under review.'),
(55, 32, 14, '2026-10-23 09:00:00', 'applied',    1, 'CGPA 8.60 >= 6.5, 0 backlogs.', 'Application under review.'),

-- Drive 15: Accenture ASE (min CGPA 6.0, max 2 backlogs)
(56, 7,  15, '2026-10-23 10:00:00', 'selected',   1, 'CGPA 6.95 >= 6.0, 1 backlog <= 2 max.', 'Accenture ASE offer. 4.5 LPA.'),
(57, 8,  15, '2026-10-23 11:00:00', 'selected',   1, 'CGPA 6.50 >= 6.0, 0 backlogs.', 'Accenture ASE offer accepted.'),
(58, 28, 15, '2026-10-24 09:00:00', 'applied',    1, 'CGPA 6.70 >= 6.0, 2 backlogs <= 2 max.', 'Application verified.'),
(59, 40, 15, '2026-10-24 10:00:00', 'applied',    1, 'CGPA 6.90 >= 6.0, 1 backlog <= 2 max.', 'Application under review.'),
(60, 48, 15, '2026-10-24 11:00:00', 'applied',    1, 'CGPA 6.60 >= 6.0, 2 backlogs <= 2 max.', 'Application verified.')
ON DUPLICATE KEY UPDATE
    student_id = VALUES(student_id), drive_id = VALUES(drive_id),
    application_date = VALUES(application_date), application_status = VALUES(application_status),
    eligibility_checked = VALUES(eligibility_checked), eligibility_notes = VALUES(eligibility_notes),
    admin_notes = VALUES(admin_notes);

-- ============================================================================
-- 9. INSERT INTERVIEW ROUNDS
-- ============================================================================
INSERT INTO interview_rounds (round_id, application_id, round_number, round_name, scheduled_at, interview_mode, meeting_or_venue, round_status) VALUES
-- Aarav - Microsoft Drive (Selected)
(1,  1, 1, 'Online Coding Assessment (HackerRank)',      '2026-10-08 10:00:00', 'online', 'https://hackerrank.com/microsoft-sde-2025', 'completed'),
(2,  1, 2, 'Technical System Design Round',              '2026-10-12 14:00:00', 'online', 'https://teams.microsoft.com/l/meeting/sde-tech-aarav', 'completed'),
(3,  1, 3, 'Director & HR Fitment Round',                '2026-10-15 16:00:00', 'online', 'https://teams.microsoft.com/l/meeting/sde-hr-aarav', 'completed'),
-- Diya - Microsoft (In Progress)
(4,  2, 1, 'Online Coding Assessment (HackerRank)',      '2026-10-08 10:00:00', 'online', 'https://hackerrank.com/microsoft-sde-2025', 'completed'),
(5,  2, 2, 'Technical Architecture Round',               '2026-10-25 11:00:00', 'online', 'https://teams.microsoft.com/l/meeting/sde-tech-diya', 'scheduled'),
-- Kavya - Google STEP (Selected)
(6,  9, 1, 'Google OA - Competitive Programming',        '2026-10-10 10:00:00', 'online', 'https://google.com/oa/step-2025', 'completed'),
(7,  9, 2, 'Technical Phone Screen (Algorithm & DS)',    '2026-10-14 14:00:00', 'online', 'https://meet.google.com/step-screen-kavya', 'completed'),
(8,  9, 3, 'Googleplex Virtual Onsite (3 rounds)',       '2026-10-20 10:00:00', 'online', 'https://meet.google.com/step-onsite-kavya', 'completed'),
-- Diya - Amazon (Selected)
(9,  12, 1, 'Amazon SDE OA (Coding + Work Style)',       '2026-10-11 10:00:00', 'online', 'https://amazon.jobs/oa/sde-2025', 'completed'),
(10, 12, 2, 'Amazon Technical Interview (DS & LP)',      '2026-10-15 14:00:00', 'online', 'https://chime.aws/amazon-tech-diya', 'completed'),
(11, 12, 3, 'Amazon Bar Raiser Interview',               '2026-10-18 15:00:00', 'online', 'https://chime.aws/amazon-bar-raiser-diya', 'completed'),
-- Rohan - Flipkart (Selected)
(12, 17, 1, 'Flipkart Aptitude + Coding Round',         '2026-10-12 10:00:00', 'online', 'https://hackerearth.com/flipkart-sde-2025', 'completed'),
(13, 17, 2, 'Technical Interview (Backend Systems)',     '2026-10-16 14:00:00', 'online', 'https://zoom.us/j/flipkart-tech-rohan', 'completed'),
-- Aarav - NVIDIA (Selected)
(14, 22, 1, 'NVIDIA Coding Assessment (C++ & Algorithms)', '2026-10-13 10:00:00', 'online', 'https://nvidia.com/oa/gpu-eng-2025', 'completed'),
(15, 22, 2, 'NVIDIA Technical Interview (GPU Architecture)', '2026-10-17 14:00:00', 'online', 'https://teams.microsoft.com/l/meeting/nvidia-aarav', 'completed'),
-- Pooja - PhonePe (Selected)
(16, 26, 1, 'PhonePe Coding Assessment',                 '2026-10-14 10:00:00', 'online', 'https://hackerrank.com/phonepe-sde-2025', 'completed'),
(17, 26, 2, 'PhonePe Technical Interview (Fintech)',     '2026-10-18 14:00:00', 'online', 'https://zoom.us/j/phonepe-tech-pooja', 'completed'),
-- Sneha - Cognizant (Selected)
(18, 35, 1, 'Cognizant GenC Online Aptitude',            '2026-10-10 10:00:00', 'online', 'https://cognizant.exam.net/genc-sneha', 'completed'),
(19, 35, 2, 'Technical & HR Discussion',                 '2026-10-14 15:00:00', 'offline', 'Placement Cell Seminar Hall 2', 'completed'),
-- Arjun - Wipro (Selected)
(20, 40, 1, 'Wipro NLTH Aptitude Round',                 '2026-10-15 10:00:00', 'online', 'https://wipro.imocha.io/nlth-2025', 'completed'),
(21, 40, 2, 'Wipro Technical Interview',                 '2026-10-19 14:00:00', 'offline', 'Placement Cell Room 304', 'completed'),
-- Ananya - Zomato (Selected)
(22, 44, 1, 'Zomato Coding Challenge',                   '2026-10-15 10:00:00', 'online', 'https://hackerearth.com/zomato-intern-2025', 'completed'),
(23, 44, 2, 'Technical Interview (Backend & Algorithms)', '2026-10-19 14:00:00', 'online', 'https://zoom.us/j/zomato-tech-ananya', 'completed'),
-- Amit - Samsung (Selected)
(24, 50, 1, 'Samsung AI Assessment Test',                '2026-10-16 10:00:00', 'online', 'https://samsung.imocha.io/ai-2025', 'completed'),
(25, 50, 2, 'Samsung Research Interview (ML/DL)',        '2026-10-20 14:00:00', 'online', 'https://teams.microsoft.com/l/meeting/samsung-amit', 'completed'),
(26, 50, 3, 'Samsung Director Interview',                '2026-10-24 16:00:00', 'offline', 'Samsung R&D Bengaluru Office', 'completed'),
-- Vikram - Accenture (Selected)
(27, 56, 1, 'Accenture Cognitive & Coding Test',         '2026-10-17 10:00:00', 'online', 'https://accenture.hiringuide.com/ase-2025', 'completed'),
(28, 56, 2, 'Accenture Communication & HR Interview',    '2026-10-21 14:00:00', 'offline', 'Placement Cell Seminar Hall 1', 'completed'),
-- Neha - Accenture (Selected)
(29, 57, 1, 'Accenture Cognitive & Coding Test',         '2026-10-17 10:00:00', 'online', 'https://accenture.hiringuide.com/ase-2025', 'completed'),
(30, 57, 2, 'Accenture Communication & HR Interview',    '2026-10-21 14:00:00', 'offline', 'Placement Cell Seminar Hall 1', 'completed')
ON DUPLICATE KEY UPDATE
    application_id = VALUES(application_id), round_number = VALUES(round_number),
    round_name = VALUES(round_name), scheduled_at = VALUES(scheduled_at),
    interview_mode = VALUES(interview_mode), meeting_or_venue = VALUES(meeting_or_venue),
    round_status = VALUES(round_status);

-- ============================================================================
-- 10. INSERT INTERVIEW RESULTS
-- ============================================================================
INSERT INTO interview_results (result_id, round_id, result_status, feedback, evaluated_by) VALUES
-- Aarav - Microsoft (all passed → selected)
(1,  1, 'passed', 'Perfect score: solved all 3 problems including Segment Tree DP in 45 minutes.', 1),
(2,  2, 'passed', 'Outstanding system design of a distributed URL shortener with caching layers.', 1),
(3,  3, 'passed', 'Excellent cultural alignment, leadership potential. Strong hire recommendation.', 1),
-- Diya - Microsoft Round 1 (passed)
(4,  4, 'passed', 'Scored 92% in coding test. Clean OOP design demonstrated.', 1),
-- Kavya - Google STEP (all passed → selected)
(5,  6, 'passed', 'Solved hard-level graph problems with optimal time complexity.', 1),
(6,  7, 'passed', 'Explained advanced DP and graph algorithms clearly. Strong communication.', 1),
(7,  8, 'passed', 'Onsite rounds: impressed Googlers with OS knowledge and coding fluency.', 1),
-- Diya - Amazon (all passed → selected)
(8,  9, 'passed', 'Top scorer on Amazon OA. Clean code with edge case handling.', 1),
(9,  10, 'passed', 'Strong LP answers demonstrating ownership and customer obsession.', 1),
(10, 11, 'passed', 'Bar Raiser approved. Exceptional depth in distributed systems.', 1),
-- Rohan - Flipkart (all passed → selected)
(11, 12, 'passed', 'Strong performance in aptitude and 2 coding problems solved optimally.', 1),
(12, 13, 'passed', 'Deep understanding of database indexing and backend architecture.', 1),
-- Aarav - NVIDIA (all passed → selected)
(13, 14, 'passed', 'C++ templates and CUDA basics demonstrated proficiently.', 1),
(14, 15, 'passed', 'GPU memory hierarchy and parallel reduction algorithms mastered.', 1),
-- Pooja - PhonePe (all passed → selected)
(15, 16, 'passed', 'Strong database and API design knowledge.', 1),
(16, 17, 'passed', 'Excellent understanding of payment systems and distributed transactions.', 1),
-- Sneha - Cognizant (all passed → selected)
(17, 18, 'passed', 'High percentile in quantitative analysis and CS fundamentals.', 1),
(18, 19, 'passed', 'Strong communication, positive mindset, good SQL knowledge.', 1),
-- Arjun - Wipro (all passed → selected)
(19, 20, 'passed', 'Cleared aptitude with 85 percentile.', 1),
(20, 21, 'passed', 'Good technical fundamentals and professional communication.', 1),
-- Ananya - Zomato (all passed → selected)
(21, 22, 'passed', 'Excellent Python coding and ML application understanding.', 1),
(22, 23, 'passed', 'Strong backend architecture knowledge for logistics systems.', 1),
-- Amit - Samsung (all passed → selected)
(23, 24, 'passed', 'Top ML assessment score. Deep learning architectures well understood.', 1),
(24, 25, 'passed', 'Excellent research aptitude and novel ML approaches demonstrated.', 1),
(25, 26, 'passed', 'Director approved. Exceptional AI research potential.', 1),
-- Vikram - Accenture (all passed → selected)
(26, 27, 'passed', 'Good cognitive assessment score and decent coding knowledge.', 1),
(27, 28, 'passed', 'Professional, well-spoken, good culture fit.', 1),
-- Neha - Accenture (all passed → selected)
(28, 29, 'passed', 'Cleared cognitive test. Frontend expertise acknowledged.', 1),
(29, 30, 'passed', 'Great attitude and teamwork orientation demonstrated.', 1)
ON DUPLICATE KEY UPDATE
    round_id = VALUES(round_id), result_status = VALUES(result_status),
    feedback = VALUES(feedback), evaluated_by = VALUES(evaluated_by);

-- ============================================================================
-- 11. INSERT NOTIFICATIONS
-- ============================================================================
INSERT INTO notifications (notification_id, user_id, title, message, notification_type, is_read) VALUES
(1,  2,  '🎉 Microsoft Offer: 45 LPA!',             'Congratulations Aarav! You have been SELECTED at Microsoft India as SDE-1 at 45.00 LPA. Offer letter will be shared via email.', 'application_status', 1),
(2,  3,  '🎉 Amazon Offer Extended!',               'Congratulations Diya! You have been selected at Amazon India as SDE at 26.00 LPA.', 'application_status', 1),
(3,  4,  '🎉 Zomato Internship Offer!',             'Congratulations Ananya! Selected for Zomato SWE Internship with PPO opportunity at 10 LPA stipend.', 'application_status', 1),
(4,  7,  '🎉 Cognizant Placement Offer!',           'Congratulations Sneha! You have been selected at Cognizant as Associate Software Engineer at 6.50 LPA.', 'application_status', 1),
(5,  8,  '🎉 Accenture Placement Offer!',           'Congratulations Vikram! Selected at Accenture as ASE at 4.50 LPA.', 'application_status', 1),
(6,  9,  '🎉 Accenture Placement Offer!',           'Congratulations Neha! Selected at Accenture as ASE at 4.50 LPA.', 'application_status', 1),
(7,  10, '🎉 Wipro Project Engineer Offer!',        'Congratulations Arjun! Selected at Wipro Technologies at 6.00 LPA.', 'application_status', 1),
(8,  13, '🎉 Samsung R&D AI Engineer Offer!',       'Congratulations Amit! You have been selected at Samsung R&D as AI Research Engineer at 20.00 LPA.', 'application_status', 1),
(9,  15, '🎉 Google STEP Internship Offer!',        'Congratulations Kavya! You have been selected for the Google STEP Internship at 12 LPA stipend.', 'application_status', 1),
(10, 12, '🎉 PhonePe Engineer Offer!',              'Congratulations Pooja! Selected at PhonePe as Payments Platform Engineer at 22.00 LPA.', 'application_status', 1),
(11, 4,  '🎉 Flipkart SDE Offer!',                  'Congratulations Rohan! Selected at Flipkart as SDE-1 at 18.00 LPA.', 'application_status', 1),
(12, 2,  'Interview Scheduled: Tech Round 2',        'Your Technical Architecture round with Microsoft is scheduled for Oct 25 at 11:00 AM.', 'interview_schedule', 0),
(13, 3,  'Interview Scheduled: Amazon Tech Round',   'Your Amazon SDE Technical Interview is confirmed for Oct 15 at 2:00 PM online.', 'interview_schedule', 1),
(14, 1,  'System Digest: 10 Offers Released!',       'Placement Season Update: 12 offers released. 15 drives active. Placement rate now at 20%.', 'general', 0),
(15, 6,  'Application Shortlisted: Infosys SP',      'Your Infosys Specialist Programmer application has been shortlisted for technical interview.', 'application_status', 0),
(16, 9,  'New Drive Alert: Wipro NLTH!',             'New placement drive published: Wipro Elite NLTH Recruitment. Min CGPA 6.0. Deadline: Dec 22.', 'drive_alert', 0),
(17, 7,  'Application Shortlisted: Cognizant',       'Your application for Cognizant GenC is shortlisted for aptitude round.', 'application_status', 0),
(18, 3,  'Microsoft Technical Round Scheduled',      'Your Microsoft Technical Architecture round is scheduled. Prepare system design topics.', 'interview_schedule', 0)
ON DUPLICATE KEY UPDATE
    user_id = VALUES(user_id), title = VALUES(title), message = VALUES(message),
    notification_type = VALUES(notification_type), is_read = VALUES(is_read);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- End of Script 02_sample_data.sql (Large Dataset: 50 Students, 20 Companies, 15 Drives)
-- ============================================================================
