import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Clock, AlertTriangle, ArrowRight, Sparkles, Trash2, Heart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { notificationRepository } from '../repositories/notificationRepository';
import { projectRepository } from '../repositories/projectRepository';
import { AppNotification } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { UserAvatar } from '../components/common/UserAvatar';
import { useToast } from '../components/common/Toast';
import { useNavigate } from 'react-router-dom';
import { formatDate, formatRelativeTime } from '../utils/formatters';

export const NotificationsPage: React.FC = () => {
  const { userProfile } = useAuth();
  const { error: toastError } = useToast();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.id) return;
    setIsLoading(true);

    const unsubscribe = notificationRepository.subscribeToUserNotifications(
      userProfile.id,
      (items) => {
        setNotifications(items);
        setIsLoading(false);
      },
      (err) => {
        console.warn('Real-time notifications subscription error, falling back:', err);
        notificationRepository
          .listUserNotifications(userProfile.id)
          .then((items) => {
            setNotifications(items);
            setIsLoading(false);
          })
          .catch((fetchErr) => {
            console.error('Failed to load notifications:', fetchErr);
            setIsLoading(false);
          });
      }
    );

    return () => unsubscribe();
  }, [userProfile?.id]);

  const handleMarkAsRead = async (e: React.MouseEvent, n: AppNotification) => {
    e.stopPropagation();
    try {
      await notificationRepository.markAsRead(n.id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
      );
    } catch (err) {
      console.warn('Failed to mark read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      for (const n of notifications.filter((item) => !item.isRead)) {
        await notificationRepository.markAsRead(n.id);
      }
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch (err) {
      console.warn('Failed to mark all as read:', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'PROJECT_LIKED':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'APPROVAL':
        return <Check className="w-4 h-4 text-emerald-600" />;
      case 'REJECTION':
      case 'CHANGES_REQUESTED':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'PROJECT_DELETED':
        return <Trash2 className="w-4 h-4 text-rose-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#FF3D88]" />;
    }
  };

  const handleNotificationClick = async (n: AppNotification) => {
    if (!n.isRead) {
      try {
        await notificationRepository.markAsRead(n.id);
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
        );
      } catch (err) {
        console.warn('Failed to mark read:', err);
      }
    }

    if (n.targetUrl) {
      // Validate that project is still active/accessible if it's a project link
      if (n.projectId) {
        try {
          const proj = await projectRepository.getById(n.projectId);
          if (!proj || proj.isArchived) {
            toastError(
              'Project Unavailable',
              'This project has been removed or is no longer accessible.'
            );
            return;
          }
        } catch {
          toastError(
            'Project Unavailable',
            'This project has been removed or is no longer accessible.'
          );
          return;
        }
      }
      navigate(n.targetUrl);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#0F1B3D] tracking-tight">
            Notifications
          </h2>
          <p className="mt-1 text-sm text-slate-500 font-sans">
            Review status updates on your project submissions, admin decisions, and platform alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<CheckCheck className="w-4 h-4" />}
            onClick={handleMarkAllAsRead}
          >
            Mark All as Read ({unreadCount})
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-8 h-8" />}
          title="All Caught Up!"
          description="You don't have any unread notifications or status updates right now."
          actionLabel="Explore Projects"
          onAction={() => navigate('/explore')}
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                n.isRead
                  ? 'bg-white border-slate-200/80 text-slate-700'
                  : 'bg-indigo-50/40 border-indigo-200/80 text-indigo-950 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                {n.type === 'PROJECT_LIKED' ? (
                  <div className="relative shrink-0 mt-0.5">
                    <UserAvatar
                      user={{
                        displayName: n.actorName,
                        fullName: n.actorName,
                        avatarUrl: n.actorAvatarUrl,
                      }}
                      size="md"
                      className="ring-2 ring-rose-300"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-rose-500 border border-white flex items-center justify-center text-white shadow-sm">
                      <Heart className="w-2.5 h-2.5 fill-white text-white" />
                    </div>
                  </div>
                ) : (
                  <div
                    className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                      n.isRead ? 'bg-slate-100' : 'bg-white shadow-sm'
                    }`}
                  >
                    {getIcon(n.type)}
                  </div>
                )}

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading font-semibold text-sm text-[#0F1B3D]">
                      {n.title}
                    </h4>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#FF3D88]" />
                    )}
                  </div>

                  <p className="text-xs text-slate-600 font-sans leading-relaxed">
                    {n.message}
                  </p>

                  <span className="text-[10px] font-mono text-slate-400 block pt-0.5">
                    {formatRelativeTime(n.createdAt)}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {!n.isRead && (
                  <button
                    onClick={(e) => handleMarkAsRead(e, n)}
                    title="Mark as read"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}

                {n.targetUrl && (
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#FF3D88]" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

