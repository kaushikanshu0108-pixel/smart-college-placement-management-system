/**
 * Smart College Placement Management System (SCPMS)
 * Student Portal Interactive Controller
 */

const StudentApp = {
    currentUser: null,
    dashboardData: null,
    drivesList: [],
    availableSkills: [],
    selectedDriveForApply: null,

    /**
     * Initialization lifecycle
     */
    async init() {
        this.currentUser = await Auth.protectPage('student');
        if (!this.currentUser) return;

        await Promise.all([
            this.loadDashboard(),
            this.loadDrives(),
            this.loadApplications(),
            this.loadSkillsAndProfile()
        ]);
    },

    /**
     * Tab switching handler
     */
    switchTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        const targetTab = document.getElementById(tabId);
        if (targetTab) targetTab.classList.add('active');

        // Highlight matching button
        const buttons = document.querySelectorAll('.tab-btn');
        buttons.forEach(btn => {
            if (btn.getAttribute('onclick')?.includes(tabId)) {
                btn.classList.add('active');
            }
        });
    },

    /**
     * 1. Load Student Dashboard Metrics & Profile
     */
    async loadDashboard() {
        try {
            const res = await API.get('/api/student/dashboard');
            if (!res.success) throw new Error(res.message);

            const { student, stats, upcomingInterviews, notifications } = res.data;
            this.dashboardData = res.data;

            // Render Profile Header
            document.getElementById('student-name').textContent = student.fullName;
            document.getElementById('profile-avatar').textContent = student.fullName.charAt(0).toUpperCase();
            document.getElementById('student-roll').textContent = student.rollNo;
            document.getElementById('student-branch').textContent = student.branch;
            document.getElementById('student-year').textContent = student.graduationYear;
            document.getElementById('student-cgpa').textContent = student.cgpa;
            
            const backlogElem = document.getElementById('student-backlogs');
            backlogElem.textContent = student.activeBacklogs;
            if (student.activeBacklogs > 0) {
                backlogElem.style.color = 'var(--danger)';
            } else {
                backlogElem.style.color = 'var(--success)';
            }

            // Summary Stats
            document.getElementById('count-applied').textContent = stats.total_applications || 0;
            document.getElementById('count-shortlisted').textContent = stats.shortlisted_count || 0;
            document.getElementById('count-progress').textContent = stats.in_progress_count || 0;
            document.getElementById('count-selected').textContent = stats.selected_count || 0;

            document.getElementById('tab-badge-apps').textContent = stats.total_applications || 0;

            // Upcoming Interviews
            const intContainer = document.getElementById('interviews-list-container');
            if (upcomingInterviews && upcomingInterviews.length > 0) {
                intContainer.innerHTML = upcomingInterviews.map(i => `
                    <div style="background:var(--neutral-50); border:1px solid var(--neutral-200); border-radius:var(--radius-sm); padding:1rem; margin-bottom:0.75rem;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <div>
                                <strong style="color:var(--neutral-900); font-size:1rem;">Round ${i.round_number}: ${i.round_name}</strong>
                                <div style="font-size:0.85rem; color:var(--primary); font-weight:600; margin-top:2px;">${i.company_name} — ${i.job_role}</div>
                            </div>
                            <span class="badge" style="background:#e0e7ff; color:#3730a3;">${i.interview_mode.toUpperCase()}</span>
                        </div>
                        <div style="margin-top:0.6rem; font-size:0.85rem; color:var(--neutral-600); display:flex; flex-direction:column; gap:0.25rem;">
                            <div>⏰ <strong>Schedule:</strong> ${formatDateTime(i.scheduled_at)}</div>
                            <div>📍 <strong>Venue/Link:</strong> <span style="font-family:var(--font-mono);">${i.meeting_or_venue}</span></div>
                        </div>
                    </div>
                `).join('');
            } else {
                intContainer.innerHTML = `<div style="text-align:center; color:var(--neutral-400); padding:2rem;">No pending interview schedules. Check back soon!</div>`;
            }

            // Notifications Feed
            const notifContainer = document.getElementById('notifications-list-container');
            if (notifications && notifications.length > 0) {
                notifContainer.innerHTML = notifications.map(n => `
                    <div style="padding:0.75rem 1rem; border-bottom:1px solid var(--neutral-200); ${n.is_read ? 'opacity:0.7;' : 'background:#f8fafc; border-left:3px solid var(--primary);'} display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div style="font-weight:700; font-size:0.9rem; color:var(--neutral-900);">${n.title}</div>
                            <div style="font-size:0.825rem; color:var(--neutral-600); margin-top:2px;">${n.message}</div>
                            <div style="font-size:0.75rem; color:var(--neutral-400); margin-top:4px;">${formatDateTime(n.created_at)}</div>
                        </div>
                        ${!n.is_read ? `
                            <button class="btn btn-secondary btn-sm" onclick="StudentApp.markNotificationRead(${n.notification_id})">
                                ✓ Read
                            </button>
                        ` : ''}
                    </div>
                `).join('');
            } else {
                notifContainer.innerHTML = `<div style="text-align:center; color:var(--neutral-400); padding:2rem;">No notifications.</div>`;
            }
        } catch (error) {
            console.error('Failed to load dashboard:', error);
            showToast('Could not refresh dashboard metrics', 'error');
        }
    },

    /**
     * Mark single notification as read
     */
    async markNotificationRead(notifId) {
        try {
            await API.put(`/api/student/notifications/${notifId}/read`);
            this.loadDashboard();
        } catch (e) {
            console.error(e);
        }
    },

    /**
     * 2. Load Placement Drives with Live Eligibility
     */
    async loadDrives() {
        try {
            const res = await API.get('/api/student/drives');
            if (!res.success) throw new Error(res.message);

            this.drivesList = res.data;
            document.getElementById('tab-badge-drives').textContent = this.drivesList.length;
            this.filterDrives();
        } catch (error) {
            console.error('Failed to load drives:', error);
            showToast('Could not load placement drives', 'error');
        }
    },

    filterDrives() {
        const query = (document.getElementById('drive-search')?.value || '').toLowerCase().trim();
        const filter = document.getElementById('drive-filter-eligibility')?.value || 'all';

        const filtered = this.drivesList.filter(d => {
            const matchQuery = d.job_role.toLowerCase().includes(query) || d.company_name.toLowerCase().includes(query);
            if (!matchQuery) return false;

            if (filter === 'eligible') return d.isEligible && !d.hasApplied;
            if (filter === 'applied') return d.hasApplied;
            return true;
        });

        document.getElementById('drives-count-summary').textContent = `Showing ${filtered.length} of ${this.drivesList.length} drives`;
        this.renderDrives(filtered);
    },

    renderDrives(drives) {
        const container = document.getElementById('student-drives-grid');
        if (!container) return;

        if (drives.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: white; border-radius: var(--radius-md); border: 1px dashed var(--neutral-300);">
                    <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
                    <div style="font-weight: 700; color: var(--neutral-800);">No matching placement drives found</div>
                    <div style="font-size: 0.85rem; color: var(--neutral-500); margin-top: 0.25rem;">Try adjusting your search criteria or filters.</div>
                </div>
            `;
            return;
        }

        container.innerHTML = drives.map(d => {
            const isEligible = d.isEligible;
            const hasApplied = d.hasApplied;

            let actionBtnHtml = '';
            if (hasApplied) {
                actionBtnHtml = `
                    <button class="btn btn-secondary" style="width: 100%; cursor: default;" disabled>
                        ✓ Applied (Status: ${d.application_status.toUpperCase()})
                    </button>
                `;
            } else if (isEligible) {
                actionBtnHtml = `
                    <button class="btn btn-primary" style="width: 100%; font-weight:700;" onclick="StudentApp.openApplyModal(${d.drive_id})">
                        ⚡ Apply Now
                    </button>
                `;
            } else {
                actionBtnHtml = `
                    <button class="btn btn-secondary" style="width: 100%;" disabled title="${d.ineligibilityReasons.join('; ')}">
                        ❌ Not Eligible to Apply
                    </button>
                `;
            }

            // Skills chips
            const skillsHtml = d.requiredSkills && d.requiredSkills.length > 0 ? `
                <div class="skill-tag-group">
                    ${d.requiredSkills.map(s => `
                        <span class="skill-tag ${s.is_mandatory ? 'mandatory' : ''}" title="${s.is_mandatory ? 'Mandatory Skill' : 'Preferred Skill'}">
                            ${s.is_mandatory ? '⭐ ' : ''}${s.skill_name}
                        </span>
                    `).join('')}
                </div>
            ` : '<div style="font-size:0.8rem; color:var(--neutral-400); margin-bottom:1rem;">No specific skills listed.</div>';

            // Eligibility Banner
            let eligibilityHtml = '';
            if (hasApplied) {
                eligibilityHtml = `
                    <div class="eligibility-banner" style="background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe;">
                        ℹ️ Application Submitted on ${formatDate(d.application_date)}
                    </div>
                `;
            } else if (isEligible) {
                eligibilityHtml = `
                    <div class="eligibility-banner eligible">
                        ✅ You meet all criteria, deadlines & skills!
                    </div>
                `;
            } else {
                eligibilityHtml = `
                    <div class="eligibility-banner ineligible" title="${d.ineligibilityReasons.join(' | ')}">
                        ⚠️ Ineligible: ${d.ineligibilityReasons[0]}
                    </div>
                `;
            }

            return `
                <div class="drive-card ${hasApplied ? '' : (isEligible ? 'eligible' : 'ineligible')}">
                    <div>
                        <div class="drive-top">
                            <div class="drive-company">${d.company_name}</div>
                            <span class="badge badge-${d.drive_status}">${d.drive_status}</span>
                        </div>
                        <h3 class="drive-role">${d.job_role}</h3>
                        <div class="drive-package">
                            ${d.package_lpa} <span>LPA</span>
                        </div>

                        <div class="drive-criteria">
                            <div class="criteria-item">
                                <span>Min CGPA:</span>
                                <strong>${d.minimum_cgpa}</strong>
                            </div>
                            <div class="criteria-item">
                                <span>Max Backlogs:</span>
                                <strong>${d.maximum_backlogs}</strong>
                            </div>
                            <div class="criteria-item">
                                <span>Location:</span>
                                <strong>${d.job_location}</strong>
                            </div>
                            <div class="criteria-item">
                                <span>Deadline:</span>
                                <strong>${formatDate(d.application_deadline)}</strong>
                            </div>
                        </div>

                        <div style="font-size:0.8rem; font-weight:700; color:var(--neutral-600); margin-bottom:0.4rem;">
                            Skills Criteria:
                        </div>
                        ${skillsHtml}

                        ${eligibilityHtml}
                    </div>

                    <div style="display:flex; gap:0.5rem; margin-top: 1rem; align-items:stretch;">
                        <button class="btn btn-secondary" style="flex:1; padding:0.65rem 0.5rem;" onclick="StudentApp.openDriveDetailsModal(${d.drive_id})">
                            🔍 Details
                        </button>
                        <div style="flex:2;">
                            ${actionBtnHtml}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Open comprehensive Drive Details & Eligibility Checklist Modal
     */
    openDriveDetailsModal(driveId) {
        const drive = this.drivesList.find(d => d.drive_id === driveId);
        if (!drive || !this.dashboardData) return;

        const student = this.dashboardData.student;
        document.getElementById('modal-detail-role').textContent = drive.job_role;
        document.getElementById('modal-detail-company').textContent = drive.company_name;
        document.getElementById('modal-detail-package').textContent = `${drive.package_lpa} LPA`;
        document.getElementById('modal-detail-location').textContent = `${drive.job_location} (${drive.employment_type})`;
        document.getElementById('modal-detail-deadline').textContent = formatDate(drive.application_deadline);
        document.getElementById('modal-detail-desc').textContent = drive.job_description || 'Detailed technical roles, job prerequisites, and on-campus interview procedures are coordinated by the placement cell.';

        // Build checklist items
        const meetsCgpa = parseFloat(student.cgpa) >= parseFloat(drive.minimum_cgpa);
        const meetsBacklogs = parseInt(student.activeBacklogs, 10) <= parseInt(drive.maximum_backlogs, 10);
        const meetsDeadline = new Date(drive.application_deadline) >= new Date();
        const isOpen = drive.drive_status === 'open';

        const checklistContainer = document.getElementById('modal-checklist-container');
        checklistContainer.innerHTML = `
            <div class="checklist-item ${meetsCgpa ? 'pass' : 'fail'}">
                <div>
                    <strong>1. CGPA Threshold:</strong> Min Required: <code>${drive.minimum_cgpa}</code> • Your CGPA: <code>${student.cgpa}</code>
                </div>
                <span>${meetsCgpa ? '✅ Eligible' : '❌ Below Cutoff'}</span>
            </div>

            <div class="checklist-item ${meetsBacklogs ? 'pass' : 'fail'}">
                <div>
                    <strong>2. Active Backlogs Ceiling:</strong> Max Allowed: <code>${drive.maximum_backlogs}</code> • Your Backlogs: <code>${student.activeBacklogs}</code>
                </div>
                <span>${meetsBacklogs ? '✅ Eligible' : '❌ Exceeded'}</span>
            </div>

            <div class="checklist-item ${meetsDeadline ? 'pass' : 'fail'}">
                <div>
                    <strong>3. Application Window:</strong> Deadline: <code>${formatDate(drive.application_deadline)}</code>
                </div>
                <span>${meetsDeadline ? '✅ Window Active' : '❌ Expired'}</span>
            </div>

            <div class="checklist-item ${isOpen ? 'pass' : 'fail'}">
                <div>
                    <strong>4. Drive Status:</strong> Current status: <code>${drive.drive_status.toUpperCase()}</code>
                </div>
                <span>${isOpen ? '✅ Open' : '❌ Not Accepting'}</span>
            </div>
        `;

        // Footer button
        const footer = document.getElementById('modal-detail-footer');
        if (drive.hasApplied) {
            footer.innerHTML = `
                <span class="badge badge-${drive.application_status}" style="font-size:0.9rem; margin-right:auto;">
                    Application Submitted (${drive.application_status.toUpperCase()})
                </span>
                <button type="button" class="btn btn-secondary" onclick="closeModal('modal-drive-details')">Close</button>
            `;
        } else if (drive.isEligible) {
            footer.innerHTML = `
                <button type="button" class="btn btn-secondary" onclick="closeModal('modal-drive-details')">Close</button>
                <button type="button" class="btn btn-primary" onclick="closeModal('modal-drive-details'); StudentApp.openApplyModal(${drive.drive_id})">
                    ⚡ Apply for this Drive
                </button>
            `;
        } else {
            footer.innerHTML = `
                <span style="font-size:0.85rem; color:var(--danger); font-weight:600; margin-right:auto;">
                    ⚠️ You do not meet one or more criteria for this drive.
                </span>
                <button type="button" class="btn btn-secondary" onclick="closeModal('modal-drive-details')">Close</button>
            `;
        }

        openModal('modal-drive-details');
    },

    /**
     * Open confirmation modal to apply
     */
    openApplyModal(driveId) {
        const drive = this.drivesList.find(d => d.drive_id === driveId);
        if (!drive) return;

        this.selectedDriveForApply = drive;
        document.getElementById('modal-apply-role').textContent = drive.job_role;
        document.getElementById('modal-apply-company').textContent = drive.company_name;
        document.getElementById('modal-apply-package').textContent = `Package: ${drive.package_lpa} LPA • Location: ${drive.job_location}`;

        const confirmBtn = document.getElementById('btn-confirm-apply');
        confirmBtn.onclick = () => this.handleApply(drive.drive_id);

        openModal('apply-modal');
    },

    /**
     * Submit application via API
     */
    async handleApply(driveId) {
        const confirmBtn = document.getElementById('btn-confirm-apply');
        try {
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Submitting...';

            const res = await API.post('/api/student/apply', { drive_id: driveId });
            if (res.success) {
                closeModal('apply-modal');
                showToast(res.message || '🎉 Application submitted successfully!', 'success');
                // Refresh data
                await Promise.all([this.loadDrives(), this.loadApplications(), this.loadDashboard()]);
            }
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm & Apply';
        }
    },

    /**
     * 3. Load Student Applications & Interview Rounds
     */
    async loadApplications() {
        try {
            const res = await API.get('/api/student/applications');
            if (!res.success) throw new Error(res.message);

            const apps = res.data;
            const container = document.getElementById('applications-table-container');
            if (!container) return;

            if (apps.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 3rem; color: var(--neutral-400);">
                        You have not applied for any placement drives yet.
                        <div style="margin-top: 1rem;">
                            <button class="btn btn-primary btn-sm" onclick="StudentApp.switchTab('tab-drives')">Browse Available Drives</button>
                        </div>
                    </div>
                `;
                return;
            }

            container.innerHTML = `
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Company & Role</th>
                                <th>Package</th>
                                <th>Applied On</th>
                                <th>Overall Status</th>
                                <th>Interview Rounds & Feedback</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${apps.map(a => {
                                const rounds = a.interviewRounds || [];
                                const roundsContent = rounds.length > 0 ? `
                                    <div class="rounds-timeline">
                                        ${rounds.map(r => `
                                            <div class="round-item ${r.result_status || ''}">
                                                <div class="round-content">
                                                    <div style="display:flex; justify-content:space-between; align-items:center;">
                                                        <strong>Round ${r.round_number}: ${r.round_name}</strong>
                                                        <span class="badge ${r.result_status === 'passed' ? 'badge-selected' : (r.result_status === 'failed' ? 'badge-rejected' : 'badge-shortlisted')}">
                                                            ${r.result_status ? r.result_status.toUpperCase() : 'PENDING'}
                                                        </span>
                                                    </div>
                                                    <div style="font-size:0.8rem; color:var(--neutral-500); margin-top:2px;">
                                                        ${formatDateTime(r.scheduled_at)} • Mode: ${r.interview_mode}
                                                    </div>
                                                    ${r.feedback ? `<div style="font-size:0.8rem; color:var(--neutral-700); margin-top:4px; background:white; padding:4px 8px; border-radius:4px; border:1px solid var(--neutral-200);">💬 <em>${r.feedback}</em></div>` : ''}
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : '<span style="font-size:0.85rem; color:var(--neutral-400);">No interview rounds scheduled yet.</span>';

                                return `
                                    <tr>
                                        <td>
                                            <div style="font-weight:700; color:var(--neutral-900); font-size:0.95rem;">${a.job_role}</div>
                                            <div style="font-size:0.85rem; color:var(--neutral-500); font-weight:600;">${a.company_name}</div>
                                        </td>
                                        <td><strong>${a.package_lpa} LPA</strong></td>
                                        <td>${formatDate(a.application_date)}</td>
                                        <td>
                                            <span class="badge badge-${a.application_status}">${a.application_status.toUpperCase()}</span>
                                        </td>
                                        <td style="max-width: 400px;">
                                            ${roundsContent}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (error) {
            console.error('Failed to load applications:', error);
            showToast('Could not load application history', 'error');
        }
    },

    /**
     * 4. Load Technical Skills and Student Profile
     */
    async loadSkillsAndProfile() {
        try {
            // Load master taxonomy of skills
            const skillsRes = await API.get('/api/skills');
            if (skillsRes.success) {
                this.availableSkills = skillsRes.data;
                const selectElem = document.getElementById('select-new-skill');
                if (selectElem) {
                    selectElem.innerHTML = `<option value="">Select a skill to add...</option>` + 
                        this.availableSkills.map(s => `<option value="${s.skill_id}">${s.skill_name}</option>`).join('');
                }
            }

            // Load student profile & current skills
            const profileRes = await API.get('/api/student/profile');
            if (profileRes.success) {
                const s = profileRes.data;
                document.getElementById('profile-phone').value = s.phone || '';
                document.getElementById('profile-resume').value = s.resume_url || '';
                document.getElementById('profile-summary').value = s.profile_summary || '';

                this.renderStudentSkills(s.skills || []);
            }
        } catch (error) {
            console.error('Failed to load skills/profile:', error);
        }
    },

    renderStudentSkills(skills) {
        const container = document.getElementById('student-skills-badges');
        if (!container) return;

        if (skills.length === 0) {
            container.innerHTML = `<div style="font-size:0.85rem; color:var(--neutral-400);">No skills added yet. Add your programming languages & frameworks above.</div>`;
            return;
        }

        container.innerHTML = skills.map(s => `
            <div class="user-pill" style="padding:0.35rem 0.65rem 0.35rem 0.85rem; background:white; border-color:var(--neutral-300);">
                <span style="font-weight:700; color:var(--neutral-800);">${s.skill_name}</span>
                <span class="badge" style="font-size:0.7rem; background:var(--primary-light); color:var(--primary); text-transform:capitalize;">${s.proficiency}</span>
                <button onclick="StudentApp.handleDeleteSkill(${s.skill_id})" style="background:none; border:none; cursor:pointer; color:var(--neutral-400); font-size:1rem; line-height:1; padding:0 2px;" title="Remove Skill">
                    &times;
                </button>
            </div>
        `).join('');
    },

    async handleAddSkill(event) {
        event.preventDefault();
        const skillId = document.getElementById('select-new-skill').value;
        const proficiency = document.getElementById('select-skill-level').value;

        if (!skillId) return;

        try {
            const res = await API.post('/api/student/skills', { skill_id: skillId, proficiency });
            if (res.success) {
                showToast('Skill added to profile!', 'success');
                // Refresh skills and drives eligibility
                await Promise.all([this.loadSkillsAndProfile(), this.loadDrives()]);
            }
        } catch (error) {
            showToast(error.message, 'error');
        }
    },

    async handleDeleteSkill(skillId) {
        try {
            const res = await API.delete(`/api/student/skills/${skillId}`);
            if (res.success) {
                showToast('Skill removed.', 'info');
                await Promise.all([this.loadSkillsAndProfile(), this.loadDrives()]);
            }
        } catch (error) {
            showToast(error.message, 'error');
        }
    },

    async handleUpdateProfile(event) {
        event.preventDefault();
        const phone = document.getElementById('profile-phone').value;
        const resume_url = document.getElementById('profile-resume').value;
        const profile_summary = document.getElementById('profile-summary').value;

        try {
            const res = await API.put('/api/student/profile', { phone, resume_url, profile_summary });
            if (res.success) {
                showToast('Profile updated successfully!', 'success');
            }
        } catch (error) {
            showToast(error.message, 'error');
        }
    }
};

// Auto-run on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    StudentApp.init();
});
