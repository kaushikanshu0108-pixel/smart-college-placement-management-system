# SCPMS Data Quality Report

**Project:** Smart College Placement Management System  
**Database:** `smart_college_placement`  
**Schema Source:** `database/01_schema.sql`  
**Data Source:** `database/02_sample_data.sql`  
**Report Type:** Inspection-only — NO data deletion or modification is performed  
**Generated:** 2026-11-12  

---

## 1. Schema Review — Table-by-Table Analysis

### Table 1: `users`

| Attribute | Assessment |
|-----------|-----------|
| Primary Key | ✅ `user_id INT UNSIGNED AUTO_INCREMENT` |
| Unique Constraints | ✅ `email UNIQUE` |
| NOT NULL | ✅ All critical columns (`full_name`, `email`, `password_hash`, `role`, `account_status`, timestamps) |
| CHECK Constraints | ✅ `chk_users_email`: `email LIKE '%@%.%'` |
| Indexes | ✅ `idx_users_email`, `idx_users_role`, `idx_users_status` |
| Foreign Keys | N/A (root identity table) |
| `updated_at` auto-update | ✅ `ON UPDATE CURRENT_TIMESTAMP` |

**Notes:**
- `password_hash VARCHAR(255)` is sufficient for bcrypt hashes (60 chars), with room for future algorithm upgrades.
- The email CHECK `LIKE '%@%.%'` is a basic sanity guard only; it won't catch invalid domains like `a@@b.c`. Application-layer validation is essential.
- `role ENUM('admin', 'student', 'recruiter')` — the `recruiter` role exists in the ENUM but no recruiter accounts are seeded in `02_sample_data.sql`. This is acceptable for a pilot but should be noted.

---

### Table 2: `students`

| Attribute | Assessment |
|-----------|-----------|
| Primary Key | ✅ `student_id INT UNSIGNED AUTO_INCREMENT` |
| Foreign Key | ✅ `fk_students_user → users(user_id) ON DELETE CASCADE` |
| Unique Constraints | ✅ `user_id UNIQUE`, `university_roll_no UNIQUE` |
| NOT NULL | ✅ All academic fields (`branch`, `graduation_year`, `cgpa`, `active_backlogs`) |
| Nullable Columns | ⚠️ `phone`, `resume_url`, `profile_summary` — intentionally nullable but should be monitored |
| CHECK Constraints | ✅ `chk_students_cgpa`: `0.00 ≤ cgpa ≤ 10.00` <br> ✅ `chk_students_backlogs`: `active_backlogs ≥ 0` |
| Indexes | ✅ `idx_students_roll_no`, `idx_students_branch`, `idx_students_cgpa`, `idx_students_backlogs`, `idx_students_grad_year` |

**Data Observations from seed (50 students):**
- CGPA range in seed data: **6.50 – 9.55** — all within constraint bounds ✅
- Students with backlogs: student_ids 7 (1 backlog), 10 (2), 20 (1), 28 (2), 34 (1), 40 (1), 48 (2) — 7 of 50 (14%)
- All 50 students have `graduation_year = 2025` — homogeneous batch, expected for a placement cycle seed
- All students have `phone` and `resume_url` populated — good data completeness in seed
- `resume_url` values use `https://drive.google.com/resume/<name>` — these are placeholder URLs; real deployments should validate URL accessibility

---

### Table 3: `companies`

| Attribute | Assessment |
|-----------|-----------|
| Primary Key | ✅ `company_id INT UNSIGNED AUTO_INCREMENT` |
| Unique Constraints | ✅ `company_name UNIQUE` |
| NOT NULL | ✅ `company_name`, `industry`, `contact_name`, `contact_email` |
| Nullable Columns | ⚠️ `website`, `contact_phone` — acceptable but monitor for completeness |
| CHECK Constraints | ✅ `chk_companies_email`: `contact_email LIKE '%@%.%'` |
| Indexes | ✅ `idx_companies_name`, `idx_companies_status` |

**Data Observations from seed (20 companies):**
- All 20 companies have `company_status = 'active'`
- **No `inactive` companies in seed** — consider adding at least 1–2 inactive records for UI/filter testing
- All contact emails and phones appear plausible for major Indian companies
- `Byju's` has an escaped apostrophe (`''`) in the INSERT — correct SQL escaping ✅

---

### Table 4: `placement_drives`

