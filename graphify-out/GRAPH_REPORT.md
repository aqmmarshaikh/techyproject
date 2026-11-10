# Graph Report - tehyprojects2  (2026-11-11)

## Corpus Check
- 137 files · ~280,093 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 572 nodes · 1518 edges · 35 communities (25 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0c3da1fe`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- UserRole
- useToast
- types/index.ts
- firebase.ts
- scripts
- dependencies
- AppRoutes.tsx
- compilerOptions
- devDependencies
- package.json
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
- ProjectSubmitForm.tsx
- react
- react-hook-form
- @types/react
- vitest
- MockSessionStorage
- ExplorePage.tsx
- AdminReviewQueuePage.tsx
- TechMarquee.tsx
- ErrorBoundary

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 61 edges
2. `useToast()` - 39 edges
3. `Button` - 31 edges
4. `Project` - 26 edges
5. `formatDate()` - 26 edges
6. `UserProfile` - 23 edges
7. `projectRepository` - 19 edges
8. `UserRole` - 18 edges
9. `compilerOptions` - 18 edges
10. `userRepository` - 16 edges

## Surprising Connections (you probably didn't know these)
- `RolePreviewSimulator` --references--> `UserProfile`  [EXTRACTED]
  tests/rolePreview.test.ts → src/types/user.ts
- `AuthContextType` --references--> `UserProfile`  [EXTRACTED]
  src/hooks/useAuth.tsx → src/types/user.ts
- `AdminAuditLogsPage()` --calls--> `formatDate()`  [EXTRACTED]
  src/pages/admin/AdminAuditLogsPage.tsx → src/utils/formatters.ts
- `RolePreviewSimulator` --references--> `UserRole`  [EXTRACTED]
  tests/rolePreview.test.ts → src/types/user.ts
- `AuthModal()` --calls--> `useToast()`  [EXTRACTED]
  src/components/common/AuthModal.tsx → src/components/common/Toast.tsx

## Import Cycles
- None detected.

## Communities (35 total, 5 thin omitted)

### Community 0 - "UserRole"
Cohesion: 0.13
Nodes (10): ADMIN_NAV_ITEMS, MAIN_NAV_ITEMS, NavItem, BRAND_COLORS, FONTS, RolePreviewContextType, AccountStatus, UserRole (+2 more)

### Community 1 - "useToast"
Cohesion: 0.09
Nodes (37): ConfirmationModal(), ConfirmationModalProps, Modal(), ModalProps, ToastContext, ToastContextType, ToastItem, ToastType (+29 more)

### Community 2 - "types/index.ts"
Cohesion: 0.09
Nodes (46): db, LeaderboardPodium(), LeaderboardPodiumProps, SIZE_CLASSES, UserAvatar(), UserAvatarProps, ProjectCard(), ProjectCardProps (+38 more)

### Community 3 - "firebase.ts"
Cohesion: 0.12
Nodes (15): APP_CONFIG, analytics, app, auth, firebaseConfig, functions, googleProvider, storage (+7 more)

### Community 4 - "scripts"
Cohesion: 0.06
Nodes (30): cloudinary, cors, firebase-admin, firebase-functions, dependencies, cloudinary, cors, firebase-admin (+22 more)

### Community 5 - "dependencies"
Cohesion: 0.12
Nodes (17): clsx, firebase, @hookform/resolvers, lucide-react, dependencies, clsx, firebase, @hookform/resolvers (+9 more)

### Community 6 - "AppRoutes.tsx"
Cohesion: 0.07
Nodes (50): App(), AuthModal(), AccountStatusBadge(), RoleBadge(), Button, ButtonProps, Props, State (+42 more)

### Community 7 - "compilerOptions"
Cohesion: 0.08
Nodes (24): DOM, DOM.Iterable, ES2020, compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx (+16 more)

### Community 8 - "devDependencies"
Cohesion: 0.12
Nodes (17): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @types/node, @types/react-dom, typescript (+9 more)

### Community 9 - "package.json"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, preview, test, type (+1 more)

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

### Community 25 - "ProjectSubmitForm.tsx"
Cohesion: 0.19
Nodes (13): ProjectSubmitForm(), ProjectSubmitFormProps, SubmitProjectPage(), SubmitProjectPage, AdminReviewFormData, adminReviewSchema, imageUrlSchema, ProjectRevisionFormData (+5 more)

### Community 30 - "MockSessionStorage"
Cohesion: 0.25
Nodes (3): INTENDED_DESTINATION_KEY, SESSION_ENTRY_KEY, MockSessionStorage

### Community 31 - "ExplorePage.tsx"
Cohesion: 0.12
Nodes (18): EmptyState(), EmptyStateProps, ProjectCardSkeleton(), Skeleton(), DEFAULT_CATEGORIES, ProjectFilterBar(), ProjectFilterBarProps, ExplorePage() (+10 more)

### Community 32 - "AdminReviewQueuePage.tsx"
Cohesion: 0.17
Nodes (14): ApprovalStatusBadge(), Badge(), BadgeProps, ProjectStatusBadge(), MediaItem, ProjectMediaGalleryModal(), ProjectMediaGalleryModalProps, RevisionDiff() (+6 more)

### Community 33 - "TechMarquee.tsx"
Cohesion: 0.50
Nodes (3): TECH_ITEMS, TechItem, TechMarquee()

## Knowledge Gaps
- **180 isolated node(s):** `name`, `lint`, `build`, `build:watch`, `serve` (+175 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 208 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAuth()` connect `AppRoutes.tsx` to `AdminReviewQueuePage.tsx`, `useToast`, `types/index.ts`, `ProjectSubmitForm.tsx`, `ExplorePage.tsx`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `UserRole` connect `UserRole` to `AdminReviewQueuePage.tsx`, `useToast`, `types/index.ts`, `firebase.ts`, `AppRoutes.tsx`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `UserProfile` connect `types/index.ts` to `UserRole`, `useToast`, `firebase.ts`, `AppRoutes.tsx`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `name`, `lint`, `build` to the rest of the system?**
  _180 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UserRole` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `useToast` be split into smaller, more focused modules?**
  _Cohesion score 0.09071117561683599 - nodes in this community are weakly interconnected._
- **Should `types/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0876750700280112 - nodes in this community are weakly interconnected._