# PROJECT HUB — Security Architecture & Guidelines

## 1. Zero-Trust Security Model

PROJECT HUB operates under a zero-trust model:
- **Client Requests Are Untrusted**: No role parameter, vote count, like aggregate, or status change sent directly from client payloads is trusted without server-side validation.
- **Server-Authoritative State Changes**: High-integrity mutations (approvals, rejections, role assignments, vote calculations, like toggles, user suspensions) are executed exclusively through Firebase Cloud Functions running Firebase Admin SDK or guarded by strict Firestore Security Rules.
- **Defense in Depth**:
  1. Network boundary: Firebase App Check with attestation.
  2. Rate limiting: Sliding-window rate limiters per action and per UID/IP.
  3. Authorization: Custom Claims + Firestore Rules on every read and write.
  4. Input Sanitization: Zod schema validation and HTML escaping on client and server.
  5. Asset Signing: Cloudinary upload signature generation with time-expiring HMAC-SHA1/SHA256 signatures.

---

## 2. Role-Based Access Control (RBAC) Matrix

| Resource / Action | SUPER_ADMIN | ADMIN | EMPLOYEE | Unauthenticated |
|---|---|---|---|---|
| View Approved Projects | Allowed | Allowed | Allowed | Denied |
| Submit New Project | Allowed | Allowed | Allowed (if Active) | Denied |
| Edit Own Draft / Pending Project | Allowed | Allowed | Allowed (Own only) | Denied |
| Submit Project Revision | Allowed | Allowed | Allowed (Own only) | Denied |
| Like / Unlike Projects | Allowed | Allowed | Allowed (No self-likes) | Denied |
| Cast / Change Vote | Allowed | Allowed | Allowed (No self-votes) | Denied |
| Bookmark Projects | Allowed (Own) | Allowed (Own) | Allowed (Own only) | Denied |
| View Employee Directory | Allowed | Allowed | Allowed (Active users) | Denied |
| Edit Own Profile | Allowed | Allowed | Allowed (non-critical fields)| Denied |
| Review Submissions (Approve/Reject) | Allowed | Allowed | Denied | Denied |
| Archive / Restore Projects | Allowed | Allowed | Denied | Denied |
| Manage Categories | Allowed | Allowed | Denied | Denied |
| Moderate Reports | Allowed | Allowed | Denied | Denied |
| Suspend / Reactivate Employees | Allowed | Allowed (Employees only) | Denied | Denied |
| Assign ADMIN Role | Allowed | Denied | Denied | Denied |
| Assign SUPER_ADMIN Role | Allowed | Denied | Denied | Denied |
| Edit System Settings | Allowed | Denied | Denied | Denied |
| View Immutable Audit Logs | Allowed | Denied | Denied | Denied |

---

## 3. Firestore Security Rules Design

The rules file (`firestore.rules`) enforces strict constraints:

1. **Default Deny**: All paths deny read and write unless explicitly matched and validated.
2. **Helper Functions**:
   ```javascript
   function isAuthenticated() {
     return request.auth != null;
   }
   function isUser(uid) {
     return isAuthenticated() && request.auth.uid == uid;
   }
   function getUserData() {
     return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
   }
   function isActive() {
     return isAuthenticated() && getUserData().accountStatus == 'ACTIVE';
   }
   function isAdmin() {
     return isAuthenticated() && isActive() && (
       request.auth.token.role == 'ADMIN' ||
       request.auth.token.role == 'SUPER_ADMIN' ||
       getUserData().role in ['ADMIN', 'SUPER_ADMIN']
     );
   }
   function isSuperAdmin() {
     return isAuthenticated() && isActive() && (
       request.auth.token.role == 'SUPER_ADMIN' ||
       getUserData().role == 'SUPER_ADMIN'
     );
   }
   ```
