/**
 * Password Reset Script
 * Resets all user passwords to known values for testing.
 * Admin: Admin@123456
 * Student: Student@123456
 */

const bcrypt = require('bcryptjs');
const { pool } = require('./backend/config/db');

async function resetPasswords() {
    console.log('Generating bcrypt hashes...');
    const adminHash = await bcrypt.hash('Admin@123456', 10);
    const studentHash = await bcrypt.hash('Student@123456', 10);

    console.log('Admin hash:', adminHash);
    console.log('Student hash:', studentHash);

    const [adminResult] = await pool.query(
        'UPDATE users SET password_hash = ? WHERE role = ?',
        [adminHash, 'admin']
    );
    const [studentResult] = await pool.query(
        'UPDATE users SET password_hash = ? WHERE role = ?',
        [studentHash, 'student']
    );

    console.log('✅ Admin passwords updated:', adminResult.affectedRows, 'row(s)');
    console.log('✅ Student passwords updated:', studentResult.affectedRows, 'row(s)');
    
    // Verify
    const [users] = await pool.query('SELECT full_name, email, role FROM users');
    console.log('\nAll users in database:');
    users.forEach(u => console.log(`  [${u.role}] ${u.full_name} <${u.email}>`));

    console.log('\n📋 Login Credentials:');
    console.log('  Admin:   admin@college.edu / Admin@123456');
    console.log('  Student: aarav.patel@college.edu / Student@123456');
    
    await pool.end();
    process.exit(0);
}

resetPasswords().catch(e => {
    console.error('Error:', e);
    process.exit(1);
});
