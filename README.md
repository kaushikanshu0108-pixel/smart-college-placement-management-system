# Smart College Placement Management System (SCPMS)
### Centralized University Placement Automation Platform & Relational Database
**Department of Computer Science & Engineering — Capstone & DBMS Project**

---

## 🌐 Live Production Deployment

The project is deployed and live on **Vercel Serverless Architecture**:

* **🚀 Production Live URL:** [https://smart-college-placement-system-chi.vercel.app](https://smart-college-placement-system-chi.vercel.app)
* **🛡️ Placement Admin Portal:** [https://smart-college-placement-system-chi.vercel.app/admin.html](https://smart-college-placement-system-chi.vercel.app/admin.html)
* **🎓 Student Portal:** [https://smart-college-placement-system-chi.vercel.app/student.html](https://smart-college-placement-system-chi.vercel.app/student.html)
* **💬 Support & Placement Help Desk:** [https://smart-college-placement-system-chi.vercel.app/support](https://smart-college-placement-system-chi.vercel.app/support)
* **🔌 System Health Endpoint:** [https://smart-college-placement-system-chi.vercel.app/api/health](https://smart-college-placement-system-chi.vercel.app/api/health)

#### 📋 Pre-configured Demo Login Credentials
| Role | Email | Password |
|---|---|---|
| **Placement Admin** | `admin@college.edu` | `Admin@123456` |
| **Enrolled Student** | `aarav.patel@college.edu` | `Student@123456` |

---

## 1. Project Overview & Architecture

The **Smart College Placement Management System** is an enterprise-grade academic placement automation platform that bridges students, university placement coordinators, and corporate recruiting partners. It replaces manual spreadsheets with a high-integrity 3NF relational database, automated eligibility checks, real-time analytics dashboards, and external corporate intelligence APIs.

### Technology Stack
- **Database Engine:** MySQL 8.0+ (InnoDB Storage Engine, `utf8mb4` encoding, 11 entities in 3NF)
- **Database Administration & Modeling:** MySQL Workbench 8.0+
- **Backend Application Server:** Node.js with Express.js (RESTful API architecture)
- **Database Connectivity:** `mysql2/promise` (connection pooling, parameterized queries, transaction safety)
- **Authentication & Security:** `express-session` with `bcryptjs` password hashing (salt rounds = 10)
- **Cloud Hosting & Deployment:** Vercel Serverless Functions (`@vercel/node` rewrites)
- **Frontend Architecture:** Clean, responsive HTML5, modern CSS3 (with complete Dark/Light themes), and Vanilla JavaScript
- **Data Visualization:** Chart.js 4.4+ (5 dynamic interactive pipeline and readiness charts)

---

## 2. Integrated Third-Party APIs (External Services)

The system integrates multiple production-grade REST APIs to automate workflows, prevent spam, and enrich corporate intelligence:

### 1. Web3Forms Support Desk API
* **Provider:** [Web3Forms](https://web3forms.com)
* **Purpose:** Powers the student and recruiter inquiry dispatch gateway (`frontend/support.html`).
* **Capabilities:**
  - Automated ticket forwarding directly to official campus placement coordinator emails.
  - Client-side browser dispatch with anti-spam honeypot detection (`botcheck`) to prevent automated bot submissions without requiring complex captcha friction.
* **Environment Variable:** `WEB3FORMS_ACCESS_KEY` *(stored securely in `.env`, never exposed in public repositories)*.

### 2. Brandfetch Corporate Intelligence API
* **Provider:** [Brandfetch Developer Platform](https://brandfetch.com/developers)
* **Purpose:** Powers the 1-click **"⚡ Auto-Enrich via Company API"** search engine in the Admin Portal.
* **Capabilities:**
  - Automatically fetches verified high-resolution brand logos, verified official domains, industry taxonomy, company summaries, global employee counts, and founding years.
  - Automatically enriches the recruiting partner directory and renders brand favicons alongside company names.
* **Environment Variable:** `BRANDFETCH_API_KEY` *(configured securely via environment variables)*.

### 3. Finnhub Market & Corporate Profile API
* **Provider:** [Finnhub Financial Data](https://finnhub.io)
* **Purpose:** Corporate entity verification and multinational company metrics.
* **Capabilities:**
  - Validates corporate web URLs, stock market tickers, capitalizations, and verified corporate contact points.
* **Environment Variable:** `FINNHUB_API_KEY` *(configured securely via environment variables)*.

### 4. Clearbit Brand Favicon & Autocomplete Engine
* **Provider:** Clearbit / HubSpot
* **Purpose:** Instant brand favicon delivery and zero-latency company domain autocomplete fallback.
* **Capabilities:**
  - Renders official company logo avatars throughout the company table and drive cards with automated SVG/PNG fallback.

---

## 3. Directory Structure

```text
Smart-College-Placement-Management-System/
├── api/
│   └── index.js                        # Native Vercel Serverless function entrypoint
├── backend/
│   ├── config/
│   │   └── db.js                       # MySQL2 connection pool with timeout & transactions
│   ├── middleware/
│   │   └── auth.js                     # Role-based route authorization guards
│   ├── routes/
│   │   ├── adminRoutes.js              # Admin KPIs, drives, pipeline, company API lookup
│   │   ├── authRoutes.js               # Login, session validation, logout
│   │   ├── publicRoutes.js             # Public drives & Web3Forms configuration
│   │   └── studentRoutes.js            # Student profile, applications, eligibility
│   └── server.js                       # Express app with graceful shutdown & error handling
├── database/
│   ├── 00_create_database.sql          # Creates database with utf8mb4 encoding
│   ├── 01_schema.sql                   # 11 Tables with PK, FK, CHECK constraints, indexes
│   ├── 02_sample_data.sql              # Realistic seed data (admin, 50 students, 20 companies)
│   ├── 03_business_logic.sql           # Eligibility & application stored procedures + triggers
│   ├── 04_reports_and_indexes.sql      # 9 Reporting queries, branch analytics & EXPLAIN analysis
│   ├── 05_security_and_test_cases.sql  # Least-privilege user setup & 8 automated SQL test cases
│   └── 06_verification_queries.sql     # Live row counts, foreign key checks & system health
├── docs/
│   ├── data-quality-report.md          # 3NF schema audit & data inspection report
│   └── future-roadmap.md               # AI Skill Match & Readiness Advisor architecture
├── frontend/
│   ├── css/
│   │   └── style.css                   # Responsive layout, dark/light themes, modal scroll fixes
│   ├── js/
│   │   ├── admin.js                    # Admin charts, company API auto-fill, accreditation export
│   │   ├── api.js                      # Centralized fetch client with cookie credentials
│   │   ├── auth.js                     # Session detection & navigation user pills
│   │   └── student.js                  # Readiness score, dynamic profile checklist, drive filters
│   ├── admin.html                      # Placement Officer Dashboard & Live DB Explorer
│   ├── index.html                      # Public landing page with active drive listings
│   ├── student.html                    # Student Portal & Application Tracking Matrix
│   └── support.html                    # Web3Forms Helpdesk & Knowledge Base
├── .env.example                        # Template environment variables (no credentials)
├── .gitignore                          # Excludes sensitive .env, .vercel, and node_modules
├── package.json                        # Project dependencies & build scripts
├── vercel.json                         # Vercel serverless rewrites and CDN routing
├── test-api.js                         # 24-check automated REST API test suite
└── README.md                           # Documentation, execution guide, and troubleshooting
```

---

## 4. Relational Database Design (11 Entities in 3NF)

1. **`users`**: Central identity repository storing email, role (`admin`, `student`, `recruiter`), and bcrypt password hash.
2. **`students`**: Academic profile linked 1:1 to `users`, tracking roll number, branch, graduation year, CGPA, backlogs, and resume URL.
3. **`companies`**: Recruiting organizations with contact points, industry category, and live brand logo URLs.
4. **`placement_drives`**: Job drives tracking package (LPA), minimum CGPA, maximum backlogs allowed, and application deadlines.
5. **`applications`**: Applications linking students to drives with `UNIQUE(student_id, drive_id)` constraint preventing duplicate submissions.
6. **`skills`**: Master taxonomy of technical skills (Python, Java, DSA, MySQL, React, Docker, etc.).
7. **`student_skills`**: Junction table for student-skill mapping with proficiency levels (`beginner`, `intermediate`, `advanced`).
8. **`drive_required_skills`**: Junction table specifying mandatory (`is_mandatory = 1`) and preferred skills per drive.
9. **`interview_rounds`**: Sequential interview stages (Aptitude, Tech Round 1, HR) scheduled for applicants.
10. **`interview_results`**: Verdicts (`pending`, `passed`, `failed`) and coordinator feedback per round.
11. **`notifications`**: Targeted system alerts regarding deadlines, interview schedules, and selection notices.

---

## 5. Execution Order in MySQL Workbench

To set up the complete database from scratch, execute the SQL files in the `database/` directory in this **exact order**:

| Step | Script File | Purpose |
|---|---|---|
| **Step 1** | `00_create_database.sql` | Creates `smart_college_placement` database with `utf8mb4` |
| **Step 2** | `01_schema.sql` | Creates all 11 tables, constraints, foreign keys, and indexes |
| **Step 3** | `02_sample_data.sql` | Seeds realistic records with bcrypt password hashes (Admin + 50 Students + 20 Companies) |
| **Step 4** | `03_business_logic.sql` | Compiles stored procedures (`sp_apply_for_drive`, `sp_check_student_eligibility`) and triggers |
| **Step 5** | `04_reports_and_indexes.sql` | Runs 9 placement analytics reports and EXPLAIN index optimizations |
| **Step 6** | `05_security_and_test_cases.sql` | Runs validation test suite (duplicate checks, CGPA limits, backlogs, skills) |
| **Step 7** | `06_verification_queries.sql` | Runs comprehensive diagnostics confirming all live counts and health |

### How to View the ER Diagram in MySQL Workbench:
1. In MySQL Workbench, click **Database** from the top menu bar.
2. Select **Reverse Engineer...** (or press `Ctrl + R`).
3. Choose your local connection, enter your password, and select `smart_college_placement`.
4. Click **Next -> Execute -> Next -> Finish** to generate the full visual **EER Diagram**.

---

## 6. Local Setup & Execution Guide

### 1. Install Node.js Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to create your local `.env`:
```bash
cp .env.example .env
```
Populate your database credentials and API keys in `.env`:
```env
PORT=5000
NODE_ENV=development
SESSION_SECRET=your_secure_session_secret

# Local MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=smart_college_placement

# External API Integrations (Keep Private)
WEB3FORMS_ACCESS_KEY=your_web3forms_key
BRANDFETCH_API_KEY=your_brandfetch_key
FINNHUB_API_KEY=your_finnhub_key
```

### 3. Run Automated System Test Suite
Verify that all database pools, endpoints, and external APIs are operating with 100% pass rate:
```bash
node test-api.js
```

### 4. Start the Application
```bash
npm start
```
Visit:
- 🌐 **Home:** [http://localhost:5000](http://localhost:5000)
- 🎓 **Student Portal:** [http://localhost:5000/student.html](http://localhost:5000/student.html)
- 🛡️ **Admin Portal:** [http://localhost:5000/admin.html](http://localhost:5000/admin.html)
- 💬 **Support Desk:** [http://localhost:5000/support.html](http://localhost:5000/support.html)
- 🔌 **Health API:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 7. Security & Compliance
- **Zero API Key Leakage:** All proprietary API keys and database credentials reside strictly within environment variables (`.env`) and Vercel Encrypted Secrets.
- **SQL Injection Prevention:** 100% of queries use parameterized prepared statements through `mysql2/promise`.
- **Password Security:** Salted `bcryptjs` encryption with 10 rounds; plaintext passwords are never stored.
- **CSRF & Session Hardening:** HTTP-only cookie sessions with 24-hour expiration and session regeneration on privilege escalation.
