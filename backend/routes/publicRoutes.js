/**
 * Public & Taxonomy Routes
 * Smart College Placement Management System
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// GET /api/public/stats - Overall stats for landing page hero counters
router.get('/public/stats', async (req, res) => {
    try {
        const [studentCount] = await pool.query('SELECT COUNT(*) AS c FROM students');
        const [companyCount] = await pool.query('SELECT COUNT(*) AS c FROM companies WHERE company_status = "active"');
        const [driveCount] = await pool.query('SELECT COUNT(*) AS c FROM placement_drives WHERE drive_status = "open"');
        const [placedCount] = await pool.query('SELECT COUNT(DISTINCT student_id) AS c FROM applications WHERE application_status = "selected"');
        const [maxPkg] = await pool.query('SELECT MAX(package_lpa) AS m FROM placement_drives');

        return res.json({
            success: true,
            data: {
                totalStudents: studentCount[0].c,
                activeCompanies: companyCount[0].c,
                activeDrives: driveCount[0].c,
                placedStudents: placedCount[0].c,
                highestPackage: maxPkg[0].m || 0
            }
        });
    } catch (error) {
        console.error('Error fetching public stats:', error);
        return res.status(500).json({ success: false, message: 'Could not load stats.' });
    }
});

// GET /api/skills - Full list of skills
router.get('/skills', async (req, res) => {
    try {
        const [skills] = await pool.query('SELECT skill_id, skill_name FROM skills ORDER BY skill_name ASC');
        return res.json({ success: true, data: skills });
    } catch (error) {
        console.error('Error fetching skills:', error);
        return res.status(500).json({ success: false, message: 'Could not fetch skills.' });
    }
});

// GET /api/public/drives - Featured open placement drives for landing page
router.get('/public/drives', async (req, res) => {
    try {
        const [drives] = await pool.query(`
            SELECT 
                pd.drive_id, pd.drive_title, pd.job_role, pd.job_location,
                pd.employment_type, pd.package_lpa, pd.minimum_cgpa, pd.application_deadline,
                c.company_name, c.industry
            FROM placement_drives pd
            JOIN companies c ON pd.company_id = c.company_id
            WHERE pd.drive_status = 'open' AND pd.application_deadline > NOW()
            ORDER BY pd.package_lpa DESC
            LIMIT 6
        `);
        return res.json({ success: true, data: drives });
    } catch (error) {
        console.error('Error fetching public drives:', error);
        return res.status(500).json({ success: false, message: 'Could not load drives.' });
    }
});

module.exports = router;