| Attribute | Assessment |
|-----------|-----------|
| Primary Key | ✅ `drive_id INT UNSIGNED AUTO_INCREMENT` |
| Foreign Keys | ✅ `fk_drives_company → companies(company_id) ON DELETE RESTRICT` <br> ✅ `fk_drives_creator → users(user_id) ON DELETE RESTRICT` |
| NOT NULL | ✅ All key operational fields |
| CHECK Constraints | ✅ `chk_drives_package`: `package_lpa ≥ 0` <br> ✅ `chk_drives_min_cgpa`: `0.00 ≤ minimum_cgpa ≤ 10.00` <br> ✅ `chk_drives_max_backlogs`: `maximum_backlogs ≥ 0` |
| Indexes | ✅ Composite index on `(minimum_cgpa, maximum_backlogs)` for eligibility queries — excellent |

**Data Observations from seed (15 drives):**
- Drive status values used: `open` (13 drives), `closed` (1 drive — TCS Ninja, drive_id 10)
- **No `upcoming`, `completed`, or `cancelled` drives in seed** — these statuses exist in ENUM but lack test data
- Package range: **3.60 – 45.00 LPA** — wide, realistic spread ✅
- CGPA thresholds: 6.00 (3 drives), 6.50 (2), 7.00 (3), 7.50 (3), 8.00 (3), 8.50 (1) — good distribution
- `created_by` is always `user_id = 1` (admin) in seed — expected for single-admin setup
- Drive 10 (TCS Ninja) `application_deadline = '2026-08-31'` is in the past relative to other drives — correctly reflects a closed drive ✅

---

### Table 5: `applications`

| Attribute | Assessment |
|-----------|-----------|
| Primary Key | ✅ `application_id INT UNSIGNED AUTO_INCREMENT` |
| Unique Constraint | ✅ `uq_student_drive (student_id, drive_id)` — prevents duplicate applications |
| Foreign Keys | ✅ `→ students(student_id) ON DELETE CASCADE` <br> ✅ `→ placement_drives(drive_id) ON DELETE CASCADE` |
| NOT NULL | ✅ `application_status`, `eligibility_checked` |
| Nullable Columns | ⚠️ `eligibility_notes`, `admin_notes` — nullable is correct here |

**Data Observations from seed (60+ applications):**
- Application status values used: `applied`, `shortlisted`, `in_progress`, `selected`, `rejected` — all 5 ENUM values represented ✅
- `eligibility_checked = 1` for all seeded records — good, confirms admin has verified eligibility
- Student Kabir Mehta (student_id 5, CGPA 7.80) has a `rejected` application for Infosys SP (drive 7, min CGPA 7.0) — rejected on technical test performance, not eligibility; this is valid ✅
- No student has applied to Drive 10 (TCS Ninja, `closed`) in the sample — data integrity respected ✅

---

### Table 6: `skills`

| Attribute | Assessment |
|-----------|-----------|
| Primary Key | ✅ `skill_id INT UNSIGNED AUTO_INCREMENT` |
| Unique Constraints | ✅ `skill_name UNIQUE` |
| NOT NULL | ✅ `skill_name` |
| Indexes | ✅ `idx_skills_name` |

**Data Observations (20 skills):**
- Well-structured taxonomy covering languages, frameworks, domains, and system-level skills ✅
- Skill names like `MySQL & Relational Databases`, `Node.js & Express.js` use `&` — ensure consistent display encoding in frontend

---

### Table 7: `student_skills` (Junction)

| Attribute | Assessment |
|-----------|-----------|
| Primary Key | ✅ Composite `(student_id, skill_id)` |
| Foreign Keys | ✅ `→ students` CASCADE, `→ skills` RESTRICT |
| Proficiency ENUM | ✅ `'beginner', 'intermediate', 'advanced'` |
| Indexes | ✅ `idx_studskills_skill` for skill-based queries |

**Data Observations:**
- All 50 students have at least 2–7 skills mapped — good coverage ✅
- Proficiency distribution appears realistic (mix of beginner/intermediate/advanced per student)

---

### Table 8: `drive_required_skills` (Junction)

| Attribute | Assessment |
|-----------|-----------|
| Primary Key | ✅ Composite `(drive_id, skill_id)` |
| Foreign Keys | ✅ `→ placement_drives` CASCADE, `→ skills` RESTRICT |
| `is_mandatory` | ✅ `TINYINT(1)` with DEFAULT 1 — clear mandatory/preferred distinction |
| Indexes | ✅ `idx_driveskills_skill` |

