/**
 * Smart College Placement Management System (SCPMS)
 * API Client & Toast Notification Utility
 */

const API = {
    /**
     * Centralized HTTP Request Wrapper
     */
    async request(url, options = {}) {
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...(options.headers || {})
            }
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                const errorMessage = data.message || `Request failed with status ${response.status}`;
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            console.error(`API Error [${url}]:`, error);
            throw error;
        }
    },

    get(url, headers = {}) {
        return this.request(url, { method: 'GET', headers });
    },

    post(url, body = {}, headers = {}) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(body),
            headers
        });
    },

    put(url, body = {}, headers = {}) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(body),
            headers
        });
    },

    delete(url, headers = {}) {
        return this.request(url, { method: 'DELETE', headers });
    }
};

/**
 * Toast Notifications
 */
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';
    if (type === 'warning') icon = '🔔';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

/**
 * Modal Dialog Helpers
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Global modal background click to close
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Format date helper
function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function formatDateTime(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Universal Theme Manager (Dark / Light Mode)
 */
const ThemeManager = {
    init() {
        const saved = localStorage.getItem('scps_theme') || 'light';
        this.apply(saved);
    },
    toggle() {
        const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        this.apply(next);
        localStorage.setItem('scps_theme', next);
        showToast(`Theme switched to ${next} mode`, 'info');
    },
    apply(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.documentElement.style.colorScheme = 'dark';
            document.querySelectorAll('.theme-toggle-btn').forEach(b => b.innerHTML = '☀️');
        } else {
            document.documentElement.removeAttribute('data-theme');
            document.documentElement.style.colorScheme = 'light';
            document.querySelectorAll('.theme-toggle-btn').forEach(b => b.innerHTML = '🌙');
        }
    }
};

// Auto initialize theme
if (typeof document !== 'undefined') {
    ThemeManager.init();
}
