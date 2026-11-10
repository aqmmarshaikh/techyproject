# PROJECT HUB — Database Schema Specification

## 1. Overview of Firestore Collections

To achieve high read scalability, prevent unbounded document growth (1MB Firestore limit), and enforce zero-trust access control, data is partitioned into dedicated root collections with indexed query paths.

```
Firestore Root
├── users/                [User Document: uid]
├── projects/             [Project Document: projectId]
├── projectRevisions/     [Revision Document: revisionId]
├── likes/                [Like Record: `${projectId}_${userId}`]
├── votes/                [Vote Record: `${projectId}_${userId}`]
├── bookmarks/            [Bookmark Record: `${userId}_${projectId}`]
├── categories/           [Category Document: categoryId]
├── technologies/         [Technology Tag Document: techId]
├── reports/              [Report Document: reportId]
├── notifications/        [Notification Document: notificationId]
├── adminLogs/            [Audit Log Document: logId]
├── rateLimits/           [Rate Limit Bucket: `${action}_${userIdOrIp}`]
├── arenaStats/           [Arena Aggregate Document: projectId]
└── systemSettings/       [Config Document: "global"]
```

---

## 2. Detailed Schema Definitions

### 2.1 Collection: `users/{userId}`
Stores employee profile information, authorization roles, and account statuses.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Firebase Auth UID |
| `email` | `string` | Yes | Employee email address |
| `fullName` | `string` | Yes | Employee's full name |
| `avatarUrl` | `string` | No | Cloudinary secure URL for profile image |
| `designation` | `string` | Yes | Job title (e.g., "Senior Software Engineer") |
| `department` | `string` | Yes | Company department (e.g., "Engineering", "Design", "Product") |
| `skills` | `string[]` | Yes | List of skills/competencies |
| `technologies` | `string[]` | Yes | List of familiar technologies |
| `role` | `enum` | Yes | `"SUPER_ADMIN" \| "ADMIN" \| "EMPLOYEE"` |
| `accountStatus` | `enum` | Yes | `"ACTIVE" \| "SUSPENDED" \| "INVITED"` |
| `joinDate` | `timestamp` | Yes | Account creation timestamp |
| `lastLoginAt` | `timestamp` | No | Last authenticated activity |
| `totalSubmittedProjects` | `number` | Yes | Aggregate counter of submitted projects |
| `totalApprovedProjects` | `number` | Yes | Aggregate counter of approved projects |
| `totalLikesReceived` | `number` | Yes | Aggregate likes received across all approved projects |
| `totalVotesReceived` | `number` | Yes | Aggregate votes received across all approved projects |
| `updatedAt` | `timestamp` | Yes | Last profile update timestamp |

### 2.2 Collection: `projects/{projectId}`
Canonical repository of all submitted, approved, rejected, and archived projects.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Unique project ID (UUID v4 or Firestore auto-id) |
| `title` | `string` | Yes | Project title (3-100 characters) |
| `description` | `string` | Yes | Project description (approx. 3-4 meaningful lines, 100-1000 chars) |
| `coverImageUrl` | `string` | Yes | Cloudinary secure URL for project cover image |
| `screenshots` | `string[]` | No | Cloudinary secure URLs for additional screenshots (max 6) |
| `category` | `string` | Yes | Valid category ID/slug (e.g. "developer-tools", "ai-ml") |
| `technologies` | `string[]` | Yes | Array of technology tags used in the project |
| `projectStatus` | `enum` | Yes | `"IN_DEVELOPMENT" \| "LIVE" \| "COMPLETED" \| "ON_HOLD"` |
| `approvalStatus` | `enum` | Yes | `"DRAFT" \| "PENDING_REVIEW" \| "APPROVED" \| "REJECTED" \| "CHANGES_REQUESTED"` |
| `isArchived` | `boolean` | Yes | Lifecycle flag; default `false` |
| `isFeatured` | `boolean` | Yes | Admin spotlight flag; default `false` |
| `liveWebsiteUrl` | `string` | Conditional| Required if `projectStatus == "LIVE"`. Validated URL. |
| `githubRepoUrl` | `string` | No | Optional GitHub/GitLab repository URL |
| `creatorId` | `string` | Yes | UID of the submitting employee |
| `creatorName` | `string` | Yes | Snapshot of creator's full name |
| `creatorAvatarUrl` | `string` | No | Snapshot of creator's profile image |
| `creatorDepartment` | `string` | Yes | Snapshot of creator's department |
| `createdAt` | `timestamp` | Yes | Initial submission timestamp |
| `approvedAt` | `timestamp` | No | Timestamp when approved by admin |
| `updatedAt` | `timestamp` | Yes | Last modified timestamp |
| `rejectionReason` | `string` | No | Detailed reason if `approvalStatus == "REJECTED"` |
| `adminFeedback` | `string` | No | Guidance notes if `approvalStatus == "CHANGES_REQUESTED"` |
| `reviewedBy` | `string` | No | Admin UID who reviewed the submission |
| `activeRevisionId` | `string` | No | ID of current pending revision, if undergoing review |
| **Aggregates** | | | *Maintained exclusively by backend Cloud Functions* |
| `likeCount` | `number` | Yes | Total valid likes (non-negative integer) |
| `goodVoteCount` | `number` | Yes | Total Good votes |
| `needsImprovementVoteCount` | `number` | Yes | Total Needs Improvement votes |
| `totalValidVotes` | `number` | Yes | `goodVoteCount + needsImprovementVoteCount` |
| `goodPercentage` | `number` | Yes | `(goodVoteCount / totalValidVotes) * 100` (rounded to 1 decimal) |
| `trendingScore` | `number` | Yes | Calculated time-decay engagement metric for Arena |