**Data Observations:**
- 15 drives each have 2–4 required skills mapped — appropriate granularity ✅
- Drive 15 (Accenture ASE) uses all optional (`is_mandatory = 0`) skills — intentionally inclusive ✅

---

### Table 9: `interview_rounds`

| Attribute | Assessment |
|-----------|-----------|
| Primary Key | ✅ `round_id INT UNSIGNED AUTO_INCREMENT` |
| Unique Constraint | ✅ `uq_app_round (application_id, round_number)` — prevents duplicate round numbers per application |
| Foreign Keys | ✅ `→ applications(application_id) ON DELETE CASCADE` |
| NOT NULL | ✅ All scheduling fields |
| Indexes | ✅ `idx_rounds_app`, `idx_rounds_schedule`, `idx_rounds_status` |

**Data Observations:**
- Sample data seeds no interview_rounds rows — this is expected since applications are still in various pre-interview stages; interview data should be added when moving to `in_progress` or `shortlisted` statuses

---

### Table 10: `interview_results`

| Attribute | Assessment |
|-----------|-----------|
| Primary Key | ✅ `result_id INT UNSIGNED AUTO_INCREMENT` |
| Unique Constraint | ✅ `round_id UNIQUE` — 1:1 mapping with interview_rounds |
| Foreign Keys | ✅ `→ interview_rounds(round_id) ON DELETE CASCADE` <br> ✅ `→ users(user_id) ON DELETE SET NULL` for evaluator |
| `evaluated_by` | ✅ Nullable (evaluator may be deleted but result persists) — good soft-delete pattern |

---

### Table 11: `notifications`

| Attribute | Assessment |
|-----------|-----------|
| Primary Key | ✅ `notification_id INT UNSIGNED AUTO_INCREMENT` |
| Foreign Keys | ✅ `→ users(user_id) ON DELETE CASCADE` |
| NOT NULL | ✅ `title`, `message`, `notification_type`, `is_read` |
| Indexes | ✅ Composite `idx_notifications_user_read (user_id, is_read)` — optimal for unread notification queries |
| `notification_type` ENUM | ✅ `'drive_alert', 'application_status', 'interview_schedule', 'general'` |

---

## 2. ENUM Value Inventory

### `users.role`
| Value | Used in Seed |
|-------|-------------|
| `admin` | ✅ 1 user |
| `student` | ✅ 50 users |
| `recruiter` | ❌ None — ENUM member exists but no data |

### `users.account_status`
| Value | Used in Seed |
|-------|-------------|
| `active` | ✅ All 51 users |
| `inactive` | ❌ None in seed |
| `suspended` | ❌ None in seed |

> [!NOTE] Recommendation: Add at least one `suspended` or `inactive` user to seed data for testing admin moderation features.

### `companies.company_status`
| Value | Used in Seed |
|-------|-------------|
| `active` | ✅ All 20 companies |
| `inactive` | ❌ None in seed |

### `placement_drives.drive_status`
| Value | Used in Seed |
|-------|-------------|
| `open` | ✅ 13 of 15 drives |
| `closed` | ✅ 1 drive (TCS Ninja) |
| `upcoming` | ❌ None in seed |
| `completed` | ❌ None in seed |
| `cancelled` | ❌ None in seed |

### `applications.application_status`
| Value | Used in Seed |
|-------|-------------|
| `applied` | ✅ Present |
| `shortlisted` | ✅ Present |
| `in_progress` | ✅ Present |
| `selected` | ✅ Present |
| `rejected` | ✅ Present |

**All 5 application statuses are represented** ✅

### `placement_drives.employment_type`
| Value | Used in Seed |
|-------|-------------|
| `Full-Time` | ✅ 12 drives |
| `Internship` | ✅ 1 drive (Google STEP) |
| `Intern + PPO` | ✅ 1 drive (Zomato) |

### `interview_rounds.round_status`
| Value | Used in Seed |
|-------|-------------|
| `scheduled` | ❌ No rounds seeded |
| `completed` | ❌ No rounds seeded |
| `cancelled` | ❌ No rounds seeded |

### `interview_results.result_status`
| Value | Used in Seed |
|-------|-------------|
| `pending` | ❌ No results seeded |
| `passed` | ❌ No results seeded |
| `failed` | ❌ No results seeded |

