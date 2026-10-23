/**
 * Smart College Placement Management System (SCPMS)
 * Authentication Controller & Session Management
 */

const Auth = {
    /**
     * Check current session status
     */
    async checkSession() {
        try {
            const res = await API.get('/api/auth/me');
            if (res.authenticated && res.user) {
                return res.user;
            }
            return null;
        } catch (e) {
            return null;
        }
    },

    /**
     * Login with email and password
     */
    async login(email, password) {
        try {
            const res = await API.post('/api/auth/login', { email, password });
            if (res.success) {
                showToast(`Welcome back, ${res.user.fullName}!`, 'success');
                setTimeout(() => {
                    if (res.user.role === 'admin') {
                        window.location.href = '/admin.html';
                    } else if (res.user.role === 'student') {
                        window.location.href = '/student.html';
                    } else {
                        window.location.href = '/';
                    }
                }, 800);
            }
        } catch (error) {
            showToast(error.message, 'error');
            throw error;
        }
    },

    /**
     * Logout
     */
    async logout() {
        try {
            await API.post('/api/auth/logout');
            showToast('Logged out successfully.', 'info');
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 500);
        } catch (error) {
            window.location.href = '/index.html';
        }
    },

    /**
     * Quick fill credentials for demo accounts
     */
    fillDemo(email, password) {
        const emailInput = document.getElementById('login-email');
        const passInput = document.getElementById('login-password');
        if (emailInput && passInput) {
            emailInput.value = email;
            passInput.value = password;
            showToast(`Selected demo credentials for ${email}`, 'info');
            openModal('login-modal');
        }
    },

    /**
     * Enforce authentication on protected pages
     */
    async protectPage(requiredRole) {
        const user = await this.checkSession();
        if (!user) {
            window.location.href = '/index.html?auth=required';
            return null;
        }
        if (requiredRole && user.role !== requiredRole) {
            showToast(`Unauthorized. Redirecting...`, 'error');
            setTimeout(() => {
                if (user.role === 'admin') window.location.href = '/admin.html';
                else if (user.role === 'student') window.location.href = '/student.html';
                else window.location.href = '/index.html';
            }, 1000);
            return null;
        }

        // Render user badge in navbar
        const userContainer = document.getElementById('navbar-user-info');
        if (userContainer) {
            const roleBadge = user.role === 'admin' 
                ? '<span class="badge" style="background:#e0e7ff;color:#3730a3;">Placement Admin</span>' 
                : `<span class="badge" style="background:#dcfce7;color:#166534;">Roll: ${user.rollNo || 'N/A'}</span>`;

            userContainer.innerHTML = `
                <div class="user-pill">
                    <div class="user-avatar">${user.fullName.charAt(0).toUpperCase()}</div>
                    <div>
                        <div style="font-weight:700;line-height:1.2;">${user.fullName}</div>
                        <div>${roleBadge}</div>
                    </div>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="Auth.logout()">
                    🚪 Logout
                </button>
            `;
        }

        return user;
    }
};

// Auto-bind login form if present
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            
            try {
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Verifying...';
                }
                await Auth.login(email, password);
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Sign In';
                }
            }
        });
    }
});