### 2.3 Collection: `projectRevisions/{revisionId}`
Stores proposed changes when an employee edits an already approved project.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Unique revision ID |
| `projectId` | `string` | Yes | Target project ID |
| `creatorId` | `string` | Yes | Submitting employee UID |
| `revisionStatus` | `enum` | Yes | `"PENDING_REVIEW" \| "APPROVED" \| "REJECTED"` |
| `proposedChanges` | `map` | Yes | Map containing changed fields (title, description, coverImage, etc.) |
| `previousSnapshot` | `map` | Yes | Snapshot of project values prior to revision |
| `changeSummary` | `string` | Yes | Short explanation of updates provided by employee |
| `createdAt` | `timestamp` | Yes | Revision submission date |
| `reviewedAt` | `timestamp` | No | Date reviewed by administrator |
| `reviewedBy` | `string` | No | Administrator UID |
| `reviewFeedback` | `string` | No | Rejection or modification feedback |

### 2.4 Collection: `likes/{likeId}`
Tracks project likes. Document ID is deterministically formed as: `${projectId}_${userId}`.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Deterministic format: `${projectId}_${userId}` |
| `projectId` | `string` | Yes | ID of the target project |
| `userId` | `string` | Yes | UID of the employee who liked the project |
| `createdAt` | `timestamp` | Yes | Timestamp when like was recorded |

### 2.5 Collection: `votes/{voteId}`
Tracks individual project votes. Document ID is deterministically formed as: `${projectId}_${userId}`.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Deterministic format: `${projectId}_${userId}` |
| `projectId` | `string` | Yes | ID of the target project |
| `userId` | `string` | Yes | UID of the voter |
| `choice` | `enum` | Yes | `"GOOD" \| "NEEDS_IMPROVEMENT"` |
| `createdAt` | `timestamp` | Yes | Timestamp of initial vote |
| `updatedAt` | `timestamp` | Yes | Timestamp of last vote modification |

### 2.6 Collection: `bookmarks/{bookmarkId}`
Stores private saved projects per user. Document ID is: `${userId}_${projectId}`.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Deterministic format: `${userId}_${projectId}` |
| `userId` | `string` | Yes | UID of the employee bookmark owner |
| `projectId` | `string` | Yes | Target project ID |
| `projectTitle` | `string` | Yes | Cached project title for responsive listing |
| `projectCoverUrl`| `string` | Yes | Cached cover image URL |
| `projectCategory` | `string` | Yes | Cached category |
| `createdAt` | `timestamp` | Yes | Timestamp when bookmarked |

### 2.7 Collection: `categories/{categoryId}`
Dynamic project categorization managed by admins.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Category ID / slug (e.g., "ai-ml", "developer-tools") |
| `name` | `string` | Yes | Display name (e.g., "AI & Machine Learning") |
| `description` | `string` | Yes | Category description |
| `icon` | `string` | No | Lucide icon identifier |
| `isActive` | `boolean` | Yes | Active flag (inactive cannot receive new submissions) |
| `projectCount` | `number` | Yes | Count of approved projects in this category |
| `createdAt` | `timestamp` | Yes | Creation timestamp |
| `updatedAt` | `timestamp` | Yes | Last modification timestamp |

