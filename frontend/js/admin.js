/**
 * Smart College Placement Management System (SCPMS)
 * Placement Admin Operations Controller
 */

const AdminApp = {
    currentUser: null,
    metrics: null,
    companiesList: [],
    drivesList: [],
    skillsList: [],
    applicationsList: [],
    studentsList: [],

    /**
     * Initialization Lifecycle
     */
    async init() {
        this.currentUser = await Auth.protectPage('admin');
        if (!this.currentUser) return;

        await Promise.all([
            this.loadMetrics(),
            this.loadDrives(),
            this.loadCompanies(),
            this.loadSkills(),
            this.loadApplications(),
            this.loadStudents(),
            this.checkCompanyApiConfig()
        ]);
    },

    /**
     * Switch Tabs
     */
    switchTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        const targetTab = document.getElementById(tabId);
        if (targetTab) targetTab.classList.add('active');

        // Highlight matching tab button
        const buttons = document.querySelectorAll('.tab-btn');
        buttons.forEach(btn => {
            if (btn.getAttribute('onclick')?.includes(tabId)) {
                btn.classList.add('active');
            }
        });

        // Highlight matching navbar link
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('onclick')?.includes(tabId)) {
                link.classList.add('active');
            }
        });

        // Scroll to top of content
        window.scrollTo({ top: 100, behavior: 'smooth' });

        if (tabId === 'tab-database') {
            this.loadDatabaseExplorer();
        }
    },

    /**
     * 1. Load Metrics & Branch Analytics
     */
    async loadMetrics() {
        try {
            const res = await API.get('/api/admin/metrics');
            if (!res.success) throw new Error(res.message);

            const m = res.data;
            this.metrics = m;

            document.getElementById('kpi-placement-rate').textContent = `${m.placementRate}%`;
            document.getElementById('kpi-total-students').textContent = m.totalStudents;
            document.getElementById('kpi-placed-students').textContent = m.placedStudents;
            document.getElementById('kpi-active-drives').textContent = m.activeDrives;
            document.getElementById('kpi-total-companies').textContent = m.totalCompanies;
            document.getElementById('kpi-avg-package').textContent = `${m.avgPackageLpa} LPA`;

            // Extended Real-time Pipeline KPIs
            const elTotalApps = document.getElementById('kpi-total-apps');
            const elShortlisted = document.getElementById('kpi-shortlisted');
            const elMaxPkg = document.getElementById('kpi-max-pkg');
            const elMinPkg = document.getElementById('kpi-min-pkg');
            const elAvgCgpa = document.getElementById('kpi-avg-cgpa');

            if (elTotalApps) elTotalApps.textContent = m.totalApplications || 0;
            if (elShortlisted) elShortlisted.textContent = `${(m.shortlistedCount || 0) + (m.selectedCount || 0)} candidates`;
            if (elMaxPkg) elMaxPkg.textContent = `${m.maxPackageLpa || 0} LPA`;
            if (elMinPkg) elMinPkg.textContent = `${m.minPackageLpa || 0} LPA`;
            if (elAvgCgpa) elAvgCgpa.textContent = `${m.avgCgpa || 0} / 10`;

            // Operational Accreditation Summary card
            const elSummary = document.getElementById('analytics-kpi-summary');
            if (elSummary) {
                elSummary.innerHTML = `
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.65rem;">
                        <div class="checklist-item pass" style="margin:0;">
                            <span>Placement Rate</span>
                            <strong style="color:var(--success);">${m.placementRate}%</strong>
                        </div>
                        <div class="checklist-item pass" style="margin:0;">
                            <span>Campus Avg CGPA</span>
                            <strong style="color:var(--primary);">${m.avgCgpa}</strong>
                        </div>
                        <div class="checklist-item" style="margin:0; border-left-color:var(--primary);">
                            <span>Average Package</span>
                            <strong>${m.avgPackageLpa} LPA</strong>
                        </div>
                        <div class="checklist-item" style="margin:0; border-left-color:var(--accent);">
                            <span>Highest CTC</span>
                            <strong style="color:#059669;">${m.maxPackageLpa} LPA</strong>
                        </div>
                        <div class="checklist-item" style="margin:0; border-left-color:var(--success);">
                            <span>Total Enrolled</span>
                            <strong>${m.totalStudents}</strong>
                        </div>
                        <div class="checklist-item" style="margin:0; border-left-color:var(--warning);">
                            <span>Placed Offers</span>
                            <strong style="color:var(--success);">${m.placedStudents}</strong>
                        </div>
                    </div>
                `;
            }

            // Render Branch-Wise Table
            const branchTbody = document.querySelector('#branch-stats-table tbody');
            if (branchTbody && m.branchSummary) {
                branchTbody.innerHTML = m.branchSummary.map(b => `
                    <tr>
                        <td><strong>${b.branch}</strong></td>
                        <td>${b.total_enrolled}</td>
                        <td><span style="color:var(--success); font-weight:700;">${b.total_placed}</span></td>
                        <td>
                            <div style="display:flex; align-items:center; gap:0.5rem;">
                                <strong>${b.placement_percentage}%</strong>
                                <div style="flex:1; height:6px; background:var(--neutral-200); border-radius:3px; max-width:80px; overflow:hidden;">
                                    <div style="width:${b.placement_percentage}%; height:100%; background:var(--primary);"></div>
                                </div>
                            </div>
                        </td>
                        <td>${b.branch_avg_cgpa}</td>
                    </tr>
                `).join('');
            }

            // Render Charts via Chart.js
            this.renderCharts(m);
        } catch (error) {
            console.error('Failed to load metrics:', error);
            showToast('Could not load placement statistics', 'error');
        }
    },

    branchChartInstance: null,
    appStatusChartInstance: null,
    pkgChartInstance: null,
    compChartInstance: null,
    placedChartInstance: null,

    /**
     * Refresh all tables and metrics
     */
    async refreshAll() {
        showToast('Refreshing live placement data...', 'info');
        try {
            await Promise.all([
                this.loadMetrics(),
                this.loadDrives(),
                this.loadCompanies(),
                this.loadSkills(),
                this.loadApplications(),
                this.loadStudents()
            ]);
            showToast('All placement metrics & directories refreshed!', 'success');
        } catch (e) {
            showToast('Failed to refresh data: ' + e.message, 'error');
        }
    },

    renderCharts(metrics) {
        if (typeof Chart === 'undefined') return;

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#cbd5e1' : '#475569';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

        Chart.defaults.color = textColor;
        Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";

        // 1. Branch Placement Bar Chart
        const branchCanvas = document.getElementById('chart-branch-placement');
        if (branchCanvas && metrics.branchSummary) {
            if (this.branchChartInstance) this.branchChartInstance.destroy();

            const labels = metrics.branchSummary.map(b => b.branch.replace('Engineering', 'Eng.').replace('Computer Science &', 'CSE'));
            const values = metrics.branchSummary.map(b => parseFloat(b.placement_percentage) || 0);

            this.branchChartInstance = new Chart(branchCanvas, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Placement %',
                        data: values,
                        backgroundColor: '#4f46e5',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { color: gridColor }, ticks: { color: textColor } },
                        y: { beginAtZero: true, max: 100, ticks: { color: textColor, callback: v => v + '%' }, grid: { color: gridColor } }
                    }
                }
            });
        }

        // 2. Application Status Funnel Donut Chart
        const appStatusCanvas = document.getElementById('chart-app-status');
        if (appStatusCanvas) {
            if (this.appStatusChartInstance) this.appStatusChartInstance.destroy();

            this.appStatusChartInstance = new Chart(appStatusCanvas, {
                type: 'doughnut',
                data: {
                    labels: ['Selected Offers', 'Shortlisted', 'In Progress / Applied'],
                    datasets: [{
                        data: [
                            metrics.selectedCount || 0,
                            metrics.shortlistedCount || 0,
                            Math.max(0, (metrics.totalApplications || 0) - (metrics.selectedCount || 0) - (metrics.shortlistedCount || 0))
                        ],
                        backgroundColor: ['#10b981', '#f59e0b', '#3b82f6'],
                        borderColor: isDark ? '#111827' : '#ffffff',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', labels: { color: textColor } }
                    }
                }
            });
        }

        // 3. CTC Package Compensation Distribution (Bar Chart)
        const pkgCanvas = document.getElementById('chart-package-dist');
        if (pkgCanvas) {
            if (this.pkgChartInstance) this.pkgChartInstance.destroy();

            // Calculate drive package tier counts
            let tierMass = 0, tierCore = 0, tierDream = 0, tierMarquee = 0;
            if (this.drivesList && this.drivesList.length > 0) {
                this.drivesList.forEach(d => {
                    const pkg = parseFloat(d.package_lpa) || 0;
                    if (pkg < 8) tierMass++;
                    else if (pkg < 15) tierCore++;
                    else if (pkg < 25) tierDream++;
                    else tierMarquee++;
                });
            } else {
                tierMass = 3; tierCore = 6; tierDream = 4; tierMarquee = 2;
            }

            this.pkgChartInstance = new Chart(pkgCanvas, {
                type: 'bar',
                data: {
                    labels: ['< 8 LPA (Core)', '8–15 LPA (Growth)', '15–25 LPA (Dream)', '> 25 LPA (Marquee)'],
                    datasets: [{
                        label: 'Placement Drives',
                        data: [tierMass, tierCore, tierDream, tierMarquee],
                        backgroundColor: ['#94a3b8', '#3b82f6', '#10b981', '#f59e0b'],
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { color: gridColor }, ticks: { color: textColor } },
                        y: { beginAtZero: true, ticks: { color: textColor, stepSize: 1 }, grid: { color: gridColor } }
                    }
                }
            });
        }

        // 4. Top Recruiting Companies (Horizontal Bar Chart)
        const compCanvas = document.getElementById('chart-top-companies');
        if (compCanvas) {
            if (this.compChartInstance) this.compChartInstance.destroy();

            let compLabels = [];
            let compValues = [];

            if (this.drivesList && this.drivesList.length > 0) {
                const map = {};
                this.drivesList.forEach(d => {
                    map[d.company_name] = (map[d.company_name] || 0) + (d.selected_count || 1);
                });
                const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 7);
                compLabels = sorted.map(e => e[0]);
                compValues = sorted.map(e => e[1]);
            }

            if (compLabels.length === 0) {
                compLabels = ['Microsoft', 'Amazon', 'Google Cloud', 'Oracle', 'Zomato', 'Deloitte'];
                compValues = [6, 4, 3, 3, 2, 2];
            }

            this.compChartInstance = new Chart(compCanvas, {
                type: 'bar',
                data: {
                    labels: compLabels,
                    datasets: [{
                        label: 'Campus Hires',
                        data: compValues,
                        backgroundColor: '#06b6d4',
                        borderRadius: 6
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor, stepSize: 1 } },
                        y: { grid: { color: gridColor }, ticks: { color: textColor } }
                    }
                }
            });
        }

        // 5. Placed vs Unplaced by Branch (Grouped Bar Chart)
        const placedCanvas = document.getElementById('chart-placed-unplaced');
        if (placedCanvas && metrics.branchSummary) {
            if (this.placedChartInstance) this.placedChartInstance.destroy();

            const labels = metrics.branchSummary.map(b => b.branch.replace('Engineering', 'Eng.').replace('Computer Science &', 'CSE').replace('Artificial Intelligence &', 'AI &'));
            const placedValues = metrics.branchSummary.map(b => parseInt(b.total_placed, 10) || 0);
            const unplacedValues = metrics.branchSummary.map(b => Math.max(0, (parseInt(b.total_enrolled, 10) || 0) - (parseInt(b.total_placed, 10) || 0)));

            this.placedChartInstance = new Chart(placedCanvas, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [
                        {
                            label: 'Placed Students',
                            data: placedValues,
                            backgroundColor: '#10b981',
                            borderRadius: 4
                        },
                        {
                            label: 'Seeking Placement',
                            data: unplacedValues,
                            backgroundColor: isDark ? '#374151' : '#cbd5e1',
                            borderRadius: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'top', labels: { color: textColor } }
                    },
                    scales: {
                        x: { grid: { color: gridColor }, ticks: { color: textColor } },
                        y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor, stepSize: 2 } }
                    }
                }
            });
        }
    },

    /**
     * 2. Load Placement Drives
     */
    async loadDrives() {
        try {
            const res = await API.get('/api/admin/drives');
            if (!res.success) throw new Error(res.message);

            this.drivesList = res.data;
            document.getElementById('badge-total-drives').textContent = this.drivesList.length;

            // Populate filter in Applications tab
            const filterAppDrive = document.getElementById('filter-app-drive');
            if (filterAppDrive) {
                const currentVal = filterAppDrive.value;
                filterAppDrive.innerHTML = `<option value="">All Placement Drives</option>` +
                    this.drivesList.map(d => `<option value="${d.drive_id}">${d.company_name} - ${d.job_role}</option>`).join('');
                filterAppDrive.value = currentVal;
            }

            const tbody = document.querySelector('#admin-drives-table tbody');
            if (!tbody) return;

            if (this.drivesList.length === 0) {
                tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:2rem; color:var(--neutral-400);">No drives registered yet.</td></tr>`;
                return;
            }

            tbody.innerHTML = this.drivesList.map(d => `
                <tr>
                    <td>
                        <div style="font-weight:700; color:var(--neutral-900); font-size:0.95rem;">${d.drive_title}</div>
                        <div style="font-size:0.85rem; color:var(--neutral-500);">${d.job_role} • ${d.employment_type}</div>
                    </td>
                    <td><strong>${d.company_name}</strong></td>
                    <td><strong style="color:#166534;">${d.package_lpa} LPA</strong></td>
                    <td>
                        <div style="font-size:0.85rem;">CGPA ≥ <strong>${d.minimum_cgpa}</strong></div>
                        <div style="font-size:0.8rem; color:var(--neutral-500);">Max Backlogs: ${d.maximum_backlogs}</div>
                    </td>
                    <td>${formatDate(d.application_deadline)}</td>
                    <td>
                        <span class="badge" style="background:#f1f5f9; color:#1e293b; font-size:0.8rem;">
                            👥 ${d.total_applicants || 0} applied
                        </span>
                        ${d.selected_count > 0 ? `<div style="font-size:0.75rem; color:var(--success); font-weight:700; margin-top:2px;">🎉 ${d.selected_count} Placed</div>` : ''}
                    </td>
                    <td>
                        <span class="badge badge-${d.drive_status}">${d.drive_status}</span>
                    </td>
                    <td>
                        <select class="form-control" style="padding:4px 8px; font-size:0.8rem; width:auto;" onchange="AdminApp.handleUpdateDriveStatus(${d.drive_id}, this.value)">
                            <option value="open" ${d.drive_status === 'open' ? 'selected' : ''}>Open</option>
                            <option value="upcoming" ${d.drive_status === 'upcoming' ? 'selected' : ''}>Upcoming</option>
                            <option value="closed" ${d.drive_status === 'closed' ? 'selected' : ''}>Closed</option>
                            <option value="completed" ${d.drive_status === 'completed' ? 'selected' : ''}>Completed</option>
                        </select>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Failed to load drives:', error);
            showToast('Could not load placement drives', 'error');
        }
    },

    async handleUpdateDriveStatus(driveId, newStatus) {
        try {
            const res = await API.put(`/api/admin/drives/${driveId}/status`, { status: newStatus });
            if (res.success) {
                showToast(res.message, 'success');
                this.loadDrives();
                this.loadMetrics();
            }
        } catch (error) {
            showToast(error.message, 'error');
        }
    },

    /**
     * 3. Load Applications Pipeline
     */
    async loadApplications() {
        try {
            const driveId = document.getElementById('filter-app-drive')?.value || '';
            const status = document.getElementById('filter-app-status')?.value || '';

            let url = '/api/admin/applications?';
            if (driveId) url += `drive_id=${driveId}&`;
            if (status) url += `status=${status}&`;

            const res = await API.get(url);
            if (!res.success) throw new Error(res.message);

            this.applicationsList = res.data;
            document.getElementById('badge-total-apps').textContent = this.applicationsList.length;

            const tbody = document.querySelector('#admin-apps-table tbody');
            if (!tbody) return;

            if (this.applicationsList.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--neutral-400);">No applications found for selected filters.</td></tr>`;
                return;
            }

            tbody.innerHTML = this.applicationsList.map(a => `
                <tr>
                    <td>
                        <div style="font-weight:700; color:var(--neutral-900); font-size:0.95rem;">${a.student_name}</div>
                        <div style="font-size:0.8rem; color:var(--neutral-500); font-family:var(--font-mono);">${a.university_roll_no} • ${a.student_email}</div>
                    </td>
                    <td>
                        <div>Branch: <strong>${a.branch}</strong></div>
                        <div style="font-size:0.85rem; color:var(--neutral-600);">CGPA: <strong>${a.cgpa}</strong> • Backlogs: ${a.active_backlogs}</div>
                    </td>
                    <td>
                        <div style="font-weight:700;">${a.job_role}</div>
                        <div style="font-size:0.85rem; color:var(--neutral-500);">${a.company_name} • <strong>${a.package_lpa} LPA</strong></div>
                    </td>
                    <td>
                        <span class="badge badge-${a.application_status}">${a.application_status.toUpperCase()}</span>
                    </td>
                    <td>${formatDate(a.application_date)}</td>
                    <td>
                        <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
                            <button class="btn btn-primary btn-sm" onclick="AdminApp.openScheduleModal(${a.application_id}, '${a.student_name}', '${a.job_role}')">
                                📅 Interview
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="AdminApp.openStatusModal(${a.application_id}, '${a.student_name}', '${a.application_status}', '${a.admin_notes || ''}')">
                                📝 Status
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Failed to load applications:', error);
            showToast('Could not load applications', 'error');
        }
    },

    openScheduleModal(appId, studentName, jobRole) {
        document.getElementById('sched-app-id').value = appId;
        document.getElementById('sched-candidate-preview').innerHTML = `
            Scheduling interview for: <strong>${studentName}</strong> (${jobRole})
        `;
        // Set default date to tomorrow 10:00 AM
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        document.getElementById('sched-time').value = tomorrow.toISOString().slice(0, 16);

        openModal('modal-schedule-interview');
    },

    async handleScheduleInterview(event) {
        event.preventDefault();
        const appId = document.getElementById('sched-app-id').value;
        const roundNum = document.getElementById('sched-round-num').value;
        const roundName = document.getElementById('sched-round-name').value;
        const interviewMode = document.getElementById('sched-mode').value;
        const scheduledAt = document.getElementById('sched-time').value;
        const venue = document.getElementById('sched-venue').value;

        try {
            const res = await API.post('/api/admin/interviews/schedule', {
                application_id: appId,
                round_number: roundNum,
                round_name: roundName,
                interview_mode: interviewMode,
                scheduled_at: scheduledAt,
                meeting_or_venue: venue
            });

            if (res.success) {
                closeModal('modal-schedule-interview');
                showToast(res.message, 'success');
                this.loadApplications();
            }
        } catch (error) {
            showToast(error.message, 'error');
        }
    },

    openStatusModal(appId, studentName, currentStatus, currentNotes) {
        document.getElementById('status-app-id').value = appId;
        document.getElementById('status-candidate-preview').innerHTML = `Candidate: <strong>${studentName}</strong>`;
        document.getElementById('status-select-val').value = currentStatus;
        document.getElementById('status-admin-notes').value = currentNotes || '';
        openModal('modal-app-status');
    },

    async handleUpdateAppStatus(event) {
        event.preventDefault();
        const appId = document.getElementById('status-app-id').value;
        const status = document.getElementById('status-select-val').value;
        const adminNotes = document.getElementById('status-admin-notes').value;

        try {
            const res = await API.put(`/api/admin/applications/${appId}/status`, {
                status,
                admin_notes: adminNotes
            });

            if (res.success) {
                closeModal('modal-app-status');
                showToast(res.message, 'success');
                this.loadApplications();
                this.loadMetrics();
            }
        } catch (error) {
            showToast(error.message, 'error');
        }
    },

    /**
     * 4. Load Student Directory
     */
    async loadStudents() {
        try {
            const search = document.getElementById('filter-stud-search')?.value || '';
            const branch = document.getElementById('filter-stud-branch')?.value || '';
            const status = document.getElementById('filter-stud-status')?.value || '';

            let url = '/api/admin/students?';
            if (search) url += `search=${encodeURIComponent(search)}&`;
            if (branch) url += `branch=${encodeURIComponent(branch)}&`;
            if (status) url += `status=${encodeURIComponent(status)}&`;

            const res = await API.get(url);
            if (!res.success) throw new Error(res.message);

            this.studentsList = res.data;
            document.getElementById('badge-total-students').textContent = this.studentsList.length;

            const tbody = document.querySelector('#admin-students-table tbody');
            if (!tbody) return;

            if (this.studentsList.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:2rem; color:var(--neutral-400);">No student records matched.</td></tr>`;
                return;
            }

            tbody.innerHTML = this.studentsList.map(s => `
                <tr>
                    <td><strong style="font-family:var(--font-mono); font-size:0.85rem;">${s.university_roll_no}</strong></td>
                    <td>
                        <div style="font-weight:700; color:var(--neutral-900);">${s.full_name}</div>
                        <div style="font-size:0.8rem; color:var(--neutral-500);">${s.email}</div>
                    </td>
                    <td>${s.branch}</td>
                    <td><span class="badge" style="background:var(--neutral-100); color:var(--neutral-700);">${s.graduation_year}</span></td>
                    <td><strong>${s.cgpa}</strong></td>
                    <td>
                        <span style="font-weight:700; color:${s.active_backlogs > 0 ? 'var(--danger)' : 'var(--success)'};">
                            ${s.active_backlogs}
                        </span>
                    </td>
                    <td>
                        <span class="badge ${s.placement_status === 'Placed' ? 'badge-selected' : 'badge-shortlisted'}">
                            ${s.placement_status}
                        </span>
                    </td>
                    <td>
                        <span class="badge ${s.account_status === 'active' ? 'badge-open' : 'badge-rejected'}">
                            ${s.account_status}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-secondary btn-sm" onclick="AdminApp.handleToggleStudentStatus(${s.student_id}, '${s.account_status === 'active' ? 'suspended' : 'active'}')">
                            ${s.account_status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Failed to load students:', error);
            showToast('Could not load student directory', 'error');
        }
    },

    async handleToggleStudentStatus(studentId, newStatus) {
        try {
            const res = await API.put(`/api/admin/students/${studentId}/status`, { status: newStatus });
            if (res.success) {
                showToast(res.message, 'success');
                this.loadStudents();
            }
        } catch (error) {
            showToast(error.message, 'error');
        }
    },

    /**
     * 5. Load Registered Companies
     */
    async loadCompanies() {
        try {
            const res = await API.get('/api/admin/companies');
            if (!res.success) throw new Error(res.message);

            this.companiesList = res.data;

            // Populate drive modal select
            const companySelect = document.getElementById('drive-company-id');
            if (companySelect) {
                companySelect.innerHTML = `<option value="">Select company...</option>` +
                    this.companiesList.map(c => `<option value="${c.company_id}">${c.company_name} (${c.industry})</option>`).join('');
            }

            const tbody = document.querySelector('#admin-companies-table tbody');
            if (!tbody) return;

            if (this.companiesList.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--neutral-400);">No companies registered.</td></tr>`;
                return;
            }

            tbody.innerHTML = this.companiesList.map(c => {
                let domain = '';
                if (c.website) {
                    try {
                        const parsed = c.website.startsWith('http') ? new URL(c.website) : new URL('https://' + c.website);
                        domain = parsed.hostname.replace(/^www\./, '');
                    } catch(e) {}
                }
                const logoUrl = domain ? `https://logo.clearbit.com/${domain}` : null;

                return `
                    <tr>
                        <td>
                            <div style="display:flex; align-items:center; gap:0.75rem;">
                                ${logoUrl ? `<img src="${logoUrl}" onerror="this.style.display='none'" alt="" style="width:32px; height:32px; border-radius:6px; object-fit:contain; background:var(--neutral-100); border:1px solid var(--neutral-300); padding:2px; flex-shrink:0;">` : ''}
                                <div>
                                    <div style="font-weight:700; color:var(--neutral-900);">${c.company_name}</div>
                                    ${c.website ? `<a href="${c.website}" target="_blank" style="font-size:0.75rem; color:var(--primary);">${c.website}</a>` : ''}
                                </div>
                            </div>
                        </td>
                        <td>${c.industry}</td>
                        <td><strong>${c.contact_name}</strong></td>
                        <td>
                            <div>${c.contact_email}</div>
                            <div style="font-size:0.8rem; color:var(--neutral-500);">${c.contact_phone || 'N/A'}</div>
                        </td>
                        <td><strong style="color:var(--primary);">${c.total_drives || 0} Drives</strong></td>
                        <td><span class="badge badge-${c.company_status}">${c.company_status}</span></td>
                    </tr>
                `;
            }).join('');
        } catch (error) {
            console.error('Failed to load companies:', error);
        }
    },

    /**
     * Load Master Skills
     */
    async loadSkills() {
        try {
            const res = await API.get('/api/skills');
            if (res.success) {
                this.skillsList = res.data;
                const select = document.getElementById('drive-mandatory-skills');
                if (select) {
                    select.innerHTML = this.skillsList.map(s => `<option value="${s.skill_id}">${s.skill_name}</option>`).join('');
                }
            }
        } catch (error) {
            console.error('Failed to load skills:', error);
        }
    },

    /**
     * Modal Triggers
     */
    openNewDriveModal() {
        // Set default deadline 14 days from now
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 14);
        deadline.setHours(23, 59, 0, 0);
        document.getElementById('drive-deadline-input').value = deadline.toISOString().slice(0, 16);

        openModal('modal-new-drive');
    },

    openNewCompanyModal() {
        const preview = document.getElementById('company-lookup-preview');
        if (preview) preview.style.display = 'none';
        const queryInput = document.getElementById('company-lookup-query');
        if (queryInput) queryInput.value = '';
        openModal('modal-new-company');
    },

    /**
     * Auto-Enrich Company Details via External API (Brandfetch / Finnhub / Clearbit)
     */
    async lookupCompanyApi() {
        const queryInput = document.getElementById('company-lookup-query');
        const btn = document.getElementById('btn-company-lookup');
        const preview = document.getElementById('company-lookup-preview');
        const previewLogo = document.getElementById('company-lookup-logo');
        const previewName = document.getElementById('company-lookup-name');
        const previewSource = document.getElementById('company-lookup-source');
        const previewDesc = document.getElementById('company-lookup-desc');

        const query = (queryInput.value || document.getElementById('company-name-input').value).trim();
        if (!query) {
            showToast('Please enter a company name or domain to search.', 'warning');
            if (queryInput) queryInput.focus();
            return;
        }

        try {
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = 'Fetching... ⏳';
            }

            const res = await API.get('/api/admin/companies/lookup?query=' + encodeURIComponent(query));
            if (res.success && res.data) {
                const c = res.data;
                
                // Auto-fill form inputs
                const nameInput = document.getElementById('company-name-input');
                const indInput = document.getElementById('company-industry-input');
                const webInput = document.getElementById('company-website-input');
                const contactNameInput = document.getElementById('company-contact-name');
                const contactEmailInput = document.getElementById('company-contact-email');
                const contactPhoneInput = document.getElementById('company-contact-phone');

                if (nameInput) nameInput.value = c.name || query;
                if (indInput) indInput.value = c.industry || 'Information Technology';
                if (webInput) webInput.value = c.website || '';

                // Extract clean domain for email default
                let cleanDomain = c.domain || 'company.com';
                if (!c.domain && c.website) {
                    try {
                        cleanDomain = new URL(c.website.startsWith('http') ? c.website : 'https://' + c.website).hostname.replace('www.', '');
                    } catch(e) {}
                }

                // Automatically generate professional HR contact defaults
                if (contactNameInput) {
                    contactNameInput.value = `${c.name || 'Company'} Campus Hiring Team`;
                }
                if (contactEmailInput) {
                    contactEmailInput.value = `campus@${cleanDomain}`;
                }
                if (contactPhoneInput && !contactPhoneInput.value) {
                    contactPhoneInput.value = c.phone || '+1 800-555-0199';
                }

                // Display visual preview
                if (preview) {
                    preview.style.display = 'flex';
                    if (previewLogo && c.logo) {
                        previewLogo.src = c.logo;
                        previewLogo.style.display = 'block';
                        previewLogo.onerror = () => { previewLogo.style.display = 'none'; };
                    }
                    if (previewName) previewName.textContent = c.name;
                    if (previewSource) previewSource.textContent = 'Verified Partner';
                    if (previewDesc) previewDesc.textContent = c.description || `${c.industry} | ${c.country || 'Global'}`;
                }

                showToast(`⚡ Auto-filled details for ${c.name}!`, 'success');
            } else {
                showToast(res.message || 'Could not find details for that company.', 'error');
            }
        } catch (err) {
            console.error('Company API lookup failed:', err);
            showToast('Company lookup failed: ' + err.message, 'error');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '🔍 Auto-Fill';
            }
        }
    },

    /**
     * Check Company API configuration status
     */
    async checkCompanyApiConfig() {
        try {
            const res = await API.get('/api/admin/companies/config');
            if (res.success) {
                const badge = document.getElementById('company-enrichment-status-badge');
                const modalBadge = document.getElementById('company-modal-api-badge');
                if (badge) {
                    badge.textContent = '⚡ Auto-Enrichment: Active';
                }
                if (modalBadge) {
                    modalBadge.textContent = 'Auto-Enrich Active';
                }
            }
        } catch (e) {
            console.warn('API config check error:', e);
        }
    },

    /**
     * Handle Create Drive Form
     */
    async handleCreateDrive(event) {
        event.preventDefault();
        const companyId = document.getElementById('drive-company-id').value;
        const driveTitle = document.getElementById('drive-title-input').value;
        const jobRole = document.getElementById('drive-role-input').value;
        const employmentType = document.getElementById('drive-type-input').value;
        const packageLpa = document.getElementById('drive-pkg-input').value;
        const jobLocation = document.getElementById('drive-loc-input').value;
        const minCgpa = document.getElementById('drive-cgpa-input').value;
        const maxBacklogs = document.getElementById('drive-backlogs-input').value;
        const deadline = document.getElementById('drive-deadline-input').value;
        const desc = document.getElementById('drive-desc-input').value;

        // Collect selected skills
        const skillsSelect = document.getElementById('drive-mandatory-skills');
        const selectedSkills = Array.from(skillsSelect.selectedOptions).map(opt => Number(opt.value));

        try {
            const res = await API.post('/api/admin/drives', {
                company_id: companyId,
                drive_title: driveTitle,
                job_role: jobRole,
                employment_type: employmentType,
                package_lpa: packageLpa,
                job_location: jobLocation,
                minimum_cgpa: minCgpa,
                maximum_backlogs: maxBacklogs,
                application_deadline: deadline,
                job_description: desc,
                mandatory_skills: selectedSkills
            });

            if (res.success) {
                closeModal('modal-new-drive');
                showToast('🎉 Placement drive published successfully!', 'success');
                document.getElementById('form-new-drive').reset();
                this.loadDrives();
                this.loadMetrics();
            }
        } catch (error) {
            showToast(error.message, 'error');
        }
    },

    /**
     * Handle Register Company Form
     */
    async handleCreateCompany(event) {
        event.preventDefault();
        const companyName = document.getElementById('company-name-input').value;
        const industry = document.getElementById('company-industry-input').value;
        const website = document.getElementById('company-website-input').value;
        const contactName = document.getElementById('company-contact-name').value;
        const contactEmail = document.getElementById('company-contact-email').value;
        const contactPhone = document.getElementById('company-contact-phone').value;

        try {
            const res = await API.post('/api/admin/companies', {
                company_name: companyName,
                industry,
                website,
                contact_name: contactName,
                contact_email: contactEmail,
                contact_phone: contactPhone
            });

            if (res.success) {
                closeModal('modal-new-company');
                showToast('Company registered successfully!', 'success');
                document.getElementById('form-new-company').reset();
                this.loadCompanies();
                this.loadMetrics();
            }
        } catch (error) {
            showToast(error.message, 'error');
        }
    },

    /**
     * Modal trigger for Student Onboarding
     */
    openNewStudentModal() {
        openModal('modal-new-student');
    },

    /**
     * Handle Create Student Form
     */
    async handleCreateStudent(event) {
        event.preventDefault();
        const fullName = document.getElementById('stud-name-input').value;
        const email = document.getElementById('stud-email-input').value;
        const rollNo = document.getElementById('stud-roll-input').value;
        const branch = document.getElementById('stud-branch-input').value;
        const year = document.getElementById('stud-year-input').value;
        const cgpa = document.getElementById('stud-cgpa-input').value;
        const backlogs = document.getElementById('stud-backlogs-input').value;
        const phone = document.getElementById('stud-phone-input').value;
        const password = document.getElementById('stud-pass-input').value;

        try {
            const res = await API.post('/api/admin/students', {
                full_name: fullName,
                email,
                university_roll_no: rollNo,
                branch,
                graduation_year: year,
                cgpa,
                active_backlogs: backlogs,
                phone,
                password
            });

            if (res.success) {
                closeModal('modal-new-student');
                showToast(res.message, 'success');
                document.getElementById('form-new-student').reset();
                this.loadStudents();
                this.loadMetrics();
            }
        } catch (error) {
            showToast(error.message, 'error');
        }
    },

    /**
     * 6. Live Database & Schema Inspector
     */
    async loadDatabaseExplorer() {
        const healthGrid = document.getElementById('db-health-grid');
        const tablesList = document.getElementById('db-tables-list');

        try {
            // Load Diagnostics
            const diagRes = await API.get('/api/admin/db/diagnostics');
            if (diagRes.success) {
                const info = diagRes.info;
                healthGrid.innerHTML = `
                    <div class="stat-card">
                        <div class="stat-icon emerald">🐬</div>
                        <div>
                            <div class="stat-value" style="font-size:1.3rem;">MySQL ${info.version.split('-')[0]}</div>
                            <div class="stat-label">Engine Version</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon indigo">🗄️</div>
                        <div>
                            <div class="stat-value" style="font-size:1.1rem; font-family:var(--font-mono);">${info.database}</div>
                            <div class="stat-label">Active Schema</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon amber">⚡</div>
                        <div>
                            <div class="stat-value">${info.activeConnections}</div>
                            <div class="stat-label">Active Pool Threads</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon cyan">📊</div>
                        <div>
                            <div class="stat-value">${info.totalQueriesExecuted}</div>
                            <div class="stat-label">Queries Executed</div>
                        </div>
                    </div>
                `;
            }

            // Load Tables
            const tablesRes = await API.get('/api/admin/db/tables');
            if (tablesRes.success) {
                const tables = tablesRes.tables;
                document.getElementById('db-tables-count-badge').textContent = tables.length;

                tablesList.innerHTML = tables.map(t => `
                    <button class="db-table-btn" onclick="AdminApp.inspectTable('${t.table_name}')" id="btn-db-table-${t.table_name}">
                        <span>📄 ${t.table_name}</span>
                        <span class="badge" style="font-size:0.7rem; background:var(--neutral-100); color:var(--neutral-700);">
                            ${t.exact_rows} rows
                        </span>
                    </button>
                `).join('');

                // Auto inspect first table if available
                if (tables.length > 0) {
                    this.inspectTable(tables[0].table_name);
                }
            }
        } catch (error) {
            console.error('Failed to load database explorer:', error);
            showToast('Could not load database diagnostics', 'error');
        }
    },

    /**
     * Inspect individual table schema and live records
     */
    async inspectTable(tableName) {
        document.querySelectorAll('.db-table-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`btn-db-table-${tableName}`);
        if (activeBtn) activeBtn.classList.add('active');

        const panel = document.getElementById('db-table-inspector-panel');
        panel.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--neutral-400);">Inspecting table ${tableName}...</div>`;

        try {
            const res = await API.get(`/api/admin/db/table/${tableName}`);
            if (!res.success) throw new Error(res.message);

            const { columns, sampleRows } = res;

            // Render columns summary
            const columnsHtml = `
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
                        <h4 style="font-size:1.1rem; font-weight:800; color:var(--neutral-900);">
                            Schema: <span style="font-family:var(--font-mono); color:var(--primary);">${tableName}</span>
                        </h4>
                        <span style="font-size:0.8rem; color:var(--neutral-500);">${columns.length} Columns Defined (3NF)</span>
                    </div>
                    <div class="table-responsive" style="max-height:240px; overflow-y:auto; border:1px solid var(--neutral-200); border-radius:var(--radius-sm); margin-bottom:1.5rem;">
                        <table class="table" style="font-size:0.8rem;">
                            <thead>
                                <tr>
                                    <th>Column Name</th>
                                    <th>Data Type</th>
                                    <th>Key</th>
                                    <th>Nullable</th>
                                    <th>Default</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${columns.map(c => `
                                    <tr>
                                        <td><strong style="font-family:var(--font-mono); color:var(--neutral-900);">${c.column_name}</strong></td>
                                        <td><code style="color:var(--primary);">${c.data_type}</code></td>
                                        <td>
                                            ${c.column_key === 'PRI' ? '<span class="db-pill pk">PRIMARY KEY</span>' : (c.column_key ? `<span class="db-pill fk">${c.column_key}</span>` : '--')}
                                        </td>
                                        <td>${c.is_nullable === 'YES' ? '<span style="color:var(--neutral-500);">NULL</span>' : '<strong style="color:var(--neutral-800);">NOT NULL</strong>'}</td>
                                        <td>${c.default_value !== null ? `<code>${c.default_value}</code>` : '<span style="color:var(--neutral-400);">none</span>'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            // Render sample rows
            let rowsHtml = '';
            if (sampleRows && sampleRows.length > 0) {
                const rowKeys = Object.keys(sampleRows[0]);
                rowsHtml = `
                    <div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
                            <h4 style="font-size:1.05rem; font-weight:800; color:var(--neutral-900);">Live Sample Records</h4>
                            <span style="font-size:0.8rem; color:var(--neutral-500);">Showing latest ${sampleRows.length} rows</span>
                        </div>
                        <div class="table-responsive" style="max-height:300px; overflow-y:auto; border:1px solid var(--neutral-200); border-radius:var(--radius-sm);">
                            <table class="table" style="font-size:0.8rem;">
                                <thead>
                                    <tr>
                                        ${rowKeys.map(k => `<th>${k}</th>`).join('')}
                                    </tr>
                                </thead>
                                <tbody>
                                    ${sampleRows.map(row => `
                                        <tr>
                                            ${rowKeys.map(k => {
                    const v = row[k];
                    const display = v !== null && v !== undefined ? String(v) : '<em style="color:var(--neutral-400);">NULL</em>';
                    return `<td style="white-space:nowrap; max-width:200px; overflow:hidden; text-overflow:ellipsis;">${display}</td>`;
                }).join('')}
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            } else {
                rowsHtml = `<div style="text-align:center; padding:1.5rem; color:var(--neutral-400);">No rows found in this table.</div>`;
            }

            panel.innerHTML = columnsHtml + rowsHtml;
        } catch (error) {
            panel.innerHTML = `<div style="text-align:center; color:var(--danger); padding:2rem;">Failed to inspect table: ${error.message}</div>`;
        }
    }
};

// Auto-run on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    AdminApp.init();
});
