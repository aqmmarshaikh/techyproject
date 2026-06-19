import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer 
      style={{
        padding: '60px 0 40px',
        marginTop: '80px',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-primary)'
      }}
    >
      <div className="container">
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            textAlign: 'center',
            gap: '24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '8px', 
                background: 'var(--bg-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                fontWeight: 800,
                fontSize: '1rem',
                border: '1px solid var(--border-color)'
              }}
            >
              T
            </div>
            <span 
              style={{ 
                fontFamily: 'var(--font-heading)', 
                fontWeight: 600, 
                fontSize: '1.1rem',
                color: 'var(--text-primary)'
              }}
            >
              TechyBoy
            </span>
          </div>
          
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0' }}>
            The platform for student innovation.
          </p>
          
          <div style={{ display: 'flex', gap: '24px', marginTop: '12px' }}>
            <Link to="/" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Discover</Link>
            <Link to="/submit" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Submit Project</Link>
            <Link to="/admin" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Admin</Link>
          </div>
          
          <div 
            style={{ 
              marginTop: '32px', 
              paddingTop: '24px', 
              borderTop: '1px solid var(--border-color)', 
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem'
            }}
            className="footer-bottom"
          >
            <p>&copy; {new Date().getFullYear()} TechyBoy. All rights reserved.</p>
            <p>Designed with <span style={{ color: 'var(--danger)' }}>♥</span></p>
          </div>
        </div>
      </div>
      
      <style>
        {`
          @media (max-width: 640px) {
            .footer-bottom {
              flex-direction: column;
              gap: 16px;
            }
          }
        `}
      </style>
    </footer>
  );
};
