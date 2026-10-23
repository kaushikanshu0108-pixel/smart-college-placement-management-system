/**
 * Student Portal Routes
 * Smart College Placement Management System
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

// All routes in this file require an active student session
router.use(requireAuth, requireRole('student'));

/**
 * Helper to get student record for current logged-in user
 */
async function getStudentForUser(userId) {
    const [rows] = await pool.query(
        'SELECT * FROM students WHERE user_id = ? LIMIT 1',
        [userId]
    );
    return rows[0] || null;
}

// GET /api/student/dashboard
router.get('/dashboard', async (req, res) => {
    try {
        const student = await getStudentForUser(req.session.user.userId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student profile not found.' });
        }

        // Summary counts
        const [appStats] = await pool.query(`
            SELECT 
                COUNT(*) AS total_applications,
                SUM(CASE WHEN application_status = 'applied' THEN 1 ELSE 0 END) AS applied_count,
                SUM(CASE WHEN application_status = 'shortlisted' THEN 1 ELSE 0 END) AS shortlisted_count,
                SUM(CASE WHEN application_status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress_count,
                SUM(CASE WHEN application_status = 'selected' THEN 1 ELSE 0 END) AS selected_count,
                SUM(CASE WHEN application_status = 'rejected' THEN 1 ELSE 0 END) AS rejected_count
            FROM applications
            WHERE student_id = ?
        `, [student.student_id]);

        // Upcoming interviews
        const [interviews] = await pool.query(`
            SELECT 
                ir.round_id, ir.round_number, ir.round_name, ir.scheduled_at, 
                ir.interview_mode, ir.meeting_or_venue, ir.round_status,
                pd.drive_title, pd.job_role, c.company_name
            FROM interview_rounds ir
            JOIN applications a ON ir.application_id = a.application_id
            JOIN placement_drives pd ON a.drive_id = pd.drive_id
            JOIN companies c ON pd.company_id = c.company_id
            WHERE a.student_id = ? AND ir.round_status = 'scheduled'
            ORDER BY ir.scheduled_at ASC
            LIMIT 5
        `, [student.student_id]);

        // Recent notifications
        const [notifications] = await pool.query(`
            SELECT notification_id, title, message, notification_type, is_read, created_at
            FROM notifications
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 5
        `, [req.session.user.userId]);

        // Count eligible open drives
        const [openDrives] = await pool.query(`
            SELECT 
                pd.drive_id, pd.drive_title, pd.minimum_cgpa, pd.maximum_backlogs,
                (SELECT COUNT(*) FROM applications a WHERE a.drive_id = pd.drive_id AND a.student_id = ?) AS has_applied
            FROM placement_drives pd
            WHERE pd.drive_status = 'open' AND pd.application_deadline > NOW()
        `, [student.student_id]);

        const eligibleCount = openDrives.filter(d => 
            Number(student.cgpa) >= Number(d.minimum_cgpa) && 
            student.active_backlogs <= d.maximum_backlogs
        ).length;

        return res.json({
            success: true,
            data: {
                student: {
                    studentId: student.student_id,
                    fullName: req.session.user.fullName,
                    email: req.session.user.email,
                    rollNo: student.university_roll_no,
                    branch: student.branch,
                    graduationYear: student.graduation_year,
                    cgpa: student.cgpa,
                    activeBacklogs: student.active_backlogs,
                    phone: student.phone,
                    resumeUrl: student.resume_url,
                    profileSummary: student.profile_summary
                },
                stats: {
                    ...appStats[0],
                    openDrivesCount: openDrives.length,
                    eligibleDrivesCount: eligibleCount
                },
                upcomingInterviews: interviews,
                notifications
            }
        });
    } catch (error) {
        console.error('Error in student dashboard:', error);
        return res.status(500).json({ success: false, message: 'Server error retrieving dashboard.' });
    }
});

