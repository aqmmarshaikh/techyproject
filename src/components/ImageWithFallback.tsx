import React, { useState, useEffect, useRef } from 'react';
import { PLACEHOLDER_IMAGE_URL } from '../utils/constants';
import { getLiveScreenshotUrl, normalizeUrl } from '../utils/helpers';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  previewSrc?: string;
  liveDemoUrl?: string;
  containerClassName?: string;
  previewSource?: 'cover' | 'og' | 'microlink' | 'placeholder' | 'website' | 'screenshot';
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc = PLACEHOLDER_IMAGE_URL,
  previewSrc,
  liveDemoUrl,
  alt = 'Image',
  className = '',
  containerClassName = '',
  previewSource,
  style,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);
  const [fallbackStage, setFallbackStage] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const normalizedLiveUrl = liveDemoUrl ? normalizeUrl(liveDemoUrl) : '';
  const isWebsitePreview = 
    previewSource === 'og' || 
    previewSource === 'microlink' || 
    previewSource === 'website' || 
    previewSource === 'screenshot' ||
    Boolean(normalizedLiveUrl && !src);

  useEffect(() => {
    // Reset state when inputs change
    setIsLoaded(false);
    setFallbackStage(0);

    // Initial image choice
    // Priority: 1. Cover Image (src) -> 2. Preview Image (previewSrc) -> 3. Dynamic Live Screenshot -> 4. Category Fallback
    let initialSrc = src || previewSrc;
    if (!initialSrc && normalizedLiveUrl) {
      initialSrc = getLiveScreenshotUrl(normalizedLiveUrl, 'mshots');
    }
    if (!initialSrc) {
      initialSrc = fallbackSrc;
    }

    setImgSrc(initialSrc);

    let observer: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window && imgRef.current) {
      observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          if (imgRef.current) observer?.unobserve(imgRef.current);
        }
      }, {
        rootMargin: '100px 0px',
        threshold: 0.01
      });
      observer.observe(imgRef.current);
    }

    return () => {
      if (observer && imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, previewSrc, fallbackSrc, normalizedLiveUrl]);

  const handleError = () => {
    setIsLoaded(false);

    if (fallbackStage === 0 && normalizedLiveUrl) {
      // Stage 1: Try Automattic WordPress mShots API live screenshot
      setFallbackStage(1);
      const mShotsUrl = getLiveScreenshotUrl(normalizedLiveUrl, 'mshots');
      if (mShotsUrl !== imgSrc) {
        setImgSrc(mShotsUrl);
        return;
      }
    }

    if (fallbackStage <= 1 && normalizedLiveUrl) {
      // Stage 2: Try Thum.io live screenshot fallback
      setFallbackStage(2);
      const thumUrl = getLiveScreenshotUrl(normalizedLiveUrl, 'thum');
      if (thumUrl !== imgSrc) {
        setImgSrc(thumUrl);
        return;
      }
    }

    // Stage 3: Final Category / System Placeholder
    setFallbackStage(3);
    setImgSrc(fallbackSrc);
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  // Get address bar text for the browser mockup
  let displayUrl = 'localhost';
  if (normalizedLiveUrl) {
    try {
      displayUrl = new URL(normalizedLiveUrl).hostname.replace(/^www\./, '');
    } catch (e) {
      displayUrl = normalizedLiveUrl;
    }
  }

  return (
    <div 
      className={`image-container ${containerClassName} ${isWebsitePreview ? 'website-preview-container' : ''}`} 
      style={{ 
        position: 'relative', 
        overflow: 'hidden', 
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%'
      }}
    >
      {isWebsitePreview && (
        <div className="browser-mock-header">
          <div className="browser-mock-dots">
            <span className="browser-mock-dot dot-red"></span>
            <span className="browser-mock-dot dot-yellow"></span>
            <span className="browser-mock-dot dot-green"></span>
          </div>
          <div className="browser-mock-address">
            {displayUrl}
          </div>
        </div>
      )}

      <div style={{ flex: 1, position: 'relative', width: '100%', overflow: 'hidden' }}>
        {/* Shimmer skeleton loader */}
        {!isLoaded && (
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, var(--bg-secondary) 0%, var(--bg-tertiary) 50%, var(--bg-secondary) 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite linear',
              zIndex: 1
            }}
          />
        )}
        
        <img
          ref={imgRef}
          src={imgSrc}
          alt={alt}
          onError={handleError}
          onLoad={handleLoad}
          className={`${className} ${isWebsitePreview ? 'website-preview-img' : ''}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: isWebsitePreview ? 'top center' : 'center',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity var(--transition-normal)',
            ...style
          }}
          {...props}
        />
      </div>
      
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}
      </style>
    </div>
  );
};
