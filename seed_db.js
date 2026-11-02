const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function seed() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'smart_college_placement',
        multipleStatements: true
    });

    console.log('Connected to MySQL server successfully.');

    try {
        await connection.query('SET FOREIGN_KEY_CHECKS = 0;');

        const tables = [
            'notifications',
            'interview_results',
            'interview_rounds',
            'applications',
            'drive_required_skills',
            'student_skills',
            'skills',
            'placement_drives',
            'companies',
            'students',
            'users'
        ];

        console.log('Truncating existing tables...');
        for (const tbl of tables) {
            try {
                await connection.query(`TRUNCATE TABLE \`${tbl}\`;`);
            } catch (err) {
                console.warn(`Could not truncate ${tbl}: ${err.message}`);
            }
        }

        console.log('Reading database/02_sample_data.sql...');
        const sqlContent = fs.readFileSync(path.resolve(__dirname, 'database/02_sample_data.sql'), 'utf-8');

        console.log('Executing seed SQL...');
        await connection.query(sqlContent);

        // Ensure valid bcrypt password hashes for all users
        const bcrypt = require('bcryptjs');
        const adminHash = await bcrypt.hash('Admin@123456', 10);
        const studentHash = await bcrypt.hash('Student@123', 10);
        await connection.query('UPDATE users SET password_hash = ? WHERE role = ?', [adminHash, 'admin']);
        await connection.query('UPDATE users SET password_hash = ? WHERE role = ?', [studentHash, 'student']);

        await connection.query('SET FOREIGN_KEY_CHECKS = 1;');

        const [students] = await connection.query('SELECT count(*) as count FROM students');
        const [companies] = await connection.query('SELECT count(*) as count FROM companies');
        const [drives] = await connection.query('SELECT count(*) as count FROM placement_drives');
        const [apps] = await connection.query('SELECT count(*) as count FROM applications');
        const [users] = await connection.query('SELECT count(*) as count FROM users');

        console.log('====================================');
        console.log(' DATABASE SEEDED SUCCESSFULLY');
        console.log(' Users Count:        ', users[0].count);
        console.log(' Students Count:     ', students[0].count);
        console.log(' Companies Count:    ', companies[0].count);
        console.log(' Placement Drives:   ', drives[0].count);
        console.log(' Applications:       ', apps[0].count);
        console.log('====================================');

    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        await connection.end();
    }
}

seed();
