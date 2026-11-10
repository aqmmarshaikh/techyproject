import React, { useState, useEffect } from 'react';
import { Bookmark, Search, Trash2, ExternalLink } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { interactionRepository } from '../repositories/interactionRepository';
import { BookmarkRecord } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/common/Toast';
import { formatDate } from '../utils/formatters';

export const SavedProjectsPage: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();

  const [bookmarks, setBookmarks] = useState<BookmarkRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadBookmarks = async () => {
    if (!userProfile?.id) return;
    setIsLoading(true);
    try {
      const records = await interactionRepository.listUserBookmarks(userProfile.id);
      setBookmarks(records);
    } catch (err) {
      console.warn('Failed to load bookmarks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, [userProfile?.id]);

  const handleRemove = async (e: React.MouseEvent, b: BookmarkRecord) => {
    e.stopPropagation();
    if (!userProfile) return;

    try {
      await interactionRepository.toggleBookmark(
        { id: b.projectId } as any,
        userProfile.id
      );
      setBookmarks((prev) => prev.filter((item) => item.id !== b.id));
      toastSuccess('Bookmark Removed', `"${b.projectTitle}" removed from saved.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to remove';
      toastError('Error', msg);
    }
  };

  const filteredBookmarks = bookmarks.filter((b) =>
    b.projectTitle.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
    b.projectCategory.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#0F1B3D] tracking-tight">
          Saved Projects
        </h2>
        <p className="mt-1 text-sm text-slate-500 font-sans">
          Your private collection of bookmarked tools, libraries, and initiatives.
        </p>
      </div>

      {/* Search Input */}
      {bookmarks.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search saved projects by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30"
          />
        </div>
      )}

      {/* Bookmarks List */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="w-8 h-8" />}
          title="No Saved Projects"
          description={
            searchQuery
              ? 'No bookmarked projects matched your search.'
              : 'Browse the showcase and click the bookmark icon on any project card to save it here.'
          }
          actionLabel="Explore Projects"
          onAction={() => navigate('/explore')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookmarks.map((b) => (
            <div
              key={b.id}
              onClick={() => navigate(`/projects/${b.projectId}`)}
              className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-card hover:shadow-cardHover transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="relative h-40 bg-slate-100 overflow-hidden">
                <img
                  src={b.projectCoverUrl}
                  alt={b.projectTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <button
                  onClick={(e) => handleRemove(e, b)}
                  title="Remove from saved"
                  className="absolute top-3 right-3 p-2 rounded-xl bg-white/90 text-slate-400 hover:text-rose-600 transition-colors shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-mono text-slate-400">{b.projectCategory}</span>
                  <h3 className="font-heading font-semibold text-base text-[#0F1B3D] group-hover:text-[#FF3D88] transition-colors truncate mt-0.5">
                    {b.projectTitle}
                  </h3>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Saved {formatDate(b.createdAt)}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#FF3D88]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

