/**
 * Smart College Placement Management System (SCPMS)
 * Central Express.js Application Server
 */

const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { testConnection } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const publicRoutes = require('./routes/publicRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session management
app.use(session({
    secret: process.env.SESSION_SECRET || 'scps_super_secure_session_secret_2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // Set to true if running with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Serve frontend static assets
const frontendPath = path.resolve(__dirname, '../frontend');
app.use(express.static(frontendPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);

// Friendly URL redirects
app.get('/student', (req, res) => {
    res.sendFile(path.join(frontendPath, 'student.html'), (err) => {
        if (err && !res.headersSent) res.status(404).send('Student portal not found');
    });
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(frontendPath, 'admin.html'), (err) => {
        if (err && !res.headersSent) res.status(404).send('Admin portal not found');
    });
});

app.get('/support', (req, res) => {
    res.sendFile(path.join(frontendPath, 'support.html'), (err) => {
        if (err && !res.headersSent) res.status(404).send('Support page not found');
    });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const { pool } = require('./config/db');
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (e) {
    res.status(503).json({ status: 'degraded', database: 'unreachable', timestamp: new Date().toISOString() });
  }
});

// Fallback for SPA routing and static pages
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ success: false, message: 'API endpoint not found' });
    }
    res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
        if (err && !res.headersSent) {
            res.status(404).send('File not found');
        }
    });
});

// Centralized error handler
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err.message);
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error occurred.'
    });
});

// Start server after verifying database connection
async function startServer() {
    console.log('Initializing Smart College Placement Management System...');
    const dbOk = await testConnection();
    
    if (!dbOk) {
        console.warn('⚠️  Database connection could not be verified on startup. Running in degraded mode.');
    }

    app.listen(PORT, () => {
        console.log('================================================================');
        console.log(`🚀 SCPMS Server is LIVE & RUNNING!`);
        console.log(`📍 Web Portal URL:    http://localhost:${PORT}`);
        console.log(`🎓 Student Portal:    http://localhost:${PORT}/student.html`);
        console.log(`🛡️ Placement Admin:   http://localhost:${PORT}/admin.html`);
        console.log(`🔌 API Root:          http://localhost:${PORT}/api/`);
        console.log('================================================================');
    });
}

// Start server locally, or export serverless app on Vercel
if (!process.env.VERCEL) {
    startServer();
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing DB pool...');
  const { pool } = require('./config/db');
  await pool.end();
  process.exit(0);
});
process.on('SIGINT', async () => {
  console.log('SIGINT received. Closing DB pool...');
  const { pool } = require('./config/db');
  await pool.end();
  process.exit(0);
});

module.exports = app;
