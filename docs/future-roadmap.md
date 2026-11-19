# SCPMS — Upcoming Feature Architecture: AI Skill Match & Readiness Advisor

## Overview
The **AI Skill Match & Readiness Advisor** will analyze an enrolled student's verified skills against the mandatory and preferred skills required by active placement drives. It will calculate a live **Match Percentage (0–100%)**, surface gaps, and provide actionable recommendations.

---

## 1. Core Data Models Involved
- `students` & `student_skills` & `skills`: Student's current technical proficiency matrix.
- `placement_drives` & `drive_skills`: Drive requirements, minimum CGPA, backlog thresholds, and skill tags.
- `applications`: Current application statuses.

---

## 2. Planned Features to Implement in Next Session
1. **Dynamic Match Calculation Algorithm**:
   - Compares student skills vector with drive mandatory/preferred skills.
   - Calculates weighted score:
     $$\text{Score} = w_{\text{skills}} \times S_{\text{skills}} + w_{\text{cgpa}} \times S_{\text{cgpa}} + w_{\text{backlogs}} \times S_{\text{backlogs}}$$
2. **Student Portal UI Enhancements**:
   - Live **Match Badge** on drive cards:
     - `🟢 85% Match — High Compatibility`
     - `🟡 60% Match — Moderate (Missing 2 Skills)`
     - `🔴 35% Match — Low Compatibility`
   - **Skill Gap Inspector**:
     - Visual breakdown: Matched skills (green checkmarks) vs. Missing skills (yellow alert tags).
3. **Smart Learning Recommendations**:
   - Automated insights: *"Adding Docker and Redis will make you eligible for 4 additional Tier-1 drives."*
4. **Backend API Endpoint**:
   - `GET /api/student/drives/:id/match-score`
   - `GET /api/student/readiness-summary`

---

## 3. Current System State at Handover
- **Backend Server**: Live on port `5000` (PID / Daemon active).
- **Database**: Local MySQL 8.0 on port `3306`, DB `smart_college_placement`.
- **API Integrations**: Web3Forms, Brandfetch, Finnhub configured in `.env`.
- **UI State**: Dark mode fully functional, 5 Chart.js charts active, modal footer scrolling pinned.