3. **Protected Submissions & Revisions**:
   - Only approved, non-archived projects can be read by ordinary employees:
     `resource.data.approvalStatus == 'APPROVED' && resource.data.isArchived == false`
   - Project creators can always read their own projects regardless of status.
   - Admins can read all projects.
4. **Aggregate Counter Immutability**:
   - Clients cannot write to `likeCount`, `goodVoteCount`, `needsImprovementVoteCount`, `totalValidVotes`, `goodPercentage`, or `trendingScore` on project documents. Only server transactions or Admin SDK can update these.

---

## 4. Voting Integrity & Race Condition Mitigation

1. **Deterministic Document IDs**:
   - A vote record is stored at `/votes/${projectId}_${userId}`.
   - This database constraint physically prevents duplicate records per user per project.
2. **Self-Voting Prohibition**:
   - Backend transactions check `project.creatorId != userId`. If equal, request is rejected with HTTP 403 / `permission-denied`.
3. **Atomic Execution via Transactions**:
   - When user casts vote:
     1. Read project document.
     2. Read existing vote document `/votes/${projectId}_${userId}`.
     3. If no prior vote exists: increment `goodVoteCount` or `needsImprovementVoteCount`, and increment `totalValidVotes`.
     4. If previous vote was same choice: no-op / idempotent response.
     5. If previous vote was opposite choice: decrement old count, increment new count, total valid votes remains unchanged.
     6. Compute new `goodPercentage = round((goodVoteCount / totalValidVotes) * 100, 1)`.
     7. Write new vote document with timestamp.
     8. Write updated counters to project document.
   - All 8 steps occur within a single atomic Firestore Transaction, eliminating lost updates and concurrency races.

---

## 5. Cloudinary Upload Security

To prevent unauthorized file ingestion or credential leaks:
1. **No Client-Side Secrets**: Neither `CLOUDINARY_API_SECRET` nor master keys are exposed to Vite or client bundle.
2. **Signed Uploads Only**:
   - Client calls Firebase Function `getCloudinaryUploadSignature` with `folder`, `timestamp`, and intended `transformation`.
   - Function checks caller authentication, active account status, and rate limit.
   - Function generates an HMAC-SHA256 signature using `cloudinary.utils.api_sign_request`.
   - Client uploads directly to Cloudinary using the public cloud name, API key, signature, and timestamp.
3. **File Validation on Ingestion**:
   - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`.
   - Max file size: 5MB for covers, 3MB for screenshots, 2MB for avatars.
   - Executable, SVG with inline scripts, or polyglot files are strictly rejected.

---

## 6. Distributed Rate Limiting

Rate limiting is enforced at Cloud Functions to throttle abusive operations:

| Action | Window | Maximum Requests | Key |
|---|---|---|---|
| Project Submission | 1 Hour | 5 requests | `UID` |
| Project Edit / Revision | 15 Minutes | 10 requests | `UID` |
| Like / Vote Toggling | 1 Minute | 30 requests | `UID` |
| Bookmark Toggling | 1 Minute | 60 requests | `UID` |
| Cloudinary Signature | 5 Minutes | 15 requests | `UID` |
| Report Submission | 1 Hour | 5 requests | `UID` |
| Search Queries | 1 Minute | 60 requests | `UID` or `IP` |
| Admin Actions | 1 Minute | 60 requests | `UID` |

Rate limit state is maintained in Firestore `/rateLimits/${key}` with sliding expiration timestamps to ensure enforcement across distributed Cloud Function instances. Violations return standard `HTTP 429 Too Many Requests` with a `Retry-After` header.

---

## 7. App Check & Additional Defenses

- **Firebase App Check**: In production, reCAPTCHA Enterprise or Custom Web Provider is configured to verify requests originate from the genuine web application domain.
- **Content Sanitization**: Markdown and user text descriptions are sanitized via DOMPurify / strict text normalization before rendering to prevent XSS.
- **External Links**: All project live websites and repository URLs are rendered with `rel="noopener noreferrer" target="_blank"` to protect against tab-nabbing.