### `student_skills.proficiency`
| Value | Used in Seed |
|-------|-------------|
| `beginner` | ✅ Present |
| `intermediate` | ✅ Present |
| `advanced` | ✅ Present |

---

## 3. Potential Data Quality Issues

### 3.1 Email Format Validation
- **Schema constraint:** `CHECK (email LIKE '%@%.%')` and `CHECK (contact_email LIKE '%@%.%')`
- **Risk:** The LIKE pattern is permissive. Values like `a@b.c`, `test@@domain.com`, or `user@.com` could pass.
- **Recommendation:** Add application-layer email validation using a regex or library (e.g., `validator.js` `isEmail()`). Consider a stricter CHECK for production.

### 3.2 CGPA Range (0.00 – 10.00)
- **Schema constraint:** `CHECK (cgpa >= 0.00 AND cgpa <= 10.00)` ✅
- **Seed data range:** 6.50 – 9.55 ✅ — all within bounds
- **Risk:** CGPA = 0.00 is technically allowed; application logic should enforce minimum meaningful values if needed.
- **Recommendation:** Add a UI-level warning if CGPA is entered below 4.0 (likely a data entry error).

### 3.3 Active Backlogs (≥ 0)
- **Schema constraint:** `CHECK (active_backlogs >= 0)` and `INT UNSIGNED` ✅
- **Seed data:** Max backlogs = 2 (students 10, 28, 48)
- **Risk:** No upper bound on backlogs. A student with 99 backlogs would pass the constraint.
- **Recommendation:** Add an application-level validation capping `active_backlogs` at a reasonable maximum (e.g., 10).

### 3.4 Resume URL Validity
- **Schema:** `resume_url VARCHAR(255) NULL` — no format constraint
- **Seed data:** All URLs are placeholder `https://drive.google.com/resume/<name>` values
- **Risk:** No validation of URL accessibility or file type (PDF expected).
- **Recommendation:** Add URL format validation on the API layer. Consider storing file references in a managed storage system (e.g., cloud bucket) and validating MIME type on upload.

### 3.5 Phone Number Format
- **Schema:** `phone VARCHAR(20) NULL` — no format constraint
- **Seed data:** Format is `+91-XXXXXXXXXX` (consistent in seed)
- **Risk:** Real user input may vary (`+91 9876543210`, `09876543210`, etc.)
- **Recommendation:** Normalize phone numbers at input time. Consider adding a CHECK constraint or using E.164 format validation.

### 3.6 Password Hashing
- **Schema:** `password_hash VARCHAR(255) NOT NULL` ✅
- **Seed data:** bcrypt hashes starting with `$2b$10$` — correct bcrypt v2b format ✅
- **Risk:** If the application ever changes hashing algorithms, existing hashes will not automatically migrate.
- **Recommendation:** Store the algorithm identifier separately or rely on bcrypt's self-identifying format. The current approach is standard and acceptable.

### 3.7 `graduation_year` as YEAR Type
- **Schema:** `graduation_year YEAR NOT NULL`
- **Seed data:** All students have `graduation_year = 2025`
- **Risk:** MySQL `YEAR` type stores 2-digit or 4-digit years. Values must be 1901–2155 for 4-digit format.
- **Recommendation:** No issue currently, but ensure the application sends 4-digit years (`2025`, not `25`).

### 3.8 Missing `updated_at` on `companies` and `notifications`
- `companies` table has only `created_at` (no `updated_at`)
- `notifications` table has only `created_at` (no `updated_at`)
- **Recommendation:** Add `updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` to both tables in a future migration for audit trail completeness.

### 3.9 Recruiter Role Orphans
- The `users` table ENUM includes `'recruiter'` but no recruiter accounts exist.
- If company contacts are ever given portal access, they should be linked via a separate `company_users` or similar junction table to preserve the `companies` relationship.

---

## 4. Referential Integrity Summary

