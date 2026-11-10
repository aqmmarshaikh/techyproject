import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Images, 
  Sparkles, 
  Film, 
  AlertCircle,
  Maximize2,
  Minimize2
} from 'lucide-react';

export interface MediaItem {
  id: string;
  url: string;
  type: 'COVER' | 'SCREENSHOT' | 'VIDEO' | 'OTHER';
  label: string;
}

interface ProjectMediaGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
  coverImageUrl?: string;
  screenshots?: string[];
  initialIndex?: number;
}

export const ProjectMediaGalleryModal: React.FC<ProjectMediaGalleryModalProps> = ({
  isOpen,
  onClose,
  projectTitle,
  coverImageUrl,
  screenshots = [],
  initialIndex = 0,
}) => {
  // Assemble complete media items array
  const mediaItems: MediaItem[] = [];

  if (coverImageUrl && coverImageUrl.trim()) {
    mediaItems.push({
      id: 'cover',
      url: coverImageUrl.trim(),
      type: 'COVER',
      label: 'Main Cover Image',
    });
  }

  screenshots.forEach((shot, idx) => {
    if (shot && shot.trim()) {
      const isVideo = Boolean(
        shot.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) ||
        shot.startsWith('data:video/')
      );
      mediaItems.push({
        id: `screenshot_${idx}`,
        url: shot.trim(),
        type: isVideo ? 'VIDEO' : 'SCREENSHOT',
        label: isVideo ? `Video Clip #${idx + 1}` : `Screenshot #${idx + 1}`,
      });
    }
  });

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Sync index on open or prop change
  useEffect(() => {
    if (isOpen) {
      const validIndex = Math.min(Math.max(0, initialIndex), Math.max(0, mediaItems.length - 1));
      setCurrentIndex(validIndex);
      setZoomLevel(1);
      setHasError(false);
      setIsLoading(true);
    }
  }, [isOpen, initialIndex, mediaItems.length]);

  // Reset zoom on index change
  useEffect(() => {
    setZoomLevel(1);
    setHasError(false);
    setIsLoading(true);
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (mediaItems.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
  }, [mediaItems.length]);

  const handlePrev = useCallback(() => {
    if (mediaItems.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  }, [mediaItems.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen) return null;

  const currentItem = mediaItems[currentIndex];

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#060B18]/90 backdrop-blur-md animate-fadeIn">
      <div 
        className={`relative w-full ${
          isFullScreen ? 'h-full max-w-full' : 'max-w-5xl max-h-[92vh]'
        } flex flex-col bg-[#0F1B3D] border border-white/15 rounded-3xl shadow-2xl overflow-hidden text-white transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0A1229]/80 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#FF3D88]/20 border border-[#FF3D88]/40 flex items-center justify-center text-[#FF3D88] shrink-0">
              <Images className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-sm sm:text-base text-white truncate max-w-sm sm:max-w-md">
                  {projectTitle}
                </h3>
                {currentItem && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider ${
                    currentItem.type === 'COVER'
                      ? 'bg-[#FF3D88] text-white shadow-sm'
                      : currentItem.type === 'VIDEO'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-slate-300'
                  }`}>
                    {currentItem.label}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-sans">
                {mediaItems.length > 0
                  ? `Media Item ${currentIndex + 1} of ${mediaItems.length}`
                  : 'No media items available'}
              </p>
            </div>
          </div>

          {/* Action buttons on header */}
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            {currentItem && currentItem.type !== 'VIDEO' && (
              <div className="hidden sm:flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.5}
                  title="Zoom Out"
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="px-1 text-[11px] font-mono text-slate-300 min-w-[40px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 3}
                  title="Zoom In"
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                {zoomLevel !== 1 && (
                  <button
                    type="button"
                    onClick={handleResetZoom}
                    title="Reset Zoom"
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Toggle Fullscreen view */}
            <button
              type="button"
              onClick={() => setIsFullScreen((prev) => !prev)}
              title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close gallery */}
            <button
              type="button"
              onClick={onClose}
              title="Close Gallery (Esc)"
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-rose-600/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Stage Media Viewer */}
        <div className="relative flex-1 flex items-center justify-center p-4 min-h-[300px] sm:min-h-[420px] max-h-[65vh] overflow-hidden bg-black/40">
          {mediaItems.length === 0 ? (
            <div className="text-center p-8 space-y-2">
              <Images className="w-12 h-12 text-slate-500 mx-auto" />
              <p className="font-heading font-semibold text-slate-300">No media available</p>
              <p className="text-xs text-slate-500">The employee did not upload any cover or screenshots for this submission.</p>
            </div>
          ) : currentItem ? (
            <div className="relative w-full h-full flex items-center justify-center overflow-auto">
              {currentItem.type === 'VIDEO' ? (
                <video
                  src={currentItem.url}
                  controls
                  className="max-w-full max-h-[58vh] rounded-2xl border border-white/20 shadow-2xl object-contain bg-black"
                >
                  Your browser does not support the video tag.
                </video>
              ) : hasError ? (
                <div className="text-center p-8 bg-rose-950/30 border border-rose-500/30 rounded-2xl max-w-md space-y-3">
                  <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
                  <p className="text-sm font-semibold text-rose-200">Failed to render media item</p>
                  <p className="text-xs text-slate-400 break-all">{currentItem.url.slice(0, 100)}...</p>
                  <button
                    type="button"
                    onClick={() => {
                      setHasError(false);
                      setIsLoading(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold"
                  >
                    Retry Loading
                  </button>
                </div>
              ) : (
                <div className="relative max-w-full max-h-[58vh] flex items-center justify-center">
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
                      <div className="w-8 h-8 rounded-full border-2 border-[#FF3D88] border-t-transparent animate-spin" />
                    </div>
                  )}
                  <img
                    src={currentItem.url}
                    alt={currentItem.label}
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                      setIsLoading(false);
                      setHasError(true);
                    }}
                    style={{
                      transform: `scale(${zoomLevel})`,
                      transition: zoomLevel === 1 ? 'transform 0.2s ease-out' : 'none',
                    }}
                    className="max-w-full max-h-[58vh] object-contain rounded-2xl shadow-2xl border border-white/15 cursor-zoom-in select-none"
                    onClick={zoomLevel === 1 ? handleZoomIn : handleResetZoom}
                  />
                </div>
              )}
            </div>
          ) : null}

          {/* Navigation Arrows */}
          {mediaItems.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                title="Previous (Left Arrow)"
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-[#FF3D88] text-white border border-white/20 shadow-xl transition-all hover:scale-110 z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                title="Next (Right Arrow)"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-[#FF3D88] text-white border border-white/20 shadow-xl transition-all hover:scale-110 z-10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Bottom Thumbnail Strip */}
        {mediaItems.length > 0 && (
          <div className="p-3 sm:p-4 bg-[#0A1229] border-t border-white/10 shrink-0">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                All Submitted Media ({mediaItems.length})
              </span>
              <span className="text-[11px] font-sans text-slate-400 hidden sm:inline">
                Use <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">←</kbd> and{' '}
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">→</kbd> keys to navigate
              </span>
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
              {mediaItems.map((item, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden shrink-0 border transition-all ${
                      isActive
                        ? 'ring-2 ring-[#FF3D88] border-white scale-105 z-10'
                        : 'border-white/20 opacity-60 hover:opacity-100 hover:border-white/40'
                    }`}
                  >
                    {item.type === 'VIDEO' ? (
                      <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-purple-300">
                        <Film className="w-5 h-5" />
                        <span className="text-[9px] font-mono">Video</span>
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt={item.label}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <span className={`absolute bottom-0 inset-x-0 text-[9px] font-mono py-0.5 text-center truncate px-0.5 ${
                      item.type === 'COVER'
                        ? 'bg-[#FF3D88] text-white font-semibold'
                        : 'bg-black/70 text-slate-200'
                    }`}>
                      {item.type === 'COVER' ? 'Cover' : `#${idx}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