// GET /api/student/profile
router.get('/profile', async (req, res) => {
    try {
        const student = await getStudentForUser(req.session.user.userId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student profile not found.' });
        }

        // Fetch skills
        const [skills] = await pool.query(`
            SELECT s.skill_id, s.skill_name, ss.proficiency
            FROM student_skills ss
            JOIN skills s ON ss.skill_id = s.skill_id
            WHERE ss.student_id = ?
            ORDER BY s.skill_name ASC
        `, [student.student_id]);

        return res.json({
            success: true,
            data: {
                ...student,
                fullName: req.session.user.fullName,
                email: req.session.user.email,
                skills
            }
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return res.status(500).json({ success: false, message: 'Server error retrieving profile.' });
    }
});

// PUT /api/student/profile
router.put('/profile', async (req, res) => {
    try {
        const student = await getStudentForUser(req.session.user.userId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student profile not found.' });
        }

        const { phone, resume_url, profile_summary } = req.body;

        await pool.query(`
            UPDATE students 
            SET phone = ?, resume_url = ?, profile_summary = ?
            WHERE student_id = ?
        `, [phone || null, resume_url || null, profile_summary || null, student.student_id]);

        return res.json({
            success: true,
            message: 'Profile updated successfully.'
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ success: false, message: 'Failed to update profile.' });
    }
});

// GET /api/student/drives
router.get('/drives', async (req, res) => {
    try {
        const student = await getStudentForUser(req.session.user.userId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student profile not found.' });
        }

        // Get student's acquired skill IDs
        const [studSkills] = await pool.query(
            'SELECT skill_id FROM student_skills WHERE student_id = ?',
            [student.student_id]
        );
        const studentSkillIds = new Set(studSkills.map(s => s.skill_id));

        // Get all drives with company details and application status
        const [drives] = await pool.query(`
            SELECT 
                pd.drive_id, pd.drive_title, pd.job_role, pd.job_description,
                pd.job_location, pd.employment_type, pd.package_lpa,
                pd.minimum_cgpa, pd.maximum_backlogs, pd.application_deadline,
                pd.drive_status, pd.created_at,
                c.company_name, c.industry, c.website,
                a.application_id, a.application_status, a.application_date
            FROM placement_drives pd
            JOIN companies c ON pd.company_id = c.company_id
            LEFT JOIN applications a ON pd.drive_id = a.drive_id AND a.student_id = ?
            ORDER BY 
                CASE 
                    WHEN pd.drive_status = 'open' AND pd.application_deadline > NOW() THEN 1 
                    WHEN pd.drive_status = 'upcoming' THEN 2 
                    ELSE 3 
                END,
                pd.application_deadline ASC
        `, [student.student_id]);

        // Fetch required skills for each drive
        const [driveSkills] = await pool.query(`
            SELECT drs.drive_id, drs.skill_id, drs.is_mandatory, s.skill_name
            FROM drive_required_skills drs
            JOIN skills s ON drs.skill_id = s.skill_id
        `);

        const driveSkillsMap = {};
        for (const ds of driveSkills) {
            if (!driveSkillsMap[ds.drive_id]) driveSkillsMap[ds.drive_id] = [];
            driveSkillsMap[ds.drive_id].push(ds);
        }

        const now = new Date();

        const formattedDrives = drives.map(drive => {
            const skillsForDrive = driveSkillsMap[drive.drive_id] || [];
            const mandatorySkills = skillsForDrive.filter(s => s.is_mandatory === 1);
            const missingMandatorySkills = mandatorySkills.filter(s => !studentSkillIds.has(s.skill_id));

            const isDeadlinePassed = new Date(drive.application_deadline) < now;
            const meetsCgpa = Number(student.cgpa) >= Number(drive.minimum_cgpa);
            const meetsBacklogs = student.active_backlogs <= drive.maximum_backlogs;
            const isOpen = drive.drive_status === 'open';
            const meetsSkills = missingMandatorySkills.length === 0;

            const isEligible = isOpen && !isDeadlinePassed && meetsCgpa && meetsBacklogs && meetsSkills;

            let ineligibilityReasons = [];
            if (!isOpen) ineligibilityReasons.push(`Drive status is '${drive.drive_status}'`);
            if (isDeadlinePassed) ineligibilityReasons.push('Application deadline has expired');
            if (!meetsCgpa) ineligibilityReasons.push(`CGPA is ${student.cgpa} (Min required: ${drive.minimum_cgpa})`);
            if (!meetsBacklogs) ineligibilityReasons.push(`Active backlogs: ${student.active_backlogs} (Max allowed: ${drive.maximum_backlogs})`);
            if (!meetsSkills) ineligibilityReasons.push(`Missing mandatory skills: ${missingMandatorySkills.map(s => s.skill_name).join(', ')}`);

            return {
                ...drive,
                requiredSkills: skillsForDrive,
                hasApplied: Boolean(drive.application_id),
                isEligible,
                ineligibilityReasons
            };
        });

        return res.json({
            success: true,
            data: formattedDrives
        });
    } catch (error) {
        console.error('Error fetching drives:', error);
        return res.status(500).json({ success: false, message: 'Server error retrieving placement drives.' });
    }
});

// POST /api/student/apply
router.post('/apply', async (req, res) => {
    try {
        const student = await getStudentForUser(req.session.user.userId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student profile not found.' });
        }

        const { drive_id } = req.body;
        if (!drive_id) {
            return res.status(400).json({ success: false, message: 'Drive ID is required.' });
        }

        // Call the stored procedure sp_apply_for_drive
        const connection = await pool.getConnection();
        try {
            await connection.query('SET @p_app_id = 0, @p_status_msg = ""');
            await connection.query('CALL sp_apply_for_drive(?, ?, @p_app_id, @p_status_msg)', [student.student_id, drive_id]);
            const [outParams] = await connection.query('SELECT @p_app_id AS application_id, @p_status_msg AS status_message');
            
            const result = outParams[0];

            if (result.application_id && result.application_id > 0) {
                return res.json({
                    success: true,
                    message: result.status_message || 'Application submitted successfully!',
                    applicationId: result.application_id
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: result.status_message || 'Application could not be processed.'
                });
            }
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error applying for drive:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Server error processing application.'
        });
    }
});

// GET /api/student/applications
router.get('/applications', async (req, res) => {
    try {
        const student = await getStudentForUser(req.session.user.userId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student profile not found.' });
        }

        const [apps] = await pool.query(`
            SELECT 
                a.application_id, a.drive_id, a.application_date, a.application_status,
                a.eligibility_notes, a.admin_notes,
                pd.drive_title, pd.job_role, pd.package_lpa, pd.job_location, pd.employment_type,
                c.company_name, c.industry, c.website
            FROM applications a
            JOIN placement_drives pd ON a.drive_id = pd.drive_id
            JOIN companies c ON pd.company_id = c.company_id
            WHERE a.student_id = ?
            ORDER BY a.application_date DESC
        `, [student.student_id]);

        if (apps.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const appIds = apps.map(a => a.application_id);
        
        // Fetch interview rounds and results for these applications
        const [rounds] = await pool.query(`
            SELECT 
                ir.round_id, ir.application_id, ir.round_number, ir.round_name,
                ir.scheduled_at, ir.interview_mode, ir.meeting_or_venue, ir.round_status,
                res.result_status, res.feedback
            FROM interview_rounds ir
            LEFT JOIN interview_results res ON ir.round_id = res.round_id
            WHERE ir.application_id IN (?)
            ORDER BY ir.application_id, ir.round_number ASC
        `, [appIds]);

        const roundsMap = {};
        for (const r of rounds) {
            if (!roundsMap[r.application_id]) roundsMap[r.application_id] = [];
            roundsMap[r.application_id].push(r);
        }

        const enrichedApps = apps.map(app => ({
            ...app,
            interviewRounds: roundsMap[app.application_id] || []
        }));

        return res.json({
            success: true,
            data: enrichedApps
        });
    } catch (error) {
        console.error('Error fetching applications:', error);
        return res.status(500).json({ success: false, message: 'Server error retrieving applications.' });
    }
});

// GET /api/student/skills
router.get('/skills', async (req, res) => {
    try {
        const student = await getStudentForUser(req.session.user.userId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student profile not found.' });
        }

        const [skills] = await pool.query(`
            SELECT s.skill_id, s.skill_name, ss.proficiency
            FROM student_skills ss
            JOIN skills s ON ss.skill_id = s.skill_id
            WHERE ss.student_id = ?
            ORDER BY s.skill_name ASC
        `, [student.student_id]);

        return res.json({ success: true, data: skills });
    } catch (error) {
        console.error('Error fetching student skills:', error);
        return res.status(500).json({ success: false, message: 'Server error retrieving skills.' });
    }
});

// POST /api/student/skills
router.post('/skills', async (req, res) => {
    try {
        const student = await getStudentForUser(req.session.user.userId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student profile not found.' });
        }

        const { skill_id, proficiency } = req.body;
        if (!skill_id) {
            return res.status(400).json({ success: false, message: 'Skill ID is required.' });
        }

        const validProficiencies = ['beginner', 'intermediate', 'advanced'];
        const chosenProficiency = validProficiencies.includes(proficiency) ? proficiency : 'intermediate';

        await pool.query(`
            INSERT INTO student_skills (student_id, skill_id, proficiency)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE proficiency = VALUES(proficiency)
        `, [student.student_id, skill_id, chosenProficiency]);

        return res.json({ success: true, message: 'Skill updated successfully.' });
    } catch (error) {
        console.error('Error saving skill:', error);
        return res.status(500).json({ success: false, message: 'Could not save skill.' });
    }
});

// DELETE /api/student/skills/:skillId
router.delete('/skills/:skillId', async (req, res) => {
    try {
        const student = await getStudentForUser(req.session.user.userId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student profile not found.' });
        }

        await pool.query(
            'DELETE FROM student_skills WHERE student_id = ? AND skill_id = ?',
            [student.student_id, req.params.skillId]
        );

        return res.json({ success: true, message: 'Skill removed.' });
    } catch (error) {
        console.error('Error deleting skill:', error);
        return res.status(500).json({ success: false, message: 'Could not remove skill.' });
    }
});

// GET /api/student/notifications
router.get('/notifications', async (req, res) => {
    try {
        const [notifications] = await pool.query(`
            SELECT notification_id, title, message, notification_type, is_read, created_at
            FROM notifications
            WHERE user_id = ?
            ORDER BY created_at DESC
        `, [req.session.user.userId]);

        return res.json({ success: true, data: notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({ success: false, message: 'Server error retrieving notifications.' });
    }
});

// PUT /api/student/notifications/:id/read
router.put('/notifications/:id/read', async (req, res) => {
    try {
        await pool.query(
            'UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?',
            [req.params.id, req.session.user.userId]
        );
        return res.json({ success: true, message: 'Notification marked as read.' });
    } catch (error) {
        console.error('Error marking notification read:', error);
        return res.status(500).json({ success: false, message: 'Could not update notification.' });
    }
});

module.exports = router;
