import { projectRepository } from '../repositories/projectRepository';
import { userRepository } from '../repositories/userRepository';
import { categoryRepository } from '../repositories/categoryRepository';
import { Project } from '../types';
import { DEMO_PROFILES } from '../hooks/useAuth';
import { calculateTrendingScore } from './trending';

export const INITIAL_SAMPLE_PROJECTS: Omit<Project, 'trendingScore'>[] = [
  {
    id: 'proj_gemini_assist',
    title: 'Autonomous Code Review Assistant',
    description: 'An AI-powered PR automation agent that analyzes TypeScript and Go code changes, runs AST linting, checks OWASP top 10 vulnerabilities, and drafts concise suggestions directly in GitHub comments.',
    coverImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    screenshots: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'AI & Machine Learning',
    technologies: ['TypeScript', 'Gemini API', 'Node.js', 'Docker', 'GitHub Actions'],
    projectStatus: 'LIVE',
    approvalStatus: 'APPROVED',
    isArchived: false,
    isFeatured: true,
    liveWebsiteUrl: 'https://codereview.internal.company',
    githubRepoUrl: 'https://github.com/company/ai-code-reviewer',
    creatorId: 'usr_super_admin',
    creatorName: 'Elena Rostova',
    creatorAvatarUrl: DEMO_PROFILES.SUPER_ADMIN.avatarUrl,
    creatorDepartment: 'Executive',
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    likeCount: 24,
    goodVoteCount: 18,
    needsImprovementVoteCount: 2,
    totalValidVotes: 20,
    goodPercentage: 90.0,
  },
  {
    id: 'proj_cloud_metrics',
    title: 'Zero-Trust Distributed Telemetry Hub',
    description: 'High-throughput metrics ingestion pipeline aggregating OpenTelemetry traces across multi-region Kubernetes clusters with sub-second alert dispatching and automated anomaly detection.',
    coverImageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    screenshots: [
      'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'Cloud & Infrastructure',
    technologies: ['Go', 'Kubernetes', 'OpenTelemetry', 'ClickHouse', 'Prometheus'],
    projectStatus: 'LIVE',
    approvalStatus: 'APPROVED',
    isArchived: false,
    isFeatured: true,
    liveWebsiteUrl: 'https://telemetry.internal.company',
    githubRepoUrl: 'https://github.com/company/telemetry-hub',
    creatorId: 'usr_admin',
    creatorName: 'Marcus Vance',
    creatorAvatarUrl: DEMO_PROFILES.ADMIN.avatarUrl,
    creatorDepartment: 'Engineering',
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    likeCount: 19,
    goodVoteCount: 14,
    needsImprovementVoteCount: 1,
    totalValidVotes: 15,
    goodPercentage: 93.3,
  },
  {
    id: 'proj_design_system',
    title: 'Apex Micro-Component Design Library',
    description: 'Universal React 19 UI library providing fully accessible WCAG AAA compliant primitives, dark-mode tokens, animated data charts, and zero-runtime Tailwind CSS composition.',
    coverImageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    screenshots: [],
    category: 'Product & Design Systems',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Storybook'],
    projectStatus: 'LIVE',
    approvalStatus: 'APPROVED',
    isArchived: false,
    isFeatured: false,
    liveWebsiteUrl: 'https://apex-design.internal.company',
    githubRepoUrl: 'https://github.com/company/apex-ui',
    creatorId: 'usr_employee',
    creatorName: 'Devon Sanders',
    creatorAvatarUrl: DEMO_PROFILES.EMPLOYEE.avatarUrl,
    creatorDepartment: 'Product Development',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    likeCount: 15,
    goodVoteCount: 11,
    needsImprovementVoteCount: 1,
    totalValidVotes: 12,
    goodPercentage: 91.7,
  },
  {
    id: 'proj_secure_vault',
    title: 'Ephemeral Secret Delivery Gateway',
    description: 'Internal security proxy enabling developers to request time-bounded cloud credentials with zero standing privileges, automatic rotation, and full Slack-integrated approval bots.',
    coverImageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
    screenshots: [],
    category: 'Security & Privacy',
    technologies: ['Rust', 'AWS KMS', 'HashiCorp Vault', 'OAuth2', 'PostgreSQL'],
    projectStatus: 'IN_DEVELOPMENT',
    approvalStatus: 'APPROVED',
    isArchived: false,
    isFeatured: false,
    githubRepoUrl: 'https://github.com/company/ephemeral-vault',
    creatorId: 'usr_admin',
    creatorName: 'Marcus Vance',
    creatorAvatarUrl: DEMO_PROFILES.ADMIN.avatarUrl,
    creatorDepartment: 'Engineering',
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    likeCount: 8,
    goodVoteCount: 4,
    needsImprovementVoteCount: 0,
    totalValidVotes: 4, // Below 10 threshold - demonstrates Top Rated gate!
    goodPercentage: 100.0,
  },
  {
    id: 'proj_pending_demo',
    title: 'Customer Feedback Sentiment Clustering',
    description: 'Natural language pipeline clustering enterprise support ticket feedback into actionable roadmap themes using embeddings and vector similarity.',
    coverImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    screenshots: [],
    category: 'AI & Machine Learning',
    technologies: ['Python', 'FastAPI', 'Qdrant', 'OpenAI Embeddings'],
    projectStatus: 'IN_DEVELOPMENT',
    approvalStatus: 'PENDING_REVIEW', // Demonstrates admin review queue!
    isArchived: false,
    isFeatured: false,
    creatorId: 'usr_employee',
    creatorName: 'Devon Sanders',
    creatorAvatarUrl: DEMO_PROFILES.EMPLOYEE.avatarUrl,
    creatorDepartment: 'Product Development',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    likeCount: 0,
    goodVoteCount: 0,
    needsImprovementVoteCount: 0,
    totalValidVotes: 0,
    goodPercentage: 0,
  },
];

export async function ensureInitialSeedData(): Promise<void> {
  try {
    // Seed Demo Users
    await userRepository.createProfile(DEMO_PROFILES.SUPER_ADMIN);
    await userRepository.createProfile(DEMO_PROFILES.ADMIN);
    await userRepository.createProfile(DEMO_PROFILES.EMPLOYEE);

    // Seed Categories
    await categoryRepository.list();

    // Check if projects already exist
    const existing = await projectRepository.listApproved();
    if (existing.length === 0) {
      for (const item of INITIAL_SAMPLE_PROJECTS) {
        const trendingScore = calculateTrendingScore({
          likeCount: item.likeCount,
          totalValidVotes: item.totalValidVotes,
          goodVoteCount: item.goodVoteCount,
          approvedAtOrCreatedAt: item.approvedAt || item.createdAt,
        });

        await projectRepository.create({
          ...item,
          trendingScore,
        });
      }
    }
  } catch (err) {
    console.warn('[SeedData] Background seed check:', err);
  }
}

