import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section 
      className="hero-section"
      style={{
        position: 'relative',
        maxHeight: '800px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        paddingTop: '80px', // offset for navbar
        paddingBottom: '80px'
      }}
    >
      {/* Transparent overlay for text readability */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(5, 8, 22, 0.4), var(--bg-primary))',
          zIndex: -1
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div 
          className="animate-fade-in" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '6px 14px', 
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'rgba(0, 229, 255, 0.1)',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            fontWeight: 500,
            marginBottom: '32px',
            boxShadow: '0 0 15px rgba(0, 229, 255, 0.2)'
          }}
        >
          <Sparkles size={14} color="var(--accent-primary)" />
          <span style={{ textShadow: '0 0 10px rgba(0,229,255,0.5)' }}>SYSTEM_ONLINE: TechyBoy Nexus</span>
        </div>

        <h1 
          className="animate-fade-in"
          style={{ 
            fontSize: 'clamp(4rem, 9vw, 7rem)', 
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
            marginBottom: '24px',
            maxWidth: '1000px',
            margin: '0 auto 24px',
            animationDelay: '0.1s',
            color: 'var(--text-primary)',
            textShadow: '0 0 30px rgba(0, 229, 255, 0.2)'
          }}
        >
          THE FUTURE IS<br />
          <span style={{ color: 'transparent', WebkitTextStroke: '1px var(--accent-primary)', textShadow: '0 0 20px rgba(0, 229, 255, 0.4)' }}>NOW LOADING_</span>
        </h1>

        <p 
          className="animate-fade-in"
          style={{
            fontSize: 'clamp(1.1rem, 2vw, 1.25rem)',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto 40px',
            lineHeight: 1.6,
            animationDelay: '0.2s'
          }}
        >
          Discover amazing projects built by the TechyBoy community.
        </p>

        <div 
          className="hero-buttons animate-fade-in" 
          style={{ 
            display: 'flex', 
            gap: '16px', 
            justifyContent: 'center',
            animationDelay: '0.3s'
          }}
        >
          <a 
            href="#projects" 
            className="btn btn-primary"
            style={{ padding: '14px 28px', fontSize: '1rem' }}
          >
            Explore Projects
          </a>
          <Link 
            to="/submit" 
            className="btn btn-secondary glass"
            style={{ padding: '14px 28px', fontSize: '1rem' }}
          >
            Submit Project <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <style>
        {`
          @keyframes gradientBG {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .hero-section {
            min-height: 80vh;
          }
          
          @media (max-width: 768px) {
            .hero-section {
              min-height: 60vh;
            }
            .hero-buttons {
              flex-direction: column;
              width: 100%;
              max-width: 100%;
              padding: 0 16px;
            }
            .hero-buttons .btn {
              width: 100%;
            }
          }
        `}
      </style>
    </section>
  );
};
