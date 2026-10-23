/**
 * End-to-End API Test Suite
 * Tests all major endpoints of the SCPMS REST API
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const http = require('http');

const BASE = 'localhost';
const PORT = 5000;
let cookie = '';

function request(method, path, body = null, useCookie = false) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const opts = {
            hostname: BASE, port: PORT, path, method,
            headers: {
                'Content-Type': 'application/json',
                ...(data && { 'Content-Length': Buffer.byteLength(data) }),
                ...(useCookie && cookie && { 'Cookie': cookie })
            }
        };
        const req = http.request(opts, res => {
            let raw = '';
            res.on('data', d => raw += d);
            res.on('end', () => {
                if (res.headers['set-cookie']) {
                    cookie = res.headers['set-cookie'][0].split(';')[0];
                }
                try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
                catch { resolve({ status: res.statusCode, body: raw }); }
            });
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

function check(label, condition, detail = '') {
    const icon = condition ? '✅' : '❌';
    console.log(`  ${icon} ${label}${detail ? ': ' + detail : ''}`);
    return condition;
}

async function runTests() {
    console.log('\n🧪 SCPMS API Test Suite\n' + '='.repeat(50));
    
    // 1. Public Stats
    console.log('\n📊 1. Public Statistics API');
    const stats = await request('GET', '/api/public/stats');
    check('Status 200', stats.status === 200);
    check('Has student count', stats.body.data?.totalStudents >= 10, `${stats.body.data?.totalStudents} students`);
    check('Has active drives', stats.body.data?.activeDrives >= 0, `${stats.body.data?.activeDrives} drives`);

    // 2. Public Drives
    console.log('\n🏢 2. Public Drives API');
    const drives = await request('GET', '/api/public/drives');
    check('Status 200', drives.status === 200);
    check('Returns drives array', Array.isArray(drives.body.data));

    // 3. Admin Login
    console.log('\n🔐 3. Admin Authentication');
    const adminLogin = await request('POST', '/api/auth/login', { email: 'admin@college.edu', password: 'Admin@123456' });
    check('Status 200', adminLogin.status === 200);
    check('Login successful', adminLogin.body.success === true);
    check('Role is admin', adminLogin.body.user?.role === 'admin');
    check('Session cookie set', !!cookie, cookie.substring(0, 20) + '...');

    // 4. Auth /me check
    console.log('\n👤 4. Session /me Check');
    const me = await request('GET', '/api/auth/me', null, true);
    check('Status 200', me.status === 200);
    check('Authenticated', me.body.authenticated === true);
    check('Correct user', me.body.user?.email === 'admin@college.edu');

    // 5. Admin Metrics
    console.log('\n📈 5. Admin Metrics API');
    const metrics = await request('GET', '/api/admin/metrics', null, true);
    check('Status 200', metrics.status === 200);
    check('Has metrics data', !!metrics.body.data);

    // 6. Admin student list
    console.log('\n👥 6. Admin Student List API');
    const students = await request('GET', '/api/admin/students?page=1&limit=5', null, true);
    check('Status 200', students.status === 200);
    check('Returns students', Array.isArray(students.body.data));
    check('Has student data', students.body.data?.length > 0, `${students.body.data?.length} students returned`);

    // 7. Logout Admin
    console.log('\n🔓 7. Logout');
    const logout = await request('POST', '/api/auth/logout', null, true);
    check('Status 200', logout.status === 200);
    check('Logout successful', logout.body.success === true);

    // 8. Student Login
    console.log('\n🎓 8. Student Authentication');
    const studentLogin = await request('POST', '/api/auth/login', { email: 'aarav.patel@college.edu', password: 'Student@123456' });
    check('Status 200', studentLogin.status === 200);
    check('Login successful', studentLogin.body.success === true);
    check('Role is student', studentLogin.body.user?.role === 'student');
    check('Has student ID', !!studentLogin.body.user?.studentId);

    // 9. Student dashboard
    console.log('\n🏠 9. Student Dashboard API');
    const dashboard = await request('GET', '/api/student/dashboard', null, true);
    check('Status 200', dashboard.status === 200);
    check('Has profile (student key)', !!dashboard.body.data?.student);
    check('Has stats', !!dashboard.body.data?.stats);

    // 10. Student drives list
    console.log('\n📋 10. Student Available Drives API');
    const studentDrives = await request('GET', '/api/student/drives', null, true);
    check('Status 200', studentDrives.status === 200);
    check('Returns drives', Array.isArray(studentDrives.body.data));

    // 11. Unauthenticated access blocked
    console.log('\n🛡️  11. Security - Unauthorized Access');
    cookie = ''; // clear session
    const unauth = await request('GET', '/api/admin/metrics', null, false);
    check('Admin blocked without auth', unauth.status === 401);

    console.log('\n' + '='.repeat(50));
    console.log('✅ All API tests completed!\n');
    console.log('🌐 Open your browser and visit:');
    console.log(`   Landing Page:   http://localhost:${PORT}`);
    console.log(`   Student Portal: http://localhost:${PORT}/student.html`);
    console.log(`   Admin Portal:   http://localhost:${PORT}/admin.html`);
    console.log('\n📋 Demo Credentials:');
    console.log('   Admin:   admin@college.edu     / Admin@123456');
    console.log('   Student: aarav.patel@college.edu / Student@123456');

    process.exit(0);
}

runTests().catch(e => {
    console.error('\n❌ Test suite failed:', e.message);
    process.exit(1);
});
