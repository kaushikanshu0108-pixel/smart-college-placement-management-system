/**
 * Placement Admin Portal Routes
 * Smart College Placement Management System
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

// All routes in this file require placement admin privileges
router.use(requireAuth, requireRole('admin'));

// GET /api/admin/metrics
router.get('/metrics', async (req, res) => {
    try {
        // Overall Student & Placement Metrics
        const [studentCounts] = await pool.query(`
            SELECT 
                COUNT(*) AS total_students,
                ROUND(AVG(cgpa), 2) AS avg_cgpa
            FROM students
        `);

        const [placedCounts] = await pool.query(`
            SELECT 
                COUNT(DISTINCT student_id) AS placed_students
            FROM applications
            WHERE application_status = 'selected'
        `);

        const [companyCounts] = await pool.query(`
            SELECT 
                COUNT(*) AS total_companies,
                SUM(CASE WHEN company_status = 'active' THEN 1 ELSE 0 END) AS active_companies
            FROM companies
        `);

        const [driveCounts] = await pool.query(`
            SELECT 
                COUNT(*) AS total_drives,
                SUM(CASE WHEN drive_status = 'open' THEN 1 ELSE 0 END) AS active_drives,
                ROUND(AVG(package_lpa), 2) AS avg_package_lpa,
                MAX(package_lpa) AS max_package_lpa,
                MIN(package_lpa) AS min_package_lpa
            FROM placement_drives
        `);

        const [appCounts] = await pool.query(`
            SELECT 
                COUNT(*) AS total_applications,
                SUM(CASE WHEN application_status = 'shortlisted' THEN 1 ELSE 0 END) AS shortlisted_count,
                SUM(CASE WHEN application_status = 'selected' THEN 1 ELSE 0 END) AS selected_count
            FROM applications
        `);

        // Branch-wise placement summary (from Report 3)
        const [branchSummary] = await pool.query(`
            SELECT 
                s.branch,
                COUNT(DISTINCT s.student_id) AS total_enrolled,
                COUNT(DISTINCT CASE WHEN a.application_status = 'selected' THEN s.student_id END) AS total_placed,
                ROUND(
                    (COUNT(DISTINCT CASE WHEN a.application_status = 'selected' THEN s.student_id END) * 100.0) / 
                    NULLIF(COUNT(DISTINCT s.student_id), 0), 
                    1
                ) AS placement_percentage,
                ROUND(AVG(s.cgpa), 2) AS branch_avg_cgpa
            FROM students s
            LEFT JOIN applications a ON s.student_id = a.student_id
            GROUP BY s.branch
            ORDER BY total_enrolled DESC
        `);

        const totalStudents = studentCounts[0].total_students || 0;
        const placedStudents = placedCounts[0].placed_students || 0;
        const placementRate = totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) : 0;

        return res.json({
            success: true,
            data: {
                totalStudents,
                placedStudents,
                unplacedStudents: Math.max(0, totalStudents - placedStudents),
                placementRate,
                avgCgpa: studentCounts[0].avg_cgpa || 0,
                totalCompanies: companyCounts[0].total_companies || 0,
                activeCompanies: companyCounts[0].active_companies || 0,
                totalDrives: driveCounts[0].total_drives || 0,
                activeDrives: driveCounts[0].active_drives || 0,
                avgPackageLpa: driveCounts[0].avg_package_lpa || 0,
                maxPackageLpa: driveCounts[0].max_package_lpa || 0,
                minPackageLpa: driveCounts[0].min_package_lpa || 0,
                totalApplications: appCounts[0].total_applications || 0,
                shortlistedCount: appCounts[0].shortlisted_count || 0,
                selectedCount: appCounts[0].selected_count || 0,
                branchSummary
            }
        });
    } catch (error) {
        console.error('Error fetching admin metrics:', error);
        return res.status(500).json({ success: false, message: 'Server error retrieving placement metrics.' });
    }
});

// GET /api/admin/students
router.get('/students', async (req, res) => {
    try {
        const { branch, min_cgpa, max_backlogs, status, search } = req.query;

        let query = `
            SELECT 
                s.student_id, s.user_id, s.university_roll_no, s.branch, s.graduation_year,
                s.cgpa, s.active_backlogs, s.phone, s.resume_url, s.profile_summary,
                u.full_name, u.email, u.account_status,
                CASE 
                    WHEN EXISTS (SELECT 1 FROM applications a WHERE a.student_id = s.student_id AND a.application_status = 'selected') 
                    THEN 'Placed' 
                    ELSE 'Seeking' 
                END AS placement_status,
                (SELECT COUNT(*) FROM applications a WHERE a.student_id = s.student_id) AS applications_count
            FROM students s
            JOIN users u ON s.user_id = u.user_id
            WHERE 1=1
        `;
        const params = [];

        if (branch) {
            query += ' AND s.branch = ?';
            params.push(branch);
        }
        if (min_cgpa) {
            query += ' AND s.cgpa >= ?';
            params.push(min_cgpa);
        }
        if (max_backlogs !== undefined && max_backlogs !== '') {
            query += ' AND s.active_backlogs <= ?';
            params.push(max_backlogs);
        }
        if (status) {
            query += ' AND u.account_status = ?';
            params.push(status);
        }
        if (search) {
            query += ' AND (u.full_name LIKE ? OR s.university_roll_no LIKE ? OR u.email LIKE ?)';
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam);
        }

        query += ' ORDER BY s.cgpa DESC';

        const [students] = await pool.query(query, params);

        return res.json({
            success: true,
            data: students
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        return res.status(500).json({ success: false, message: 'Server error retrieving students.' });
    }
});

// PUT /api/admin/students/:id/status
router.put('/students/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['active', 'inactive', 'suspended'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status.' });
        }

        const [stud] = await pool.query('SELECT user_id FROM students WHERE student_id = ?', [req.params.id]);
        if (stud.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }

        await pool.query('UPDATE users SET account_status = ? WHERE user_id = ?', [status, stud[0].user_id]);

        return res.json({ success: true, message: `Student account set to ${status}.` });
    } catch (error) {
        console.error('Error updating student status:', error);
        return res.status(500).json({ success: false, message: 'Failed to update student status.' });
    }
});

// GET /api/admin/companies
router.get('/companies', async (req, res) => {
    try {
        const [companies] = await pool.query(`
            SELECT 
                c.company_id, c.company_name, c.industry, c.website,
                c.contact_name, c.contact_email, c.contact_phone, c.company_status, c.created_at,
                COUNT(pd.drive_id) AS total_drives
            FROM companies c
            LEFT JOIN placement_drives pd ON c.company_id = pd.company_id
            GROUP BY c.company_id
            ORDER BY c.company_name ASC
        `);

        return res.json({ success: true, data: companies });
    } catch (error) {
        console.error('Error fetching companies:', error);
        return res.status(500).json({ success: false, message: 'Server error retrieving companies.' });
    }
});

// POST /api/admin/companies
router.post('/companies', async (req, res) => {
    try {
        const { company_name, industry, website, contact_name, contact_email, contact_phone } = req.body;

        if (!company_name || !industry || !contact_name || !contact_email) {
            return res.status(400).json({
                success: false,
                message: 'Company name, industry, contact name, and contact email are required.'
            });
        }

        const [result] = await pool.query(`
            INSERT INTO companies (company_name, industry, website, contact_name, contact_email, contact_phone)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [company_name.trim(), industry.trim(), website || null, contact_name.trim(), contact_email.trim(), contact_phone || null]);

        return res.json({
            success: true,
            message: 'Company registered successfully.',
            companyId: result.insertId
        });
    } catch (error) {
        console.error('Error adding company:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'A company with this name already exists.' });
        }
        return res.status(500).json({ success: false, message: 'Failed to register company.' });
    }
});

// GET /api/admin/drives
router.get('/drives', async (req, res) => {
    try {
        const [drives] = await pool.query(`
            SELECT 
                pd.drive_id, pd.drive_title, pd.job_role, pd.job_description,
                pd.job_location, pd.employment_type, pd.package_lpa,
                pd.minimum_cgpa, pd.maximum_backlogs, pd.application_deadline,
                pd.drive_status, pd.created_at,
                c.company_id, c.company_name, c.industry,
                COUNT(a.application_id) AS total_applicants,
                SUM(CASE WHEN a.application_status = 'selected' THEN 1 ELSE 0 END) AS selected_count,
                SUM(CASE WHEN a.application_status = 'shortlisted' THEN 1 ELSE 0 END) AS shortlisted_count
            FROM placement_drives pd
            JOIN companies c ON pd.company_id = c.company_id
            LEFT JOIN applications a ON pd.drive_id = a.drive_id
            GROUP BY pd.drive_id
            ORDER BY pd.created_at DESC
        `);

        // Fetch skills for each drive
        const [skills] = await pool.query(`
            SELECT drs.drive_id, drs.skill_id, drs.is_mandatory, s.skill_name
            FROM drive_required_skills drs
            JOIN skills s ON drs.skill_id = s.skill_id
        `);

        const skillsMap = {};
        for (const s of skills) {
            if (!skillsMap[s.drive_id]) skillsMap[s.drive_id] = [];
            skillsMap[s.drive_id].push(s);
        }

        const drivesWithSkills = drives.map(d => ({
            ...d,
            skills: skillsMap[d.drive_id] || []
        }));

        return res.json({ success: true, data: drivesWithSkills });
    } catch (error) {
        console.error('Error fetching drives:', error);
        return res.status(500).json({ success: false, message: 'Server error retrieving placement drives.' });
    }
});

// POST /api/admin/drives
router.post('/drives', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const {
            company_id, drive_title, job_role, job_description, job_location,
            employment_type, package_lpa, minimum_cgpa, maximum_backlogs,
            application_deadline, mandatory_skills, preferred_skills
        } = req.body;

        if (!company_id || !drive_title || !job_role || !package_lpa || !application_deadline) {
            return res.status(400).json({
                success: false,
                message: 'Company, title, role, package, and application deadline are mandatory.'
            });
        }

        await connection.beginTransaction();

        const [insertResult] = await connection.query(`
            INSERT INTO placement_drives (
                company_id, drive_title, job_role, job_description, job_location,
                employment_type, package_lpa, minimum_cgpa, maximum_backlogs,
                application_deadline, drive_status, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?)
        `, [
            company_id,
            drive_title.trim(),
            job_role.trim(),
            job_description || null,
            job_location || 'Campus / Multiple Locations',
            employment_type || 'Full-Time',
            package_lpa,
            minimum_cgpa || 6.00,
            maximum_backlogs || 0,
            application_deadline,
            req.session.user.userId
        ]);

        const driveId = insertResult.insertId;

        // Insert mandatory skills
        if (Array.isArray(mandatory_skills) && mandatory_skills.length > 0) {
            for (const skillId of mandatory_skills) {
                await connection.query(`
                    INSERT INTO drive_required_skills (drive_id, skill_id, is_mandatory)
                    VALUES (?, ?, 1)
                `, [driveId, skillId]);
            }
        }

        // Insert preferred skills
        if (Array.isArray(preferred_skills) && preferred_skills.length > 0) {
            for (const skillId of preferred_skills) {
                await connection.query(`
                    INSERT INTO drive_required_skills (drive_id, skill_id, is_mandatory)
                    VALUES (?, ?, 0)
                `, [driveId, skillId]);
            }
        }

        await connection.commit();

        return res.json({
            success: true,
            message: 'Placement drive created and published successfully.',
            driveId
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error creating drive:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to create placement drive.'
        });
    } finally {
        connection.release();
    }
});

// PUT /api/admin/drives/:id/status
router.put('/drives/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['upcoming', 'open', 'closed', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid drive status.' });
        }

        await pool.query(
            'UPDATE placement_drives SET drive_status = ? WHERE drive_id = ?',
            [status, req.params.id]
        );

        return res.json({
            success: true,
            message: `Drive status updated to '${status}'.`
        });
    } catch (error) {
        console.error('Error updating drive status:', error);
        return res.status(500).json({ success: false, message: 'Failed to update drive status.' });
    }
});

// GET /api/admin/applications
router.get('/applications', async (req, res) => {
    try {
        const { drive_id, status } = req.query;

        let query = `
            SELECT 
                a.application_id, a.student_id, a.drive_id, a.application_date,
                a.application_status, a.eligibility_notes, a.admin_notes,
                s.university_roll_no, s.branch, s.cgpa, s.active_backlogs, s.phone, s.resume_url,
                u.full_name AS student_name, u.email AS student_email,
                pd.drive_title, pd.job_role, pd.package_lpa,
                c.company_name
            FROM applications a
            JOIN students s ON a.student_id = s.student_id
            JOIN users u ON s.user_id = u.user_id
            JOIN placement_drives pd ON a.drive_id = pd.drive_id
            JOIN companies c ON pd.company_id = c.company_id
            WHERE 1=1
        `;
        const params = [];

        if (drive_id) {
            query += ' AND a.drive_id = ?';
            params.push(drive_id);
        }
        if (status) {
            query += ' AND a.application_status = ?';
            params.push(status);
        }

        query += ' ORDER BY a.application_date DESC';

        const [applications] = await pool.query(query, params);

        return res.json({
            success: true,
            data: applications
        });
    } catch (error) {
        console.error('Error fetching applications:', error);
        return res.status(500).json({ success: false, message: 'Server error retrieving applications.' });
    }
});

// PUT /api/admin/applications/:id/status
router.put('/applications/:id/status', async (req, res) => {
    try {
        const { status, admin_notes } = req.body;
        const validStatuses = ['applied', 'shortlisted', 'in_progress', 'selected', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid application status.' });
        }

        const [app] = await pool.query(`
            SELECT a.student_id, s.user_id, pd.drive_title
            FROM applications a
            JOIN students s ON a.student_id = s.student_id
            JOIN placement_drives pd ON a.drive_id = pd.drive_id
            WHERE a.application_id = ?
        `, [req.params.id]);

        if (app.length === 0) {
            return res.status(404).json({ success: false, message: 'Application not found.' });
        }

        await pool.query(`
            UPDATE applications 
            SET application_status = ?, admin_notes = COALESCE(?, admin_notes)
            WHERE application_id = ?
        `, [status, admin_notes || null, req.params.id]);

        // Send student an alert notification
        let alertTitle = 'Application Status Update';
        let alertMsg = `Your application for '${app[0].drive_title}' is now marked as ${status.toUpperCase()}.`;
        if (status === 'selected') {
            alertTitle = '🎉 Congratulations! Placement Offer Received';
            alertMsg = `Congratulations! You have been SELECTED for '${app[0].drive_title}'. Check details in your portal.`;
        } else if (status === 'shortlisted') {
            alertTitle = 'Application Shortlisted';
            alertMsg = `Good news! Your profile has been shortlisted for '${app[0].drive_title}'.`;
        }

        await pool.query(`
            INSERT INTO notifications (user_id, title, message, notification_type)
            VALUES (?, ?, ?, 'application_status')
        `, [app[0].user_id, alertTitle, alertMsg]);

        return res.json({
            success: true,
            message: `Application marked as '${status}'. Notification sent to student.`
        });
    } catch (error) {
        console.error('Error updating application status:', error);
        return res.status(500).json({ success: false, message: 'Failed to update application status.' });
    }
});

// POST /api/admin/interviews/schedule
router.post('/interviews/schedule', async (req, res) => {
    try {
        const { application_id, round_number, round_name, scheduled_at, interview_mode, meeting_or_venue } = req.body;

        if (!application_id || !round_number || !round_name || !scheduled_at || !meeting_or_venue) {
            return res.status(400).json({
                success: false,
                message: 'All interview schedule fields are required.'
            });
        }

        // Upsert interview round
        const [result] = await pool.query(`
            INSERT INTO interview_rounds (
                application_id, round_number, round_name, scheduled_at, interview_mode, meeting_or_venue, round_status
            ) VALUES (?, ?, ?, ?, ?, ?, 'scheduled')
            ON DUPLICATE KEY UPDATE
                round_name = VALUES(round_name),
                scheduled_at = VALUES(scheduled_at),
                interview_mode = VALUES(interview_mode),
                meeting_or_venue = VALUES(meeting_or_venue),
                round_status = 'scheduled'
        `, [
            application_id, round_number, round_name.trim(),
            scheduled_at, interview_mode || 'offline', meeting_or_venue.trim()
        ]);

        // Automatically set application status to in_progress
        await pool.query(
            "UPDATE applications SET application_status = 'in_progress' WHERE application_id = ?",
            [application_id]
        );

        // Notify student
        const [appData] = await pool.query(`
            SELECT s.user_id, pd.drive_title
            FROM applications a
            JOIN students s ON a.student_id = s.student_id
            JOIN placement_drives pd ON a.drive_id = pd.drive_id
            WHERE a.application_id = ?
        `, [application_id]);

        if (appData.length > 0) {
            await pool.query(`
                INSERT INTO notifications (user_id, title, message, notification_type)
                VALUES (?, ?, ?, 'interview_schedule')
            `, [
                appData[0].user_id,
                `Interview Call: Round ${round_number} (${round_name})`,
                `You have an interview scheduled for '${appData[0].drive_title}' on ${scheduled_at}. Mode: ${interview_mode}. Location/Link: ${meeting_or_venue}.`
            ]);
        }

        return res.json({
            success: true,
            message: `Interview Round ${round_number} scheduled successfully!`
        });
    } catch (error) {
        console.error('Error scheduling interview:', error);
        return res.status(500).json({ success: false, message: 'Failed to schedule interview round.' });
    }
});

// POST /api/admin/interviews/result
router.post('/interviews/result', async (req, res) => {
    try {
        const { round_id, result_status, feedback } = req.body;
        if (!round_id || !result_status) {
            return res.status(400).json({ success: false, message: 'Round ID and result status are required.' });
        }

        await pool.query(`
            INSERT INTO interview_results (round_id, result_status, feedback, evaluated_by)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                result_status = VALUES(result_status),
                feedback = VALUES(feedback),
                evaluated_by = VALUES(evaluated_by)
        `, [round_id, result_status, feedback || null, req.session.user.userId]);

        // Update round status to completed
        await pool.query("UPDATE interview_rounds SET round_status = 'completed' WHERE round_id = ?", [round_id]);

        return res.json({
            success: true,
            message: `Interview result saved as '${result_status}'.`
        });
    } catch (error) {
        console.error('Error recording interview result:', error);
        return res.status(500).json({ success: false, message: 'Failed to record interview result.' });
    }
});

// GET /api/admin/reports/csv
router.get('/reports/csv', async (req, res) => {
    try {
        const { type } = req.query; // 'placed', 'drives', 'branches'

        if (type === 'placed') {
            const [rows] = await pool.query(`
                SELECT 
                    s.university_roll_no AS "Roll Number",
                    u.full_name AS "Student Name",
                    s.branch AS "Branch",
                    s.cgpa AS "CGPA",
                    c.company_name AS "Selected Company",
                    pd.job_role AS "Job Role",
                    pd.package_lpa AS "Package (LPA)",
                    DATE_FORMAT(a.application_date, '%Y-%m-%d') AS "Placement Date"
                FROM applications a
                JOIN students s ON a.student_id = s.student_id
                JOIN users u ON s.user_id = u.user_id
                JOIN placement_drives pd ON a.drive_id = pd.drive_id
                JOIN companies c ON pd.company_id = c.company_id
                WHERE a.application_status = 'selected'
                ORDER BY pd.package_lpa DESC
            `);

            return sendCsv(res, 'placed_students_report.csv', rows);
        } else if (type === 'drives') {
            const [rows] = await pool.query(`
                SELECT 
                    pd.drive_title AS "Drive Title",
                    c.company_name AS "Company",
                    pd.job_role AS "Role",
                    pd.package_lpa AS "Package (LPA)",
                    pd.minimum_cgpa AS "Min CGPA",
                    pd.maximum_backlogs AS "Max Backlogs",
                    pd.drive_status AS "Status",
                    COUNT(a.application_id) AS "Total Applicants",
                    SUM(CASE WHEN a.application_status = 'selected' THEN 1 ELSE 0 END) AS "Selected Candidates"
                FROM placement_drives pd
                JOIN companies c ON pd.company_id = c.company_id
                LEFT JOIN applications a ON pd.drive_id = a.drive_id
                GROUP BY pd.drive_id
                ORDER BY pd.package_lpa DESC
            `);

            return sendCsv(res, 'placement_drives_summary.csv', rows);
        } else {
            // Default: branch analytics
            const [rows] = await pool.query(`
                SELECT 
                    s.branch AS "Branch",
                    COUNT(DISTINCT s.student_id) AS "Total Students",
                    COUNT(DISTINCT CASE WHEN a.application_status = 'selected' THEN s.student_id END) AS "Placed Students",
                    ROUND(
                        (COUNT(DISTINCT CASE WHEN a.application_status = 'selected' THEN s.student_id END) * 100.0) / 
                        NULLIF(COUNT(DISTINCT s.student_id), 0), 1
                    ) AS "Placement Rate (%)",
                    ROUND(AVG(s.cgpa), 2) AS "Average CGPA"
                FROM students s
                LEFT JOIN applications a ON s.student_id = a.student_id
                GROUP BY s.branch
                ORDER BY "Placement Rate (%)" DESC
            `);

            return sendCsv(res, 'branch_placement_analytics.csv', rows);
        }
    } catch (error) {
        console.error('Error generating CSV report:', error);
        return res.status(500).json({ success: false, message: 'Failed to generate CSV export.' });
    }
});

function sendCsv(res, filename, rows) {
    if (!rows || rows.length === 0) {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send('No records found');
    }

    const headers = Object.keys(rows[0]);
    const csvLines = [headers.map(h => `"${h}"`).join(',')];

    for (const row of rows) {
        const line = headers.map(h => {
            const val = row[h] !== null && row[h] !== undefined ? String(row[h]) : '';
            return `"${val.replace(/"/g, '""')}"`;
        }).join(',');
        csvLines.push(line);
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csvLines.join('\n'));
}

// POST /api/admin/students - Onboard new student
router.post('/students', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { full_name, email, password, university_roll_no, branch, graduation_year, cgpa, active_backlogs, phone } = req.body;

        if (!full_name || !email || !university_roll_no || !branch || !graduation_year || cgpa === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Full name, email, roll number, branch, batch year, and CGPA are mandatory.'
            });
        }

        const rawPassword = password || 'Student@123';
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(rawPassword, salt);

        await connection.beginTransaction();

        const [userResult] = await connection.query(`
            INSERT INTO users (full_name, email, password_hash, role, account_status)
            VALUES (?, ?, ?, 'student', 'active')
        `, [full_name.trim(), email.trim().toLowerCase(), passwordHash]);

        const userId = userResult.insertId;

        const [studentResult] = await connection.query(`
            INSERT INTO students (user_id, university_roll_no, branch, graduation_year, cgpa, active_backlogs, phone)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            userId,
            university_roll_no.trim().toUpperCase(),
            branch.trim(),
            graduation_year,
            parseFloat(cgpa),
            parseInt(active_backlogs, 10) || 0,
            phone ? phone.trim() : null
        ]);

        await connection.commit();

        return res.json({
            success: true,
            message: `Student account created successfully for ${full_name}!`,
            studentId: studentResult.insertId,
            userId
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error creating student:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Email or University Roll Number already registered.' });
        }
        return res.status(500).json({ success: false, message: error.message || 'Failed to create student.' });
    } finally {
        connection.release();
    }
});

// GET /api/admin/reports/json - Export report as downloadable JSON
router.get('/reports/json', async (req, res) => {
    try {
        const { type } = req.query;
        let data = [];
        let filename = 'report.json';

        if (type === 'placed') {
            filename = 'placed_students.json';
            const [rows] = await pool.query(`
                SELECT s.university_roll_no, u.full_name, s.branch, s.cgpa, c.company_name, pd.job_role, pd.package_lpa, a.application_date
                FROM applications a
                JOIN students s ON a.student_id = s.student_id
                JOIN users u ON s.user_id = u.user_id
                JOIN placement_drives pd ON a.drive_id = pd.drive_id
                JOIN companies c ON pd.company_id = c.company_id
                WHERE a.application_status = 'selected'
                ORDER BY pd.package_lpa DESC
            `);
            data = rows;
        } else if (type === 'drives') {
            filename = 'placement_drives.json';
            const [rows] = await pool.query(`
                SELECT pd.*, c.company_name, COUNT(a.application_id) AS total_applicants
                FROM placement_drives pd
                JOIN companies c ON pd.company_id = c.company_id
                LEFT JOIN applications a ON pd.drive_id = a.drive_id
                GROUP BY pd.drive_id
            `);
            data = rows;
        } else {
            filename = 'branch_analytics.json';
            const [rows] = await pool.query(`
                SELECT s.branch, COUNT(DISTINCT s.student_id) AS total, COUNT(DISTINCT CASE WHEN a.application_status = 'selected' THEN s.student_id END) AS placed
                FROM students s
                LEFT JOIN applications a ON s.student_id = a.student_id
                GROUP BY s.branch
            `);
            data = rows;
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error generating JSON export:', error);
        return res.status(500).json({ success: false, message: 'Could not export JSON.' });
    }
});

// ============================================================================
// LIVE DATABASE & SCHEMA INSPECTOR ENDPOINTS
// Gives students, evaluators, and admins live access to view MySQL tables
// ============================================================================

// GET /api/admin/db/tables - List all tables, engines, row counts, and data size
router.get('/db/tables', async (req, res) => {
    try {
        const [tables] = await pool.query(`
            SELECT 
                TABLE_NAME AS table_name,
                TABLE_ROWS AS approximate_rows,
                ENGINE AS engine,
                TABLE_COLLATION AS collation,
                ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024, 2) AS total_size_kb,
                CREATE_TIME AS created_at
            FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
            ORDER BY TABLE_NAME ASC
        `);

        // Also get exact counts via COUNT(*)
        const detailedTables = await Promise.all(tables.map(async (t) => {
            try {
                const [countResult] = await pool.query(`SELECT COUNT(*) AS exact_count FROM ??`, [t.table_name]);
                return {
                    ...t,
                    exact_rows: countResult[0].exact_count
                };
            } catch (e) {
                return { ...t, exact_rows: t.approximate_rows };
            }
        }));

        return res.json({
            success: true,
            database: process.env.DB_NAME || 'smart_college_placement',
            totalTables: tables.length,
            tables: detailedTables
        });
    } catch (error) {
        console.error('Error listing DB tables:', error);
        return res.status(500).json({ success: false, message: 'Could not inspect database tables.' });
    }
});

// GET /api/admin/db/table/:tableName - Inspect table columns, constraints & sample data
router.get('/db/table/:tableName', async (req, res) => {
    try {
        const { tableName } = req.params;

        // Safety verification: tableName must exist in current schema
        const [allowed] = await pool.query(
            `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
            [tableName]
        );

        if (allowed.length === 0) {
            return res.status(404).json({ success: false, message: 'Table not found in active schema.' });
        }

        // Get column definitions
        const [columns] = await pool.query(`
            SELECT 
                COLUMN_NAME AS column_name,
                COLUMN_TYPE AS data_type,
                IS_NULLABLE AS is_nullable,
                COLUMN_KEY AS column_key,
                COLUMN_DEFAULT AS default_value,
                EXTRA AS extra
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
            ORDER BY ORDINAL_POSITION ASC
        `, [tableName]);

        // Get sample rows (sanitizing passwords)
        let sampleQuery = `SELECT * FROM ?? ORDER BY 1 DESC LIMIT 15`;
        if (tableName === 'users') {
            sampleQuery = `SELECT user_id, full_name, email, '[PROTECTED BCRYPT HASH]' AS password_hash, role, account_status, created_at, updated_at FROM users ORDER BY user_id DESC LIMIT 15`;
        }
        const [rows] = await pool.query(sampleQuery, [tableName]);

        return res.json({
            success: true,
            tableName,
            columns,
            sampleRows: rows
        });
    } catch (error) {
        console.error('Error inspecting table:', error);
        return res.status(500).json({ success: false, message: 'Failed to inspect table structure.' });
    }
});

// GET /api/admin/db/diagnostics - Health check & server status
router.get('/db/diagnostics', async (req, res) => {
    try {
        const [versionRows] = await pool.query(`SELECT VERSION() AS version, DATABASE() AS database_name, NOW() AS server_time, @@hostname AS hostname`);
        const [statusRows] = await pool.query(`SHOW STATUS WHERE Variable_name IN ('Threads_connected', 'Uptime', 'Queries', 'Innodb_buffer_pool_reads')`);
        
        const statusMap = {};
        for (const r of statusRows) {
            statusMap[r.Variable_name] = r.Value;
        }

        return res.json({
            success: true,
            info: {
                version: versionRows[0].version,
                database: versionRows[0].database_name,
                serverTime: versionRows[0].server_time,
                serverHost: versionRows[0].hostname,
                activeConnections: statusMap['Threads_connected'] || 1,
                serverUptimeSeconds: statusMap['Uptime'] || 0,
                totalQueriesExecuted: statusMap['Queries'] || 0
            }
        });
    } catch (error) {
        console.error('Error getting DB diagnostics:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve database diagnostics.' });
    }
});

module.exports = router;
