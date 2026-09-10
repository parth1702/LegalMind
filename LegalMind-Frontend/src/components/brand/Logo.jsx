import React from 'react';
import LogoMark from './LogoMark';
import Wordmark from './Wordmark';

/**
 * Combined LegalMind AI Logo Component
 * Layouts: 'horizontal' | 'vertical' | 'mark-only' | 'wordmark-only'
 */
export default function Logo({
  size = 'md',
  layout = 'horizontal',
  subtitle = false,
  animated = false,
  className = '',
}) {
  if (layout === 'mark-only') {
    return <LogoMark size={size} animated={animated} className={className} />;
  }

  if (layout === 'wordmark-only') {
    return <Wordmark size={size} subtitle={subtitle} className={className} />;
  }

  if (layout === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center gap-2.5 ${className}`}>
        <LogoMark size={size} animated={animated} />
        <Wordmark size={size} subtitle={subtitle} />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoMark size={size} animated={animated} />
      <Wordmark size={size} subtitle={subtitle} />
    </div>
  );
}
