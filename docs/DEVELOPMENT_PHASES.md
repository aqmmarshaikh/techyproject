# PROJECT HUB — Development Phases Checklist & Execution Plan

This master checklist outlines each implementation phase, verification step, and acceptance criteria required for PROJECT HUB.

---

## Phase 1: Environment Setup, Architecture & Foundational Configuration
- [x] 1.1 Project Architecture Documentation (`docs/ARCHITECTURE.md`)
- [x] 1.2 Database Schema Documentation (`docs/DATABASE_SCHEMA.md`)
- [x] 1.3 Security & Zero-Trust Guidelines (`docs/SECURITY.md`)
- [x] 1.4 Environment Configuration Template (`.env.example`)
- [x] 1.5 Master Development Phases Checklist (`docs/DEVELOPMENT_PHASES.md`)
- [x] 1.6 Initialize Vite + React + TypeScript application with Tailwind CSS and brand colors:
      - Navy: `#0F1B3D`
      - White: `#FFFFFF`
      - Hot Pink: `#FF3D88`
      - Near Black: `#111111`
      - Typography: Space Grotesk, Inter, JetBrains Mono
- [x] 1.7 Setup Firebase client SDK configuration, emulator detection, and Firebase project files (`firebase.json`, `firestore.rules`, `firestore.indexes.json`)
- [x] 1.8 Setup Cloud Functions project structure with TypeScript and linting

## Phase 2: Domain Types, Schemas, Repositories & Security Rules
- [x] 2.1 Core TypeScript definitions (`src/types/` for User, Project, Revision, Vote, Like, Bookmark, Category, Report, Notification, AuditLog, Settings)
- [x] 2.2 Zod validation schemas (`src/schemas/` for ProjectSubmission, RevisionSubmission, UserProfile, Auth, AdminSettings)
- [x] 2.3 Comprehensive Firestore Security Rules (`firestore.rules`) enforcing authentication, active status, role checks, and immutable counters
- [x] 2.4 Cloud Firestore service & repository abstractions (`src/repositories/` and `src/services/`)

## Phase 3: Authentication, Authorization & User Management
- [x] 3.1 Firebase Authentication provider and reactive `useAuth` hook with session persistence and persona switching for rapid test verification
- [x] 3.2 Role-based Access Control (`SUPER_ADMIN`, `ADMIN`, `EMPLOYEE`)
- [x] 3.3 Auth flows: Email/password login, password reset, secure logout, session persistence
- [x] 3.4 Protected routes (`AuthGuard`, `RoleGuard`, `SuspensionGuard`)
- [x] 3.5 Employee Directory with department filtering, search, and profile views
- [x] 3.6 Employee profile management (portfolio view, editable profile fields, non-editable role/email)

## Phase 4: Core Project Lifecycle & Submission Workflow
- [x] 4.1 Project submission form with React Hook Form + Zod
      - Required: title, description (3-4 meaningful lines), cover image, technologies, category, status
      - Conditional: live URL required when status is `LIVE`
      - Optional: GitHub repo URL, screenshots
- [x] 4.2 Submission state machine: `DRAFT` -> `PENDING_REVIEW` -> `APPROVED` / `REJECTED` / `CHANGES_REQUESTED` -> `RESUBMITTED` -> `APPROVED`
- [x] 4.3 Revision system for approved projects (dual-state live vs pending revision)
- [x] 4.4 Project Details page with large cover, metadata, tech tags, safe external links (`rel="noopener noreferrer"`), social counters, vote breakdowns
- [x] 4.5 Creator Project Management ("My Projects") with submission statuses and edit capabilities

## Phase 5: Social Engine & Server-Authoritative Voting
- [x] 5.1 Server-authoritative Like/Unlike system with atomic counters and self-like prevention
- [x] 5.2 Private bookmarking system ("Saved Projects") with search and filter
- [x] 5.3 Voting Engine (`GOOD` vs `NEEDS_IMPROVEMENT`):
      - 1 active vote per user per project
      - Vote modification support
      - Self-voting prevention
      - Atomic calculation: `goodPercentage = (good / total) * 100` and `needsImprovementPercentage`
      - Visual distribution bars and modal breakdown
- [x] 5.4 Cloud Functions for atomic interaction transactions (`toggleLike`, `castVote`, `toggleBookmark`)

## Phase 6: Project Arena & Ranking Engine
- [x] 6.1 Arena Dashboard with 5 distinct sections:
      - **A. Most Liked**: Sorted by total valid likes
      - **B. Top Rated**: Sorted by `goodPercentage`, gated by minimum vote threshold (default 10) with explanatory notice for ineligible projects
      - **C. Most Voted**: Sorted by total valid votes
      - **D. Trending**: Time-decay engagement algorithm ($likes_{rec} \times 2 + votes_{rec} \times 3$) / time factor
      - **E. Newest**: Sorted by recent approval date
- [x] 6.2 Deterministic tie-breaking across all ranking lists
- [x] 6.3 Comprehensive Arena filters (category, technology, status, department, time period)

## Phase 7: Admin Control Center
- [x] 7.1 Dedicated protected Admin Layout (`/admin/*`) restricted to `ADMIN` and `SUPER_ADMIN`
- [x] 7.2 Administrative Overview with real statistics (employees, active, approved, pending, rejected, total likes, total votes)
- [x] 7.3 Project Moderation Queue:
      - Preview images, inspect URLs
      - Approve project
      - Reject project with mandatory reason
      - Request changes with detailed feedback
      - Archive / Restore projects
      - Spotlight / Feature projects
- [x] 7.4 Employee Management:
      - List, search, department filter
      - Invite employee
      - Suspend / Reactivate account
      - Super Admin exclusive: Privileged administrator role management
- [x] 7.5 Category Management:
      - Create, edit, toggle active status
      - Deletion integrity protection (prevent delete if referenced by projects)
- [x] 7.6 Reports & Moderation:
      - User flagging system (Spam, Misleading, Inappropriate, Broken link, IP concern, Other)
      - Moderation review queue and action workflow
- [x] 7.7 Immutable Audit Logs:
      - Action logging for all sensitive admin operations
- [x] 7.8 Platform Settings:
      - Registration policy, domain restriction, submission limits, image limits, Arena minimum threshold

## Phase 8: Cloudinary, App Check, Rate Limiting & Cloud Functions Backend
- [x] 8.1 Cloudinary signed upload endpoint in Cloud Functions (`generateUploadSignature`)
- [x] 8.2 Client-side Cloudinary uploader component with signed parameter generation and secure local preview fallback
- [x] 8.3 Distributed rate limiting implementation in Cloud Functions (`checkRateLimit`)
- [x] 8.4 App Check configuration and fallback handling
- [x] 8.5 Automated notifications dispatch on project approval/rejection/feedback

## Phase 9: Testing, Verification, Responsive Design & Polish
- [x] 9.1 Complete UI design pass verifying brand tokens (`#0F1B3D`, `#FFFFFF`, `#FF3D88`, `#111111`)
- [x] 9.2 Mobile navigation drawer and responsive layout checks
- [x] 9.3 End-to-end functionality verification across all roles (Super Admin, Admin, Employee)
- [x] 9.4 Automated Vitest test suite passing (voting calculations, trending algorithm, Zod schemas, Arena thresholds)
- [x] 9.5 Production build validation (`npm run build` and `npm --prefix functions run build` passed)
- [x] 9.6 Final report and hand-off documentation
