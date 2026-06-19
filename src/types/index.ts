export interface Settings {
  submissionPassword: string;
  featuredProjectsLimit: number;
  maintenanceMode: boolean;
}

export interface ProjectSubmission {
  id?: string;
  title: string;
  description: string;
  teamMemberName: string;
  category: string;
  technologies: string[];
  githubUrl?: string;
  liveDemoUrl: string;
  coverImageUrl?: string;
  previewImageUrl?: string;
  previewSource?: "cover" | "og" | "microlink" | "placeholder";
  status?: string; // development status: e.g. completed, in-progress, beta, prototype
  
  // Ownership details
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;

  // Approval details
  approvalStatus: 'pending' | 'approved' | 'rejected';
  editedAfterApproval?: boolean;
  lastEditedAt?: any; // Firestore Timestamp
  submittedAt?: any; // Firestore Timestamp
}

export interface Project extends ProjectSubmission {
  id: string;
  featured: boolean;
  likesCount: number;
  viewsCount: number;
  publishedAt?: any; // Firestore Timestamp
}

export interface Like {
  projectId: string;
  visitorId: string;
  createdAt: any;
}
