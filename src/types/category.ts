export interface Category {
  id: string; // Slug/ID, e.g. "developer-tools"
  name: string; // e.g. "Developer Tools"
  description: string;
  icon?: string; // Lucide icon identifier
  isActive: boolean;
  projectCount: number;
  createdAt: string;
  updatedAt: string;
}

