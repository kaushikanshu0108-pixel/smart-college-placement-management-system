/**
 * Direct login test - bypasses Express to test bcrypt and DB directly
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const bcrypt = require('bcryptjs');
const { pool } = require('./backend/config/db');

async function testLogin(email, password) {
    console.log(`\nTesting login: ${email} / ${password}`);
    
    const [users] = await pool.query(
        'SELECT user_id, full_name, email, password_hash, role, account_status FROM users WHERE email = ? LIMIT 1',
        [email.trim().toLowerCase()]
    );

    if (users.length === 0) {
        console.log('❌ User not found');
        return;
    }

    const user = users[0];
    console.log('✅ User found:', user.full_name, 'Role:', user.role, 'Status:', user.account_status);
    console.log('   Hash prefix:', user.password_hash.substring(0, 10));
    
    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log('   Password match:', isMatch);
    
    if (isMatch && user.account_status === 'active') {
        console.log('✅ LOGIN WOULD SUCCEED');
    } else {
        console.log('❌ LOGIN WOULD FAIL');
    }
}

async function main() {
    await testLogin('admin@college.edu', 'Admin@123456');
    await testLogin('aarav.patel@college.edu', 'Student@123456');
    await pool.end();
    process.exit(0);
}

main().catch(e => { console.error('Fatal error:', e); process.exit(1); });