### 2.8 Collection: `reports/{reportId}`
Flagged projects submitted by employees for moderation review.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Unique report ID |
| `projectId` | `string` | Yes | Target project ID |
| `reporterId` | `string` | Yes | UID of the employee submitting report |
| `reason` | `enum` | Yes | `"SPAM" \| "MISLEADING" \| "INAPPROPRIATE" \| "BROKEN_LINK" \| "IP_CONCERN" \| "OTHER"` |
| `details` | `string` | Yes | Additional context provided by reporter |
| `status` | `enum` | Yes | `"PENDING" \| "REVIEWED" \| "DISMISSED" \| "ACTIONED"` |
| `adminNotes` | `string` | No | Internal review notes |
| `actionTaken` | `string` | No | Summary of moderation action |
| `createdAt` | `timestamp` | Yes | Timestamp when reported |
| `resolvedAt` | `timestamp` | No | Resolution timestamp |

### 2.9 Collection: `notifications/{notificationId}`
In-app alerts dispatched to users on approvals, status updates, or comments.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Unique notification ID |
| `recipientId` | `string` | Yes | UID of user receiving alert |
| `title` | `string` | Yes | Short title (e.g., "Project Approved!") |
| `message` | `string` | Yes | Notification body text |
| `type` | `enum` | Yes | `"APPROVAL" \| "REJECTION" \| "CHANGES_REQUESTED" \| "SYSTEM"` |
| `targetUrl` | `string` | No | App relative link (e.g., `/projects/xyz123`) |
| `isRead` | `boolean` | Yes | Read receipt status |
| `createdAt` | `timestamp` | Yes | Timestamp dispatched |

### 2.10 Collection: `adminLogs/{logId}`
Immutable audit records for compliance and tracing administrative decisions.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Unique log entry ID |
| `actorId` | `string` | Yes | Administrator UID |
| `actorEmail` | `string` | Yes | Administrator email snapshot |
| `action` | `string` | Yes | Action type (e.g. `PROJECT_APPROVED`, `USER_SUSPENDED`, `SETTINGS_UPDATED`) |
| `targetEntity` | `string` | Yes | Collection name (e.g. `projects`, `users`, `systemSettings`) |
| `targetId` | `string` | Yes | Target document ID |
| `metadata` | `map` | Yes | Key-value pairs capturing before/after states and reasons |
| `timestamp` | `timestamp` | Yes | Immutable event timestamp |

### 2.11 Collection: `systemSettings/global`
Singleton document storing platform-wide configurations.

| Field | Type | Required | Description |
|---|---|---|---|
| `companyDomain` | `string` | Yes | Allowed domain (e.g. `"company.com"`) or empty for unrestricted |
| `registrationPolicy`| `enum` | Yes | `"INVITE_ONLY" \| "RESTRICTED_DOMAIN" \| "OPEN_REGISTRATION"` |
| `arenaMinVoteThreshold` | `number`| Yes | Minimum votes required for Top Rated (Default: 10) |
| `maxCoverImageSizeBytes` | `number` | Yes | Max cover image size in bytes (e.g. 5,242,880 for 5MB) |
| `maxScreenshotsPerProject`| `number`| Yes | Maximum screenshots allowed (Default: 6) |
| `allowedMimeTypes` | `string[]`| Yes | `["image/jpeg", "image/png", "image/webp"]` |
| `trendingWindowDays` | `number` | Yes | Window length for trending calculation (Default: 7 days) |
| `featuredProjectIds` | `string[]`| Yes | IDs of spotlighted projects |
| `updatedAt` | `timestamp` | Yes | Last modified timestamp |
| `updatedBy` | `string` | Yes | Super Admin UID |

---

## 3. Firestore Indexes Specification

To support efficient queries across Explore and Arena filters without full collection scans, the following composite indexes are required:

1. `projects`:
   - `approvalStatus` (ASC) + `isArchived` (ASC) + `createdAt` (DESC)
   - `approvalStatus` (ASC) + `isArchived` (ASC) + `likeCount` (DESC)
   - `approvalStatus` (ASC) + `isArchived` (ASC) + `goodPercentage` (DESC) + `totalValidVotes` (DESC)
   - `approvalStatus` (ASC) + `isArchived` (ASC) + `totalValidVotes` (DESC)
   - `approvalStatus` (ASC) + `isArchived` (ASC) + `trendingScore` (DESC)
   - `approvalStatus` (ASC) + `isArchived` (ASC) + `category` (ASC) + `createdAt` (DESC)
   - `approvalStatus` (ASC) + `isArchived` (ASC) + `projectStatus` (ASC) + `createdAt` (DESC)
   - `creatorId` (ASC) + `createdAt` (DESC)
2. `projectRevisions`:
   - `projectId` (ASC) + `revisionStatus` (ASC) + `createdAt` (DESC)
3. `reports`:
   - `status` (ASC) + `createdAt` (DESC)
4. `notifications`:
   - `recipientId` (ASC) + `isRead` (ASC) + `createdAt` (DESC)
5. `adminLogs`:
   - `timestamp` (DESC)

