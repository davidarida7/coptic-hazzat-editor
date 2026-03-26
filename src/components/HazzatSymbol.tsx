import React from 'react';
import { HazzatSymbolType } from '../types';

interface Props {
  type: HazzatSymbolType;
  className?: string;
  variant?: 'up' | 'down';
}

export const HazzatSymbol: React.FC<Props> = ({ type, className, variant }) => {
  switch (type) {
    case 'note-o':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="4" />
        </svg>
      );
    case 'note-i':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="8" x2="12" y2="16" />
        </svg>
      );
    case 'long':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="0" y1="12" x2="24" y2="12" />
        </svg>
      );
    case 'pause':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="16" y1="6" x2="8" y2="18" />
        </svg>
      );
    case 'trill':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 14c1-2 2-2 3 0s2 2 3 0 2-2 3 0 2 2 3 0" />
        </svg>
      );
    case 'short':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
          <circle cx="12" cy="18" r="1.5" />
        </svg>
      );
    case 'slur':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
          {variant === 'up' ? (
            <path d="M0 12c4 -8 20 -8 24 0" />
          ) : (
            <path d="M0 12c4 8 20 8 24 0" />
          )}
        </svg>
      );
    case 'high':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M8 16l8-8m0 0h-6m6 0v6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'low':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M8 8l8 8m0 0h-6m6 0v-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
};

export const DecorativeOrnament: React.FC<{ side: 'left' | 'right' }> = () => {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 text-[#1A1A1A]" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Coptic Cross Style */}
      <path d="M12 4v16M4 12h16" strokeLinecap="round" />
      <path d="M9 4h6M9 20h6M4 9v6M20 9v6" strokeLinecap="round" />
      <circle cx="8" cy="8" r="0.5" fill="currentColor" />
      <circle cx="16" cy="8" r="0.5" fill="currentColor" />
      <circle cx="8" cy="16" r="0.5" fill="currentColor" />
      <circle cx="16" cy="16" r="0.5" fill="currentColor" />
    </svg>
  );
};
