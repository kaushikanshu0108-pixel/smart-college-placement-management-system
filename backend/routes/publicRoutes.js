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

// GET /api/support/config - Check Web3Forms configuration status & public client key
router.get('/support/config', (req, res) => {
    const accessKey = process.env.WEB3FORMS_ACCESS_KEY || '';
    return res.json({
        success: true,
        isConfigured: Boolean(accessKey && accessKey !== 'your_web3forms_access_key_here'),
        accessKey: accessKey && accessKey !== 'your_web3forms_access_key_here' ? accessKey : null
    });
});

// POST /api/support/submit - Server-side validated submission to Web3Forms
router.post('/support/submit', async (req, res) => {
    try {
        const { full_name, email, roll_number, role, subject, category, message, botcheck } = req.body;

        // Anti-spam honeypot detection
        if (botcheck) {
            return res.status(400).json({ success: false, message: 'Spam submission rejected.' });
        }

        // Validate required fields
        if (!full_name || !full_name.trim()) {
            return res.status(400).json({ success: false, message: 'Full name is required.' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email.trim())) {
            return res.status(400).json({ success: false, message: 'A valid college email address is required.' });
        }

        if (!subject || !subject.trim()) {
            return res.status(400).json({ success: false, message: 'Subject is required.' });
        }

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message content cannot be empty.' });
        }

        const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
        if (!accessKey || accessKey === 'your_web3forms_access_key_here') {
            return res.status(503).json({
                success: false,
                message: 'Support portal email dispatch is currently unconfigured. Please configure WEB3FORMS_ACCESS_KEY in .env.'
            });
        }

        // Forward to official Web3Forms API
        const payload = {
            access_key: accessKey,
            name: full_name.trim(),
            email: email.trim(),
            subject: `[SCPMS Support - ${category || 'General'}] ${subject.trim()}`,
            message: `User Role: ${role || 'Student'}\nRoll No: ${roll_number || 'N/A'}\nCategory: ${category || 'General'}\n\nMessage:\n${message.trim()}`,
            from_name: 'SCPMS Placement Portal'
        };

        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok && data.success) {
            return res.json({
                success: true,
                message: 'Your support ticket has been dispatched successfully! Our placement cell coordinators will review it shortly.'
            });
        } else {
            return res.status(response.status || 502).json({
                success: false,
                message: data.message || 'Web3Forms dispatch service returned an error. Please try again.'
            });
        }
    } catch (error) {
        console.error('Error forwarding support request:', error);
        return res.status(500).json({
            success: false,
            message: 'Server failed to transmit support ticket: ' + error.message
        });
    }
});

module.exports = router;
