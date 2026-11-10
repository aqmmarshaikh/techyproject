import { interactionRepository } from '../repositories/interactionRepository';
import { projectRepository } from '../repositories/projectRepository';
import { userRepository } from '../repositories/userRepository';
import { VoteChoice, Project } from '../types';
import { calculateTrendingScore } from '../utils/trending';

export const interactionService = {
  async toggleLike(projectId: string, userId: string): Promise<{ isLiked: boolean; newCount: number }> {
    const result = await interactionRepository.toggleLike(projectId, userId);
    
    // Refresh trending score and creator aggregate asynchronously
    const project = await projectRepository.getById(projectId);
    if (project) {
      const trendingScore = calculateTrendingScore({
        likeCount: result.newCount,
        totalValidVotes: project.totalValidVotes || 0,
        goodVoteCount: project.goodVoteCount || 0,
        approvedAtOrCreatedAt: project.approvedAt || project.createdAt,
      });
      await projectRepository.update(projectId, { trendingScore });

      // Update creator aggregate likes
      const creator = await userRepository.getById(project.creatorId);
      if (creator) {
        const delta = result.isLiked ? 1 : -1;
        await userRepository.updateProfile(creator.id, {
          totalLikesReceived: Math.max(0, (creator.totalLikesReceived || 0) + delta),
        });
      }
    }

    return result;
  },

  async castVote(
    projectId: string,
    userId: string,
    choice: VoteChoice
  ): Promise<{
    goodVoteCount: number;
    needsImprovementVoteCount: number;
    totalValidVotes: number;
    goodPercentage: number;
    activeChoice: VoteChoice;
  }> {
    const result = await interactionRepository.castVote(projectId, userId, choice);

    // Refresh trending score and creator aggregate
    const project = await projectRepository.getById(projectId);
    if (project) {
      const trendingScore = calculateTrendingScore({
        likeCount: project.likeCount || 0,
        totalValidVotes: result.totalValidVotes,
        goodVoteCount: result.goodVoteCount,
        approvedAtOrCreatedAt: project.approvedAt || project.createdAt,
      });
      await projectRepository.update(projectId, { trendingScore });

      // Update creator aggregate votes
      const creator = await userRepository.getById(project.creatorId);
      if (creator) {
        await userRepository.updateProfile(creator.id, {
          totalVotesReceived: Math.max(0, (creator.totalVotesReceived || 0) + 1),
        });
      }
    }

    return result;
  },

  async toggleBookmark(project: Project, userId: string): Promise<{ isBookmarked: boolean }> {
    return await interactionRepository.toggleBookmark(project, userId);
  },

  async checkUserInteractions(projectId: string, userId?: string | null): Promise<{
    isLiked: boolean;
    isBookmarked: boolean;
    userVoteChoice: VoteChoice | null;
  }> {
    if (!userId) {
      return { isLiked: false, isBookmarked: false, userVoteChoice: null };
    }

    const [isLiked, isBookmarked, voteRecord] = await Promise.all([
      interactionRepository.getLike(projectId, userId),
      interactionRepository.getBookmark(projectId, userId),
      interactionRepository.getVote(projectId, userId),
    ]);

    return {
      isLiked,
      isBookmarked,
      userVoteChoice: voteRecord ? voteRecord.choice : null,
    };
  },
};

