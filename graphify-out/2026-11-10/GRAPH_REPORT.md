# Graph Report - tehyprojects2  (2026-11-10)

## Corpus Check
- 113 files · ~257,878 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 474 nodes · 1147 edges · 26 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0ee255f9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AppLayout.tsx
- Button.tsx
- interactionService.ts
- types/index.ts
- scripts
- dependencies
- AppRoutes.tsx
- compilerOptions
- devDependencies
- ProjectSubmitForm.tsx
- src/index.ts
- manifest.json
- 2. Detailed Schema Definitions
- 🚀 Key Features
- compilerOptions
- PROJECT HUB — Development Phases Checklist & Execution Plan
- vercel.json
- PROJECT HUB — Security Architecture & Guidelines
- compilerOptions
- PROJECT HUB — Master Architecture Specification
- useAuth.tsx

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 48 edges
2. `useToast()` - 31 edges
3. `Button` - 25 edges
4. `formatDate()` - 22 edges
5. `Project` - 19 edges
6. `compilerOptions` - 18 edges
7. `cn()` - 13 edges
8. `2. Detailed Schema Definitions` - 12 edges
9. `EmptyState()` - 11 edges
10. `Modal()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `NavItem` --references--> `UserRole`  [EXTRACTED]
  src/constants/navigation.ts → src/types/user.ts
- `ProjectCardProps` --references--> `Project`  [EXTRACTED]
  src/features/projects/ProjectCard.tsx → src/types/project.ts
- `Badge()` --calls--> `cn()`  [EXTRACTED]
  src/components/common/Badge.tsx → src/utils/cn.ts
- `EmptyState()` --calls--> `cn()`  [EXTRACTED]
  src/components/common/EmptyState.tsx → src/utils/cn.ts
- `Skeleton()` --calls--> `cn()`  [EXTRACTED]
  src/components/common/Skeleton.tsx → src/utils/cn.ts

## Import Cycles
- None detected.

## Communities (26 total, 0 thin omitted)

### Community 0 - "AppLayout.tsx"
Cohesion: 0.18
Nodes (8): ADMIN_NAV_ITEMS, MAIN_NAV_ITEMS, NavItem, BRAND_COLORS, FONTS, notificationRepository, AppNotification, NotificationType

### Community 1 - "Button.tsx"
Cohesion: 0.09
Nodes (30): Button, ButtonProps, ConfirmationModal(), ConfirmationModalProps, Modal(), ModalProps, ProjectCardSkeleton(), Skeleton() (+22 more)

### Community 2 - "interactionService.ts"
Cohesion: 0.21
Nodes (9): VoteButtonPairProps, interactionRepository, interactionService, ArenaSection, BookmarkRecord, LikeRecord, VoteChoice, VoteRecord (+1 more)

### Community 3 - "types/index.ts"
Cohesion: 0.11
Nodes (32): db, ApprovalStatusBadge(), Badge(), BadgeProps, ProjectStatusBadge(), EmptyState(), EmptyStateProps, DEFAULT_CATEGORIES (+24 more)

### Community 4 - "scripts"
Cohesion: 0.06
Nodes (30): cloudinary, cors, firebase-admin, firebase-functions, dependencies, cloudinary, cors, firebase-admin (+22 more)

### Community 5 - "dependencies"
Cohesion: 0.10
Nodes (21): clsx, firebase, @hookform/resolvers, lucide-react, dependencies, clsx, firebase, @hookform/resolvers (+13 more)

### Community 6 - "AppRoutes.tsx"
Cohesion: 0.13
Nodes (34): AuthModal(), useToast(), ProjectCard(), ProjectCardProps, ProjectDetailsPage(), ReportModal(), VoteButtonPair(), useAuth() (+26 more)

### Community 7 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, DOM.Iterable, ES2020, compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx (+16 more)

### Community 8 - "devDependencies"
Cohesion: 0.06
Nodes (30): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @types/node, @types/react, @types/react-dom (+22 more)

### Community 9 - "ProjectSubmitForm.tsx"
Cohesion: 0.25
Nodes (9): ProjectSubmitForm(), ProjectSubmitFormProps, AdminReviewFormData, adminReviewSchema, ProjectRevisionFormData, projectRevisionSchema, projectStatuses, ProjectSubmissionFormData (+1 more)

### Community 10 - "src/index.ts"
Cohesion: 0.19
Nodes (13): createCloudinarySignature(), castVote, db, getCloudinaryUploadSignature, submitProject, toggleLike, processLikeToggle(), SubmitProjectInput (+5 more)

### Community 11 - "manifest.json"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

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

### Community 16 - "vercel.json"
Cohesion: 0.40
Nodes (4): cleanUrls, framework, headers, rewrites

### Community 17 - "PROJECT HUB — Security Architecture & Guidelines"
Cohesion: 0.22
Nodes (8): 1. Zero-Trust Security Model, 2. Role-Based Access Control (RBAC) Matrix, 3. Firestore Security Rules Design, 4. Voting Integrity & Race Condition Mitigation, 5. Cloudinary Upload Security, 6. Distributed Rate Limiting, 7. App Check & Additional Defenses, PROJECT HUB — Security Architecture & Guidelines

### Community 18 - "compilerOptions"
Cohesion: 0.22
Nodes (8): vite.config.ts, compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include

### Community 19 - "PROJECT HUB — Master Architecture Specification"
Cohesion: 0.33
Nodes (5): 1. System Overview & Architecture Diagram, 2. Technology Stack & Component Responsibilities, 3. Modular Folder Structure, 4. Architectural Decisions & Principles, PROJECT HUB — Master Architecture Specification

### Community 25 - "useAuth.tsx"
Cohesion: 0.07
Nodes (35): App(), APP_CONFIG, analytics, app, auth, firebaseConfig, functions, googleProvider (+27 more)

## Knowledge Gaps
- **171 isolated node(s):** `name`, `lint`, `build`, `build:watch`, `serve` (+166 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 183 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAuth()` connect `AppRoutes.tsx` to `AppLayout.tsx`, `Button.tsx`, `interactionService.ts`, `types/index.ts`, `ProjectSubmitForm.tsx`, `useAuth.tsx`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `useToast()` connect `AppRoutes.tsx` to `Button.tsx`, `interactionService.ts`, `types/index.ts`, `ProjectSubmitForm.tsx`, `useAuth.tsx`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `name`, `lint`, `build` to the rest of the system?**
  _171 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Button.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0946938775510204 - nodes in this community are weakly interconnected._
- **Should `types/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10976430976430976 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._