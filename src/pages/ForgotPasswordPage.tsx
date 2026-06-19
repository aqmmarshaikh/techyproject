import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { sendPasswordReset } from '../lib/auth';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await sendPasswordReset(email);
      setMessage('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
      <div className="glass animate-fade-in" style={{ padding: '40px', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '440px', textAlign: 'center', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(0, 229, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 15px rgba(0, 229, 255, 0.3)' }}>
          <Send size={28} color="var(--accent-primary)" />
        </div>
        <h2 style={{ marginBottom: '8px', fontSize: '1.75rem', fontWeight: 700 }}>Reset Password</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '0.95rem' }}>
          Enter your email to receive a password reset link.
        </p>

        {error && (
          <div style={{ padding: '12px 16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', marginBottom: '24px', fontSize: '0.9rem', textAlign: 'left' }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ padding: '12px 16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-sm)', color: 'var(--success)', marginBottom: '24px', fontSize: '0.9rem', textAlign: 'left' }}>
            {message}
          </div>
        )}

        {!message && (
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group" style={{ textAlign: 'left', marginBottom: 0 }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex' }}>
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  className="input-field"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '46px' }}
                  required
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '12px', marginTop: '8px' }}
              disabled={loading || !email}
            >
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '32px' }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
