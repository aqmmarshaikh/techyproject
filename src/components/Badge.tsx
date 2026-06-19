import React from 'react';
import { STATUS_DISPLAY_NAMES } from '../utils/constants';

interface BadgeProps {
  type: 'category' | 'status' | 'tech';
  value: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, value, className = '' }) => {
  let bgColor = 'var(--bg-tertiary)';
  let textColor = 'var(--text-secondary)';
  let borderColor = 'var(--border-color)';
  let displayValue = value;

  if (type === 'status') {
    displayValue = STATUS_DISPLAY_NAMES[value] || value;
    switch (value) {
      case 'completed':
        bgColor = 'rgba(34, 197, 94, 0.1)';
        textColor = 'var(--success)';
        borderColor = 'rgba(34, 197, 94, 0.2)';
        break;
      case 'in-progress':
        bgColor = 'rgba(245, 158, 11, 0.1)';
        textColor = 'var(--warning)';
        borderColor = 'rgba(245, 158, 11, 0.2)';
        break;
      case 'beta':
        bgColor = 'rgba(0, 206, 201, 0.1)';
        textColor = 'var(--accent-secondary)';
        borderColor = 'rgba(0, 206, 201, 0.2)';
        break;
      case 'prototype':
        bgColor = 'rgba(168, 85, 247, 0.1)';
        textColor = 'var(--text-accent)';
        borderColor = 'rgba(168, 85, 247, 0.2)';
        break;
    }
  } else if (type === 'category') {
    bgColor = 'rgba(108, 92, 231, 0.1)';
    textColor = '#a29bfe';
    borderColor = 'rgba(108, 92, 231, 0.3)';
  } else if (type === 'tech') {
    bgColor = 'var(--bg-secondary)';
    textColor = 'var(--text-primary)';
  }

  const style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: 'var(--radius-pill)',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: type === 'status' ? 'uppercase' : 'none',
    letterSpacing: type === 'status' ? '0.05em' : 'normal',
    backgroundColor: bgColor,
    color: textColor,
    border: `1px solid ${borderColor}`,
    whiteSpace: 'nowrap'
  };

  return (
    <span style={style} className={className}>
      {displayValue}
    </span>
  );
};
