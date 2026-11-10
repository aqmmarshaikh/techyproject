export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE';

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'INVITED';

export interface UserProfile {
  id: string; // Firebase Auth UID
  email: string;
  fullName: string;
  avatarUrl?: string;
  designation: string; // e.g. "Senior Full-Stack Engineer"
  department: string;  // e.g. "Engineering", "Product", "Design"
  skills: string[];
  technologies: string[];
  role: UserRole;
  accountStatus: AccountStatus;
  joinDate: string; // ISO 8601 string or timestamp
  lastLoginAt?: string;
  totalSubmittedProjects: number;
  totalApprovedProjects: number;
  totalLikesReceived: number;
  totalVotesReceived: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserSummary {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  department: string;
  designation: string;
  role: UserRole;
  accountStatus: AccountStatus;
}

