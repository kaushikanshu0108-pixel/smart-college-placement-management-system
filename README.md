# Smart College Placement Management System (SCPMS)
### Centralized University Placement Management Platform & Relational Database
**Department of Computer Science & Engineering — B.Tech CSE Project**

---

## 1. Project Overview & Architecture

The **Smart College Placement Management System** is an enterprise-grade academic placement automation platform that bridges students, university placement coordinators, and hiring companies. 

### Technology Stack
- **Database Engine:** MySQL 8.0+ (InnoDB Storage Engine, `utf8mb4` character set, 3NF normalized schema)
- **Database Administration & Modeling:** MySQL Workbench 8.0+
- **Backend Application Server:** Node.js with Express.js
- **Database Connectivity:** `mysql2/promise` (connection pooling and parameterized queries)
- **Authentication & Security:** `express-session` with `bcryptjs` password hashing
- **Environment Management:** `dotenv`
- **Frontend Architecture:** Clean, responsive HTML5, modern CSS3, and Vanilla JavaScript

---

## 2. Directory Structure

```text
Smart-College-Placement-Management-System/
├── database/
│   ├── 00_create_database.sql          # Creates database with utf8mb4 encoding
│   ├── 01_schema.sql                   # 11 Tables with PK, FK, CHECK constraints, indexes
│   ├── 02_sample_data.sql              # Realistic seed data (admin, 10 students, 4 companies, drives)
│   ├── 03_business_logic.sql           # Eligibility & application stored procedures + triggers
│   ├── 04_reports_and_indexes.sql      # 9 Reporting queries, branch analytics & EXPLAIN analysis
│   ├── 05_security_and_test_cases.sql  # Least-privilege user setup & 8 automated SQL test cases
│   └── 06_verification_queries.sql     # Live row counts, foreign key checks & system health
├── backend/
│   └── config/
│       └── db.js                       # Connection pool configuration using mysql2/promise
├── .env.example                        # Template environment variables (no credentials)
├── .env                                # Local environment settings
├── .gitignore                          # Excludes node_modules and .env
├── package.json                        # Project dependencies
└── README.md                           # Documentation, execution guide, and troubleshooting
```

---

## 3. Relational Database Design (11 Entities in 3NF)

1. **`users`**: Central identity repository storing email, role (`admin`, `student`, `recruiter`), and bcrypt password hash.
2. **`students`**: Academic profile linked 1:1 to `users`, tracking roll number, branch, CGPA, backlogs, and resume.
3. **`companies`**: Recruiting organizations with contact points, industry category, and hiring history.
4. **`placement_drives`**: Job drives tracking package (LPA), minimum CGPA, maximum backlogs allowed, and application deadlines.
5. **`applications`**: Applications linking students to drives with `UNIQUE(student_id, drive_id)` to prevent duplicate submissions.
6. **`skills`**: Master taxonomy of technical skills (Python, Java, DSA, MySQL, etc.).
7. **`student_skills`**: Junction table for student-skill mapping with proficiency levels (`beginner`, `intermediate`, `advanced`).
8. **`drive_required_skills`**: Junction table specifying mandatory (`is_mandatory = 1`) and preferred skills per drive.
9. **`interview_rounds`**: Sequential interview stages (Aptitude, Tech Round 1, HR) arranged for applicants.
10. **`interview_results`**: Verdicts (`pending`, `passed`, `failed`) and evaluator feedback per interview round.
11. **`notifications`**: Targeted system alerts regarding deadlines, interview schedules, and selection notices.

---

## 4. Execution Order in MySQL Workbench

To set up the complete database from scratch, execute the SQL files in the `database/` directory in this **exact order**:

| Step | Script File | Purpose |
|---|---|---|
| **Step 1** | `00_create_database.sql` | Creates `smart_college_placement` database with `utf8mb4` |
| **Step 2** | `01_schema.sql` | Creates all 11 tables, constraints, foreign keys, and indexes |
| **Step 3** | `02_sample_data.sql` | Seeds realistic demo records with real bcrypt password hashes |
| **Step 4** | `03_business_logic.sql` | Compiles stored procedures (`sp_apply_for_drive`, `sp_check_student_eligibility`) and triggers |
| **Step 5** | `04_reports_and_indexes.sql` | Runs 9 placement analytics reports and EXPLAIN index optimizations |
| **Step 6** | `05_security_and_test_cases.sql` | Runs validation test suite (duplicate checks, CGPA limits, backlogs, skills) |
| **Step 7** | `06_verification_queries.sql` | Runs comprehensive diagnostics confirming all live counts and health |

### How to Execute in MySQL Workbench:
1. Open **MySQL Workbench** and connect to your local MySQL connection (e.g. `Local instance MySQL80`).
2. Go to **File -> Open SQL Script...** (or press `Ctrl + O`).
3. Select `00_create_database.sql` and click the **Lightning Bolt icon** (Execute) or press `Ctrl + Shift + Enter`.
4. Repeat for scripts `01` through `06` in sequential order.
5. In the left **Navigator** pane, right-click on the Schemas tab and select **Refresh All** to view the populated database.

