import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { debounce } from '../utils/helpers';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = 'Search projects or creators...',
  className = ''
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal state with URL when it changes externally
  useEffect(() => {
    if (location.pathname === '/') {
      setQuery(searchParams.get('q') || '');
    } else {
      setQuery(''); // Clear if we navigate away
    }
  }, [searchParams, location.pathname]);

  const debouncedSearch = useRef(
    debounce((q: string) => {
      if (q.trim()) {
        navigate(`/?q=${encodeURIComponent(q.trim())}`);
      } else if (location.pathname === '/' && searchParams.has('q')) {
        navigate('/');
      }
    }, 300)
  ).current;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    debouncedSearch(val);
  };

  const handleClear = () => {
    setQuery('');
    if (location.pathname === '/' && searchParams.has('q')) {
      navigate('/');
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div 
      className={`search-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '400px', // Slightly smaller for navbar
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-pill)',
          padding: '8px 16px',
          transition: 'all var(--transition-fast)',
        }}
        className="search-input-wrapper"
      >
        <Search 
          size={16} 
          color="var(--text-secondary)" 
          style={{ marginRight: '10px', flexShrink: 0 }}
        />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            fontFamily: 'var(--font-body)',
            outline: 'none',
            width: '100%'
          }}
        />
        
        {query && (
          <button
            onClick={handleClear}
            aria-label="Clear search"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '2px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              marginLeft: '4px'
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>
      
      <style>
        {`
          .search-input-wrapper:focus-within {
            border-color: var(--accent-primary);
            background-color: rgba(0, 212, 255, 0.05) !important;
            box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
          }
        `}
      </style>
    </div>
  );
};
