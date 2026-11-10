import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { VoteChoice } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { interactionService } from '../../services/interactionService';
import { useToast } from '../../components/common/Toast';
import { calculateVotePercentages } from '../../utils/formatters';

interface VoteButtonPairProps {
  projectId: string;
  creatorId: string;
  initialGoodCount: number;
  initialNeedsImprovementCount: number;
  initialUserVote?: VoteChoice | null;
  onVoteSuccess?: (newGood: number, newNeedsImp: number, newTotal: number, newPct: number) => void;
  compact?: boolean;
}

export const VoteButtonPair: React.FC<VoteButtonPairProps> = ({
  projectId,
  creatorId,
  initialGoodCount,
  initialNeedsImprovementCount,
  initialUserVote = null,
  onVoteSuccess,
  compact = false,
}) => {
  const { userProfile, isAuthenticated } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();

  const [goodCount, setGoodCount] = useState(initialGoodCount);
  const [needsImpCount, setNeedsImpCount] = useState(initialNeedsImprovementCount);
  const [userVote, setUserVote] = useState<VoteChoice | null>(initialUserVote);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { goodPercentage, needsImprovementPercentage, totalVotes } = calculateVotePercentages(
    goodCount,
    needsImpCount
  );

  const isOwner = userProfile?.id === creatorId;

  const handleVote = async (choice: VoteChoice) => {
    if (!isAuthenticated || !userProfile) {
      toastError('Authentication Required', 'Please sign in to vote on projects.');
      return;
    }

    if (isOwner) {
      toastError('Self-Voting Prohibited', 'Company policy prohibits creators from voting on their own projects.');
      return;
    }

    if (userProfile.accountStatus === 'SUSPENDED') {
      toastError('Account Suspended', 'Suspended accounts cannot cast votes.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await interactionService.castVote(projectId, userProfile.id, choice);
      setGoodCount(res.goodVoteCount);
      setNeedsImpCount(res.needsImprovementVoteCount);
      setUserVote(res.activeChoice);

      toastSuccess(
        res.activeChoice === 'GOOD' ? 'Voted: Good' : 'Voted: Needs Improvement',
        'Your feedback has been atomically recorded.'
      );

      if (onVoteSuccess) {
        onVoteSuccess(res.goodVoteCount, res.needsImprovementVoteCount, res.totalValidVotes, res.goodPercentage);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to register vote';
      toastError('Vote Failed', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleVote('GOOD');
          }}
          disabled={isSubmitting || isOwner}
          title={isOwner ? 'You cannot vote on your own project' : 'Vote Good'}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
            userVote === 'GOOD'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-emerald-700 hover:bg-emerald-100/60'
          } ${isOwner ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>{goodPercentage}%</span>
        </button>

        <span className="text-[10px] text-slate-300">|</span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleVote('NEEDS_IMPROVEMENT');
          }}
          disabled={isSubmitting || isOwner}
          title={isOwner ? 'You cannot vote on your own project' : 'Vote Needs Improvement'}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
            userVote === 'NEEDS_IMPROVEMENT'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-amber-700 hover:bg-amber-100/60'
          } ${isOwner ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <ThumbsDown className="w-3.5 h-3.5" />
          <span>{needsImprovementPercentage}%</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-heading font-semibold text-sm text-[#0F1B3D]">Community Evaluation</h4>
          <p className="text-xs text-slate-500 font-sans">
            {totalVotes} valid {totalVotes === 1 ? 'vote' : 'votes'} recorded
          </p>
        </div>

        {isOwner && (
          <span className="text-[11px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
            Owner (Voting disabled)
          </span>
        )}
      </div>

      {/* Distribution Progress Bar */}
      <div className="space-y-1.5">
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${goodPercentage}%` }}
            className="bg-emerald-500 transition-all duration-300"
          />
          <div
            style={{ width: `${needsImprovementPercentage}%` }}
            className="bg-amber-500 transition-all duration-300"
          />
        </div>
        <div className="flex justify-between text-xs font-mono font-medium">
          <span className="text-emerald-700">{goodPercentage}% Good ({goodCount})</span>
          <span className="text-amber-700">{needsImprovementPercentage}% Needs Work ({needsImpCount})</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          onClick={() => handleVote('GOOD')}
          disabled={isSubmitting || isOwner}
          className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all border ${
            userVote === 'GOOD'
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-md ring-2 ring-emerald-200'
              : 'bg-emerald-50/50 hover:bg-emerald-100/70 border-emerald-200 text-emerald-800'
          } ${isOwner ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}`}
        >
          {userVote === 'GOOD' ? <Check className="w-4 h-4" /> : <ThumbsUp className="w-4 h-4" />}
          <span>Good</span>
        </button>

        <button
          onClick={() => handleVote('NEEDS_IMPROVEMENT')}
          disabled={isSubmitting || isOwner}
          className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all border ${
            userVote === 'NEEDS_IMPROVEMENT'
              ? 'bg-amber-600 border-amber-600 text-white shadow-md ring-2 ring-amber-200'
              : 'bg-amber-50/50 hover:bg-amber-100/70 border-amber-200 text-amber-800'
          } ${isOwner ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}`}
        >
          {userVote === 'NEEDS_IMPROVEMENT' ? <Check className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}
          <span>Needs Improvement</span>
        </button>
      </div>
    </div>
  );
};