### How to View the ER Diagram in MySQL Workbench:
1. In MySQL Workbench, click **Database** from the top menu bar.
2. Select **Reverse Engineer...** (or press `Ctrl + R`).
3. Click **Next**, choose your local connection, and enter your password.
4. Select `smart_college_placement` from the list of schemas.
5. Click **Next -> Execute -> Next -> Finish**.
6. MySQL Workbench will automatically generate the full visual **EER Diagram** displaying all 11 tables and their foreign key relationships!

---

## 5. Seeded Demo Accounts (Pre-configured)

All passwords have been securely hashed using **bcrypt** (salt rounds = 10):

| Role | Name | Email | Password |
|---|---|---|---|
| **Placement Admin** | Dr. Rajesh Sharma | `admin@college.edu` | `Admin@123` |
| **Student (High CGPA)** | Aarav Patel | `aarav.patel@college.edu` | `Student@123` |
| **Student (Shortlisted)** | Diya Sharma | `diya.sharma@college.edu` | `Student@123` |
| **Student (IT Branch)** | Rohan Verma | `rohan.verma@college.edu` | `Student@123` |
| **Student (With 1 Backlog)** | Vikram Malhotra | `vikram.malhotra@college.edu` | `Student@123` |
| **Student (With 2 Backlogs)** | Priya Nair | `priya.nair@college.edu` | `Student@123` |

---

## 6. Backend Configuration & Connection Test

### 1. Install Node.js Dependencies
Navigate to the project root in your terminal and run:
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` (already done for local development):
```bash
cp .env.example .env
```
Ensure your `.env` contains your correct local MySQL credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=smart_college_placement
DB_CONNECTION_LIMIT=10
```

### 3. Test Database Connection
Execute the connection test script:
```bash
node backend/config/db.js
```
**Expected Successful Output:**
```text
---------------------------------------------------------
 MySQL Database Connection Established Successfully
 Host:       localhost:3306
 Database:   smart_college_placement
 Version:    MySQL 8.0.xx
 Server Time: 2026-10-23 11:xx:xx
---------------------------------------------------------
```

### 4. Run the Web Application
Start the application server:
```bash
npm run dev
# or
npm start
```

Access the interactive portals in your web browser:
- 🌐 **Home & Landing Portal:** [http://localhost:5000](http://localhost:5000)
- 🎓 **Student Portal:** [http://localhost:5000/student.html](http://localhost:5000/student.html)
- 🛡️ **Placement Admin Portal:** [http://localhost:5000/admin.html](http://localhost:5000/admin.html)
- 💬 **Placement Help Desk & Support:** [http://localhost:5000/support.html](http://localhost:5000/support.html)
- 🔌 **Server & DB Health Endpoint:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 7. Web3Forms Support Integration Setup

The application integrates with [Web3Forms](https://web3forms.com) to provide a student & recruiter support ticket portal without exposing credentials to the client.

1. Obtain a free access key from [Web3Forms](https://web3forms.com) using your college or admin email.
2. Open `.env` and configure:
   ```env
   WEB3FORMS_ACCESS_KEY=your_actual_access_key_here
   ```
3. Support tickets submitted via `/support.html` are validated server-side, checked for spam using honeypot detection, and dispatched securely.

To generate new secure password hashes for testing:
```bash
node -e "const b = require('bcryptjs'); console.log(b.hashSync('YourPasswordHere', 10));"
```

---

## 8. Common Errors & Quick Solutions

### 1. Error 1045 (28000): Access denied for user 'root'@'localhost'
- **Cause:** Incorrect MySQL password in `.env` or MySQL connection.
- **Fix:** Update the `DB_PASSWORD` value in `.env` with your actual MySQL root password.

### 2. Error 1049 (42000): Unknown database 'smart_college_placement'
- **Cause:** Schema scripts were run before the database was created.
- **Fix:** Run `database/00_create_database.sql` first before running any other script.

### 3. Error 1062 (23000): Duplicate entry for key 'uq_student_drive'
- **Cause:** A student attempted to submit more than one application to the same placement drive.
- **Fix:** This is an intentional security constraint. A student can only apply once to a given drive.

### 4. Error 3819 (HY000): Check constraint 'chk_students_cgpa' is violated
- **Cause:** Attempted to insert a student with CGPA < 0.00 or > 10.00.
- **Fix:** Ensure CGPA is recorded as a decimal between 0.00 and 10.00.

### 5. Error 1452 (23000): Cannot add or update a child row: a foreign key constraint fails
- **Cause:** Referencing a `student_id` or `drive_id` that does not exist in the parent tables.
- **Fix:** Always ensure the referenced entity is inserted into `students` or `placement_drives` first.
