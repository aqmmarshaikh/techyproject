import React, { useState } from 'react';
import { Mail, MessageSquare, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export const ContactPage: React.FC = () => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: 'collaboration',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call for MVP
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="container" 
      style={{ paddingTop: '100px', paddingBottom: '80px', maxWidth: '800px' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Get in Touch</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Have a collaboration inquiry, want to participate in the community, or just have general feedback? We'd love to hear from you.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        <div className="glass" style={{ padding: '40px', borderRadius: 'var(--radius-lg)' }}>
          {submitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center', padding: '40px 0' }}
            >
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '50%', 
                backgroundColor: 'rgba(0, 200, 83, 0.1)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                margin: '0 auto 24px', color: 'var(--success)'
              }}>
                <MessageSquare size={32} />
              </div>
              <h2 style={{ marginBottom: '16px' }}>Message Sent!</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Thank you for reaching out. We'll get back to you as soon as possible.
              </p>
              <button 
                onClick={() => setSubmitted(false)} 
                className="btn btn-secondary"
              >
                Send Another Message
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Your Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required 
                    value={formState.name}
                    onChange={e => setFormState({...formState, name: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <input 
                    type="email" 
                    className="input-field" 
                    required 
                    value={formState.email}
                    onChange={e => setFormState({...formState, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Subject</label>
                <select 
                  className="input-field" 
                  value={formState.subject}
                  onChange={e => setFormState({...formState, subject: e.target.value})}
                  style={{ appearance: 'none', backgroundColor: 'var(--bg-secondary)' }}
                >
                  <option value="collaboration">Collaboration Inquiry</option>
                  <option value="community">Community Participation</option>
                  <option value="feedback">General Feedback</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Message</label>
                <textarea 
                  className="input-field" 
                  rows={5} 
                  required
                  value={formState.message}
                  onChange={e => setFormState({...formState, message: e.target.value})}
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '16px', fontSize: '1.05rem', marginTop: '8px' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap', marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
            <Mail size={20} color="var(--accent-primary)" />
            <span>hello@techyboy.com</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
            <Users size={20} color="var(--accent-primary)" />
            <span>Join our Discord</span>
          </div>
        </div>
      </div>
      
      <style>
        {`
          @media (max-width: 640px) {
            form > div:first-child {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </motion.div>
  );
};
