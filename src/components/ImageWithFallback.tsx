import React, { useState, useEffect, useRef } from 'react';
import { PLACEHOLDER_IMAGE_URL } from '../utils/constants';

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
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const isWebsitePreview = 
    previewSource === 'og' || 
    previewSource === 'microlink' || 
    previewSource === 'website' || 
    previewSource === 'screenshot';

  useEffect(() => {
    // Reset states when src changes
    setImgSrc(undefined);
    setIsLoaded(false);
    setHasError(false);

    // Determine the ideal source string
    // Priority: 1. src (Cover) -> 2. previewSrc (OG/Screenshot) -> 3. fallbackSrc (Placeholder)
    let idealSrc = src || previewSrc || fallbackSrc;
    console.log("Rendering image:", idealSrc, " (src:", src, ", previewSrc:", previewSrc, ", fallbackSrc:", fallbackSrc, ")");

    let observer: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window && imgRef.current) {
      observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setImgSrc(idealSrc);
          if (observer && imgRef.current) observer.unobserve(imgRef.current);
        }
      }, {
        rootMargin: '100px 0px', // Load slightly before it comes into view
        threshold: 0.01
      });
      
      observer.observe(imgRef.current);
    } else {
      // Fallback if no intersection observer
      setImgSrc(idealSrc);
    }

    return () => {
      if (observer && imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, previewSrc, fallbackSrc]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  // Get address bar text for the browser mockup
  let displayUrl = 'localhost';
  if (liveDemoUrl) {
    try {
      displayUrl = new URL(liveDemoUrl).hostname.replace('www.', '');
    } catch (e) {
      displayUrl = liveDemoUrl;
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
        {/* Skeleton loader / placeholder background */}
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
