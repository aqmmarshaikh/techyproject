import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div 
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '0 24px'
      }}
    >
      <div 
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px'
        }}
      >
        <AlertCircle size={40} color="var(--danger)" />
      </div>
      
      <h1 style={{ fontSize: '3rem', marginBottom: '16px' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', color: 'var(--text-secondary)' }}>
        Page not found
      </h2>
      <p style={{ maxWidth: '400px', margin: '0 auto 32px', color: 'var(--text-secondary)' }}>
        The project or page you are looking for doesn't exist or has been removed.
      </p>
      
      <Link to="/" className="btn btn-primary" style={{ padding: '12px 24px' }}>
        Return to Home
      </Link>
    </div>
  );
};
