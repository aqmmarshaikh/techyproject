# Graph Report - tehyprojects2  (2026-11-10)

## Corpus Check
- 125 files · ~268,899 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 513 nodes · 1332 edges · 31 communities (22 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ca2b6dab`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useAuth.tsx
- Button.tsx
- types/index.ts
- ExplorePage.tsx
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
- firebase.ts
- react
- react-hook-form
- @types/react
- vitest
- MockSessionStorage

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 61 edges
2. `useToast()` - 35 edges
3. `Button` - 30 edges
4. `formatDate()` - 26 edges
5. `Project` - 22 edges
6. `UserRole` - 18 edges
7. `compilerOptions` - 18 edges
8. `UserProfile` - 15 edges
9. `projectRepository` - 14 edges
10. `formatCompactNumber()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `RolePreviewSimulator` --references--> `UserRole`  [EXTRACTED]
  tests/rolePreview.test.ts → src/types/user.ts
- `RolePreviewSimulator` --references--> `UserProfile`  [EXTRACTED]
  tests/rolePreview.test.ts → src/types/user.ts
- `RoleSwitcher()` --calls--> `useAuth()`  [EXTRACTED]
  src/components/common/RoleSwitcher.tsx → src/hooks/useAuth.tsx
- `Skeleton()` --calls--> `cn()`  [EXTRACTED]
  src/components/common/Skeleton.tsx → src/utils/cn.ts
- `ProjectCard()` --calls--> `useToast()`  [EXTRACTED]
  src/features/projects/ProjectCard.tsx → src/components/common/Toast.tsx

## Import Cycles
- None detected.

## Communities (31 total, 4 thin omitted)

### Community 0 - "useAuth.tsx"
Cohesion: 0.11
Nodes (21): PreviewModeBanner(), RoleSwitcher(), ADMIN_NAV_ITEMS, MAIN_NAV_ITEMS, NavItem, BRAND_COLORS, FONTS, RolePreviewContext (+13 more)

### Community 1 - "Button.tsx"
Cohesion: 0.10
Nodes (37): AccountStatusBadge(), ApprovalStatusBadge(), Badge(), BadgeProps, ProjectStatusBadge(), RoleBadge(), Button, ButtonProps (+29 more)

### Community 2 - "types/index.ts"
Cohesion: 0.09
Nodes (36): db, ProjectCard(), ProjectCardProps, RevisionDiffProps, VoteButtonPair(), VoteButtonPairProps, AdminOverviewPage(), SuperAdminOverviewPage() (+28 more)

### Community 3 - "ExplorePage.tsx"
Cohesion: 0.15
Nodes (15): DEFAULT_CATEGORIES, ProjectFilterBar(), ProjectFilterBarProps, categoryRepository, Category, ArenaSection, BookmarkRecord, LikeRecord (+7 more)

### Community 4 - "scripts"
Cohesion: 0.06
Nodes (30): cloudinary, cors, firebase-admin, firebase-functions, dependencies, cloudinary, cors, firebase-admin (+22 more)

### Community 5 - "dependencies"
Cohesion: 0.12
Nodes (17): clsx, firebase, @hookform/resolvers, lucide-react, dependencies, clsx, firebase, @hookform/resolvers (+9 more)

### Community 6 - "AppRoutes.tsx"
Cohesion: 0.10
Nodes (39): App(), AuthModal(), useToast(), RolePreviewProvider(), ProjectDetailsPage(), ReportModal(), useAuth(), AuthLayout() (+31 more)

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

### Community 25 - "firebase.ts"
Cohesion: 0.10
Nodes (22): APP_CONFIG, analytics, app, auth, firebaseConfig, functions, googleProvider, storage (+14 more)

### Community 30 - "MockSessionStorage"
Cohesion: 0.25
Nodes (3): INTENDED_DESTINATION_KEY, SESSION_ENTRY_KEY, MockSessionStorage

## Knowledge Gaps
- **172 isolated node(s):** `name`, `lint`, `build`, `build:watch`, `serve` (+167 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 190 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAuth()` connect `AppRoutes.tsx` to `useAuth.tsx`, `Button.tsx`, `types/index.ts`, `ExplorePage.tsx`, `firebase.ts`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `UserRole` connect `useAuth.tsx` to `Button.tsx`, `types/index.ts`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `name`, `lint`, `build` to the rest of the system?**
  _172 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useAuth.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10685249709639953 - nodes in this community are weakly interconnected._
- **Should `Button.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09571655208884189 - nodes in this community are weakly interconnected._
- **Should `types/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09121909633418585 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._