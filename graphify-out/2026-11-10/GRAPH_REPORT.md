# Graph Report - tehyprojects2  (2026-11-10)

## Corpus Check
- 107 files · ~41,720 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 449 nodes · 1113 edges · 24 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `41ec560b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- types/index.ts
- LoginPage.tsx
- useAuth.tsx
- AdminEmployeesPage.tsx
- scripts
- dependencies
- AppRoutes.tsx
- compilerOptions
- devDependencies
- ProjectSubmitForm.tsx
- src/index.ts
- AdminReviewQueuePage.tsx
- 2. Detailed Schema Definitions
- 🚀 Key Features
- compilerOptions
- PROJECT HUB — Development Phases Checklist & Execution Plan
- PROJECT HUB — Security Architecture & Guidelines
- compilerOptions
- PROJECT HUB — Master Architecture Specification

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 46 edges
2. `useToast()` - 29 edges
3. `Button` - 24 edges
4. `formatDate()` - 22 edges
5. `Project` - 20 edges
6. `compilerOptions` - 18 edges
7. `cn()` - 13 edges
8. `projectRepository` - 12 edges
9. `UserRole` - 12 edges
10. `2. Detailed Schema Definitions` - 12 edges

## Surprising Connections (you probably didn't know these)
- `ProjectCardProps` --references--> `Project`  [EXTRACTED]
  src/features/projects/ProjectCard.tsx → src/types/project.ts
- `Badge()` --calls--> `cn()`  [EXTRACTED]
  src/components/common/Badge.tsx → src/utils/cn.ts
- `Skeleton()` --calls--> `cn()`  [EXTRACTED]
  src/components/common/Skeleton.tsx → src/utils/cn.ts
- `ProjectSubmitForm()` --calls--> `useToast()`  [EXTRACTED]
  src/features/projects/ProjectSubmitForm.tsx → src/components/common/Toast.tsx
- `NavItem` --references--> `UserRole`  [EXTRACTED]
  src/constants/navigation.ts → src/types/user.ts

## Import Cycles
- None detected.

## Communities (24 total, 0 thin omitted)

### Community 0 - "types/index.ts"
Cohesion: 0.16
Nodes (17): DEFAULT_CATEGORIES, ProjectFilterBar(), ProjectFilterBarProps, ExplorePage(), adminRepository, DEFAULT_SETTINGS, categoryRepository, projectRepository (+9 more)

### Community 1 - "LoginPage.tsx"
Cohesion: 0.25
Nodes (7): DEMO_PROFILES, InviteEmployeeFormData, inviteEmployeeSchema, LoginFormData, loginSchema, PasswordResetFormData, passwordResetSchema

### Community 2 - "useAuth.tsx"
Cohesion: 0.08
Nodes (28): App(), analytics, app, auth, db, firebaseConfig, functions, googleProvider (+20 more)

### Community 3 - "AdminEmployeesPage.tsx"
Cohesion: 0.10
Nodes (30): RoleBadge(), Button, ButtonProps, ConfirmationModal(), ConfirmationModalProps, EmptyState(), EmptyStateProps, Modal() (+22 more)

### Community 4 - "scripts"
Cohesion: 0.06
Nodes (30): cloudinary, cors, firebase-admin, firebase-functions, dependencies, cloudinary, cors, firebase-admin (+22 more)

### Community 5 - "dependencies"
Cohesion: 0.10
Nodes (21): clsx, firebase, @hookform/resolvers, lucide-react, dependencies, clsx, firebase, @hookform/resolvers (+13 more)

### Community 6 - "AppRoutes.tsx"
Cohesion: 0.11
Nodes (40): useToast(), ProjectCard(), ProjectCardProps, ProjectDetailsPage(), ReportModal(), VoteButtonPair(), VoteButtonPairProps, useAuth() (+32 more)

### Community 7 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, DOM.Iterable, ES2020, compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx (+16 more)

### Community 8 - "devDependencies"
Cohesion: 0.06
Nodes (30): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @types/node, @types/react, @types/react-dom (+22 more)

### Community 9 - "ProjectSubmitForm.tsx"
Cohesion: 0.16
Nodes (13): APP_CONFIG, ProjectSubmitForm(), ProjectSubmitFormProps, AdminReviewFormData, adminReviewSchema, ProjectRevisionFormData, projectRevisionSchema, projectStatuses (+5 more)

### Community 10 - "src/index.ts"
Cohesion: 0.19
Nodes (13): createCloudinarySignature(), castVote, db, getCloudinaryUploadSignature, submitProject, toggleLike, processLikeToggle(), SubmitProjectInput (+5 more)

### Community 11 - "AdminReviewQueuePage.tsx"
Cohesion: 0.15
Nodes (16): AccountStatusBadge(), ApprovalStatusBadge(), Badge(), BadgeProps, ProjectStatusBadge(), RevisionDiff(), RevisionDiffProps, TabKey (+8 more)

### Community 12 - "2. Detailed Schema Definitions"
Cohesion: 0.12
Nodes (15): 1. Overview of Firestore Collections, 2.10 Collection: `adminLogs/{logId}`, 2.11 Collection: `systemSettings/global`, 2.1 Collection: `users/{userId}`, 2.2 Collection: `projects/{projectId}`, 2.3 Collection: `projectRevisions/{revisionId}`, 2.4 Collection: `likes/{likeId}`, 2.5 Collection: `votes/{voteId}` (+7 more)

### Community 13 - "🚀 Key Features"
Cohesion: 0.12
Nodes (15): 1. Employee Innovation Showcase (Explore), 1. Install Dependencies, 2. Run Automated Verification Tests, 2. Server-Authoritative Voting Engine, 3. Project Arena & Ranking Engine, 3. Run Development Server, 4. Build for Production, 4. Dual-State Project Revision Workflow (+7 more)

### Community 14 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compileOnSave, compilerOptions, module, noImplicitReturns, noUnusedLocals, outDir, skipLibCheck, sourceMap (+4 more)

### Community 15 - "PROJECT HUB — Development Phases Checklist & Execution Plan"
Cohesion: 0.18
Nodes (10): Phase 1: Environment Setup, Architecture & Foundational Configuration, Phase 2: Domain Types, Schemas, Repositories & Security Rules, Phase 3: Authentication, Authorization & User Management, Phase 4: Core Project Lifecycle & Submission Workflow, Phase 5: Social Engine & Server-Authoritative Voting, Phase 6: Project Arena & Ranking Engine, Phase 7: Admin Control Center, Phase 8: Cloudinary, App Check, Rate Limiting & Cloud Functions Backend (+2 more)

### Community 17 - "PROJECT HUB — Security Architecture & Guidelines"
Cohesion: 0.22
Nodes (8): 1. Zero-Trust Security Model, 2. Role-Based Access Control (RBAC) Matrix, 3. Firestore Security Rules Design, 4. Voting Integrity & Race Condition Mitigation, 5. Cloudinary Upload Security, 6. Distributed Rate Limiting, 7. App Check & Additional Defenses, PROJECT HUB — Security Architecture & Guidelines

### Community 18 - "compilerOptions"
Cohesion: 0.22
Nodes (8): vite.config.ts, compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include

### Community 19 - "PROJECT HUB — Master Architecture Specification"
Cohesion: 0.33
Nodes (5): 1. System Overview & Architecture Diagram, 2. Technology Stack & Component Responsibilities, 3. Modular Folder Structure, 4. Architectural Decisions & Principles, PROJECT HUB — Master Architecture Specification

## Knowledge Gaps
- **158 isolated node(s):** `name`, `lint`, `build`, `build:watch`, `serve` (+153 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 169 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAuth()` connect `AppRoutes.tsx` to `types/index.ts`, `LoginPage.tsx`, `useAuth.tsx`, `AdminEmployeesPage.tsx`, `ProjectSubmitForm.tsx`, `AdminReviewQueuePage.tsx`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **What connects `name`, `lint`, `build` to the rest of the system?**
  _158 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useAuth.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08282828282828283 - nodes in this community are weakly interconnected._
- **Should `AdminEmployeesPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10285714285714286 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._