| Relationship | Delete Rule | Assessment |
|---|---|---|
| `students → users` | `CASCADE` | ✅ Deleting a user deletes their student profile |
| `placement_drives → companies` | `RESTRICT` | ✅ Cannot delete a company with active drives |
| `placement_drives → users` (creator) | `RESTRICT` | ✅ Cannot delete the creating admin |
| `applications → students` | `CASCADE` | ✅ Student deletion cascades to applications |
| `applications → placement_drives` | `CASCADE` | ✅ Drive deletion cascades to applications |
| `interview_rounds → applications` | `CASCADE` | ✅ Cascades through the chain |
| `interview_results → interview_rounds` | `CASCADE` | ✅ Cascades through the chain |
| `interview_results → users` (evaluator) | `SET NULL` | ✅ Preserves result even if evaluator is deleted |
| `notifications → users` | `CASCADE` | ✅ Notifications deleted with user |
| `student_skills → students` | `CASCADE` | ✅ Skills cleared on student deletion |
| `student_skills → skills` | `RESTRICT` | ✅ Cannot delete a skill in use |
| `drive_required_skills → drives` | `CASCADE` | ✅ Skill requirements deleted with drive |
| `drive_required_skills → skills` | `RESTRICT` | ✅ Cannot delete a skill in use |

---

## 5. Index Coverage Analysis

| Table | Query Pattern | Index |
|---|---|---|
| `users` | Login by email | ✅ `idx_users_email` |
| `users` | Filter by role/status | ✅ `idx_users_role`, `idx_users_status` |
| `students` | Eligibility filter (CGPA + backlogs) | ✅ `idx_students_cgpa`, `idx_students_backlogs` |
| `students` | Graduation year filter | ✅ `idx_students_grad_year` |
| `placement_drives` | Eligibility criteria join | ✅ Composite `(minimum_cgpa, maximum_backlogs)` |
| `placement_drives` | Status filter, deadline sort | ✅ `idx_drives_status`, `idx_drives_deadline` |
| `applications` | Student dashboard | ✅ `idx_applications_student` |
| `applications` | Drive applicant list | ✅ `idx_applications_drive` |
| `applications` | Status reporting | ✅ `idx_applications_status` |
| `notifications` | Unread notification fetch | ✅ Composite `(user_id, is_read)` |
| `interview_rounds` | Schedule view | ✅ `idx_rounds_schedule`, `idx_rounds_app` |

**Gap:** No index on `students.user_id` — though it has a `UNIQUE` constraint which implicitly creates an index ✅

---

## 6. Recommendations for Migrations / Future Constraints

| # | Recommendation | Priority | Migration Needed |
|---|---|---|---|
| 1 | Add `updated_at` to `companies` table | Medium | `ALTER TABLE companies ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;` |
| 2 | Add `updated_at` to `notifications` table | Low | `ALTER TABLE notifications ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;` |
| 3 | Add seed data for `inactive`/`suspended` users | Low | Add to `02_sample_data.sql` |
| 4 | Add seed data for `upcoming`/`completed` drives | Low | Add to `02_sample_data.sql` |
| 5 | Add seed data for `inactive` companies | Low | Add to `02_sample_data.sql` |
| 6 | Seed at least minimal `interview_rounds` data | Medium | Add to `02_sample_data.sql` for `in_progress`/`selected` applications |
| 7 | Add phone format CHECK or normalize on insert | Medium | App-layer validation |
| 8 | Add maximum backlog advisory validation | Low | App-layer only |
| 9 | Validate resume URL format and accessibility | Medium | App-layer, possibly background job |
| 10 | Consider soft-delete pattern for users | Low | Add `deleted_at TIMESTAMP NULL` column if needed |
| 11 | Add `INDEX` on `placement_drives.company_id` explicitly | Low | Already covered by FK constraint index in InnoDB ✅ |
| 12 | Add `SELECT` audit log table for sensitive data access | Low | New table migration |

---

## 7. Summary

| Dimension | Status |
|---|---|
| Schema normalization (3NF) | ✅ Fully normalized |
| Primary keys on all tables | ✅ All 11 tables |
| Foreign key constraints | ✅ All relationships enforced |
| CHECK constraints for data ranges | ✅ CGPA, backlogs, package, email format |
| NOT NULL coverage | ✅ All critical fields |
| Index coverage | ✅ Comprehensive, including composite indexes |
| ENUM usage for status fields | ✅ Consistent across all status columns |
| Seed data completeness | ⚠️ Some ENUM values not represented in seed |
| `updated_at` audit columns | ⚠️ Missing on `companies` and `notifications` |
| Data referential integrity | ✅ All cascade/restrict rules appropriate |

> [!IMPORTANT] This report is **read-only**. No changes have been made to the database schema or data. All recommendations above require deliberate migration scripts and testing before application.
