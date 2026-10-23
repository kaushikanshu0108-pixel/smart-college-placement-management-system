/**
 * Smart College Placement Management System
 * Database Configuration & Connection Pool Module
 * Uses mysql2/promise for async/await query execution and dotenv for environment configuration
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Configuration options loaded safely from environment variables
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'smart_college_placement',
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
    queueLimit: 0,
    dateStrings: true,
    timezone: '+00:00'
};

// Create a persistent MySQL connection pool
const pool = mysql.createPool(dbConfig);

/**
 * Test and verify database connectivity on startup
 * Logs active host, database name, and MySQL server version
 */
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT VERSION() AS mysql_version, DATABASE() AS active_db, NOW() AS server_time');
        connection.release();
        
        console.log('---------------------------------------------------------');
        console.log(' MySQL Database Connection Established Successfully');
        console.log(` Host:       ${dbConfig.host}:${dbConfig.port}`);
        console.log(` Database:   ${rows[0].active_db}`);
        console.log(` Version:    MySQL ${rows[0].mysql_version}`);
        console.log(` Server Time:${rows[0].server_time}`);
        console.log('---------------------------------------------------------');
        return true;
    } catch (error) {
        console.error('---------------------------------------------------------');
        console.error(' MySQL Database Connection FAILED');
        console.error(` Target Host: ${dbConfig.host}:${dbConfig.port}`);
        console.error(` Target DB:   ${dbConfig.database}`);
        console.error(` Error Code:  ${error.code || 'UNKNOWN'}`);
        console.error(` Message:     ${error.message}`);
        console.error(' Troubleshooting:');
        console.error(' 1. Verify that your MySQL server is running.');
        console.error(' 2. Check credentials in your .env file (DB_USER, DB_PASSWORD).');
        console.error(' 3. Run database/00_create_database.sql and 01_schema.sql first.');
        console.error('---------------------------------------------------------');
        return false;
    }
}

// Auto-run connection test if executed directly (e.g. node backend/config/db.js)
if (require.main === module) {
    testConnection().then((success) => {
        if (!success) {
            process.exit(1);
        } else {
            process.exit(0);
        }
    });
}

module.exports = {
    pool,
    testConnection
};
