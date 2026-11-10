# Project Hub — Company Innovation Showcase & Community Platform

Project Hub is an enterprise-grade, secure, private showcase and community platform designed for company employees to discover approved internal tools and innovations, submit projects, like and bookmark initiatives, cast evaluated feedback votes (**Good** vs **Needs Improvement**), explore real-time leaderboards in the **Project Arena**, and maintain verified employee portfolios.

---

## 🚀 Key Features

### 1. Employee Innovation Showcase (Explore)
- **Approved Project Cards**: Responsive cards displaying cover images, titles, descriptions, technology badges, category, live/completed statuses, like counts, and voting percentages.
- **Search & Multi-Dimensional Filters**: Filter by category, technology tags, project status, department, and sort by recently approved, most liked, most evaluated, and top rated.
- **Direct Engagement**: Like / unlike projects (server-enforced self-liking prohibited), and save projects privately to bookmarks.

### 2. Server-Authoritative Voting Engine
- **Binary Evaluation**: Peer feedback via `GOOD` or `NEEDS_IMPROVEMENT`.
- **Integrity Constraints**:
  - Deterministic document IDs: `/votes/${projectId}_${userId}` physically prevent duplicate vote records.
  - One active vote per user per project with vote modification support.
  - Project creators are forbidden from voting on their own projects.
  - Suspended accounts cannot vote.
  - Consistent percentage calculation: $\text{Good \%} = \frac{\text{Good Votes}}{\text{Total Valid Votes}} \times 100$.
  - Atomic transactions guarantee zero race conditions or lost updates.

### 3. Project Arena & Ranking Engine
Dedicated competitive leaderboard with 5 distinct sections:
- **A. Top Rated**: Sorted by `goodPercentage`, gated by a **minimum vote threshold** (default: 10 votes). Projects below the threshold are kept in an awaiting-qualification list to prevent single-vote 100% distortions.
- **B. Most Liked**: Sorted by total valid likes.
- **C. Most Evaluated**: Sorted by total valid votes.
- **D. Trending Velocity**: Time-decay algorithm balancing votes ($3\times$), likes ($2\times$), and freshness:
  $$\text{Trending Score} = \frac{(\text{Likes} \times 2) + (\text{Total Votes} \times 3) + (\text{Good Votes} \times 1.5)}{(\text{Age In Days} + 2)^{1.5}}$$
- **E. Recently Approved**: Sorted by approval date.
- **Deterministic Tie-Breaking**: Explicit secondary and tertiary sorting criteria.

### 4. Dual-State Project Revision Workflow
- Submissions start in `PENDING_REVIEW` and enter the Admin moderation queue.
- If an employee updates an already **APPROVED** project, the live version remains active and public while their proposed updates enter `projectRevisions` as a pending revision draft.
- Admin review approves and atomically merges the revision into the live project without downtime or broken links.

### 5. Admin Control Center (`/admin/*`)
- **Overview Dashboard**: Real-time metrics computed directly from database records (no fake numbers).
- **Review Queue**: Safe URL inspection, image preview, approval, rejection with mandatory reason, and changes-requested with actionable feedback.
- **Employee Management**: Roster search, department filtering, employee invitations, account suspension, and Super Admin role management.
- **Taxonomy / Category Management**: Create and edit categories with referential integrity protection (prevent deletion if referenced by projects).
- **Report Moderation**: Flagged reports queue for spam, misleading info, inappropriate content, or broken links.
- **Immutable Audit Logs**: Tamper-evident administrative action history.
- **System Settings**: Configurable registration policy, email domain restrictions, and Arena thresholds.

---

## 🎨 Design System & Brand Tokens

| Token | Hex | Usage |
|---|---|---|
| **Navy** | `#0F1B3D` | Primary headers, dark navigation bars, elevated containers |
| **White** | `#FFFFFF` | Core surface background, cards, text on dark headers |
| **Hot Pink** | `#FF3D88` | High-impact actions, active badges, accent glowing highlights |
| **Near Black** | `#111111` | High-contrast body typography |

**Typography**:
- Headings: `Space Grotesk`
- Body: `Inter`
- Technical Labels & Code: `JetBrains Mono`

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, React Hook Form, Zod, React Router DOM.
- **Persistence & Cloud**: Cloud Firestore, Firebase Authentication, Firebase Cloud Functions (Node.js 20 TS), Firebase App Check.
- **Media**: Cloudinary (signed uploads, server-generated HMAC-SHA256 signatures, zero client secrets).
- **Testing**: Vitest automated test suite for voting calculations, trending decay, Zod validation schemas, and Arena threshold gating.

---

## 🏁 Getting Started

### 1. Install Dependencies
```bash
npm install
npm --prefix functions install
```

### 2. Run Automated Verification Tests
```bash
npm test
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
npm --prefix functions run build
```

---

## 🧪 Persona Sandbox (Reviewer Mode)

To make review and pair-programming immediate without manual Firebase console setup:
- A **Dev Persona Switcher** is embedded in the application header / login page.
- Switch between:
  - **Employee (`Devon Sanders`)**: Submit projects, cast votes, like, view personal portfolio and saved projects.
  - **Administrator (`Marcus Vance`)**: Access the Review Queue, moderate submissions, manage categories.
  - **Super Administrator (`Elena Rostova`)**: Full platform control, audit logs, system settings, user role promotions/demotions.

