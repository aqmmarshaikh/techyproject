import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Compass, PlusCircle, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { logout } from '../lib/auth';
import { SearchBar } from './SearchBar';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  return (
    <header 
      className={`navbar ${isScrolled ? 'scrolled glass' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: 'all var(--transition-normal)',
        padding: isScrolled ? '12px 0' : '20px 0',
        backgroundColor: isScrolled ? 'var(--glass-bg)' : 'transparent',
        borderBottom: isScrolled ? '1px solid var(--border-color)' : '1px solid transparent'
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Logo */}
        <Link 
          to="/" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            textDecoration: 'none'
          }}
        >
          <div 
            style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '8px', 
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#050816',
              fontWeight: 800,
              fontSize: '1rem',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 0 15px rgba(0, 229, 255, 0.6)'
            }}
          >
            T
          </div>
          <span 
            style={{ 
              fontFamily: 'var(--font-heading)', 
              fontWeight: 700, 
              fontSize: '1.25rem',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              textShadow: '0 0 10px rgba(0, 229, 255, 0.3)'
            }}
          >
            TechyBoy
          </span>
        </Link>

        {/* Global Search Bar (Desktop) */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', margin: '0 24px' }} className="desktop-search">
          <SearchBar />
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" style={{ display: 'none', alignItems: 'center', gap: '20px' }}>
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Discover</Link>
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>Admin Panel</Link>
              )}
              <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>My Dashboard</Link>
              <Link to="/submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '8px 16px', borderRadius: '8px' }}>
                <Plus size={16} strokeWidth={2.5} /> Submit
              </Link>
              <button 
                onClick={() => logout()} 
                className="btn btn-secondary" 
                style={{ fontSize: '0.85rem', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '8px 20px', borderRadius: '8px' }}>
              Sign In
            </Link>
          )}
        </nav>

        {/* We remove the mobile toggle since we are using a bottom nav */}
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav glass">
        <Link to="/" className={`mobile-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <Compass size={24} />
          <span>Discover</span>
        </Link>
        <Link to="/submit" className={`mobile-nav-item ${location.pathname === '/submit' ? 'active' : ''}`}>
          <PlusCircle size={24} color="var(--accent-primary)" />
          <span style={{ color: 'var(--text-accent)' }}>Submit</span>
        </Link>
        {user ? (
          isAdmin ? (
            <Link to="/admin" className={`mobile-nav-item ${location.pathname === '/admin' ? 'active' : ''}`}>
              <UserCircle size={24} />
              <span>Admin</span>
            </Link>
          ) : (
            <Link to="/dashboard" className={`mobile-nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
              <UserCircle size={24} />
              <span>Dashboard</span>
            </Link>
          )
        ) : (
          <Link to="/login" className={`mobile-nav-item ${location.pathname === '/login' ? 'active' : ''}`}>
            <UserCircle size={24} />
            <span>Sign In</span>
          </Link>
        )}
      </nav>

      <style>
        {`
          @media (min-width: 768px) {
            .desktop-nav {
              display: flex !important;
              align-items: center;
              gap: 32px;
            }
            .desktop-search {
              display: flex !important;
            }
            .mobile-bottom-nav {
              display: none !important;
            }
          }
          
          @media (max-width: 767px) {
            .desktop-search {
              display: none !important;
            }
            body {
              padding-bottom: 80px; /* space for bottom nav */
            }
          }

          .nav-link {
            color: var(--text-secondary);
            font-weight: 500;
            transition: color var(--transition-fast);
          }

          .nav-link:hover, .nav-link.active {
            color: var(--text-primary);
          }

          .mobile-bottom-nav {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 70px;
            display: flex;
            justify-content: space-around;
            align-items: center;
            z-index: 100;
            border-top: 1px solid var(--border-color);
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            padding-bottom: env(safe-area-inset-bottom);
          }

          .mobile-nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            color: var(--text-secondary);
            text-decoration: none;
            font-size: 0.75rem;
            font-weight: 500;
            transition: all var(--transition-fast);
            flex: 1;
            padding: 8px 0;
            min-height: 48px;
            justify-content: center;
          }

          .mobile-nav-item.active {
            color: var(--text-primary);
          }

          .mobile-nav-item:active {
            transform: scale(0.95);
          }
        `}
      </style>
    </header>
  );
};
