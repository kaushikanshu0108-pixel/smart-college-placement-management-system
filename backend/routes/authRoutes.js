/**
 * Authentication Routes
 * Smart College Placement Management System
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.'
            });
        }

        const [users] = await pool.query(
            'SELECT user_id, full_name, email, password_hash, role, account_status FROM users WHERE email = ? LIMIT 1',
            [email.trim().toLowerCase()]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const user = users[0];

        if (user.account_status !== 'active') {
            return res.status(403).json({
                success: false,
                message: `Account is ${user.account_status}. Please contact the placement administrator.`
            });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        let studentData = null;
        if (user.role === 'student') {
            const [students] = await pool.query(
                'SELECT student_id, university_roll_no, branch, graduation_year, cgpa, active_backlogs FROM students WHERE user_id = ? LIMIT 1',
                [user.user_id]
            );
            if (students.length > 0) {
                studentData = students[0];
            }
        }

        // Save into session
        req.session.user = {
            userId: user.user_id,
            fullName: user.full_name,
            email: user.email,
            role: user.role,
            studentId: studentData ? studentData.student_id : null,
            rollNo: studentData ? studentData.university_roll_no : null,
            branch: studentData ? studentData.branch : null,
            cgpa: studentData ? studentData.cgpa : null,
            activeBacklogs: studentData ? studentData.active_backlogs : 0
        };

        return res.json({
            success: true,
            message: 'Authentication successful.',
            user: req.session.user
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred during login. Please try again.'
        });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout session destruction error:', err);
            return res.status(500).json({ success: false, message: 'Could not log out.' });
        }
        res.clearCookie('connect.sid');
        return res.json({
            success: true,
            message: 'Logged out successfully.'
        });
    });
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.json({
            success: true,
            authenticated: false,
            user: null
        });
    }

    // Refresh student academic info if role is student
    if (req.session.user.role === 'student' && req.session.user.studentId) {
        try {
            const [students] = await pool.query(
                'SELECT cgpa, active_backlogs, branch, university_roll_no FROM students WHERE student_id = ?',
                [req.session.user.studentId]
            );
            if (students.length > 0) {
                req.session.user.cgpa = students[0].cgpa;
                req.session.user.activeBacklogs = students[0].active_backlogs;
                req.session.user.branch = students[0].branch;
            }
        } catch (e) {
            console.error('Error refreshing session student data:', e);
        }
    }

    return res.json({
        success: true,
        authenticated: true,
        user: req.session.user
    });
});

module.exports = router;
