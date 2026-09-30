import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * RouteProgressBar
 * Premium top-of-page progress indicator that fires on every route change.
 * Mimics the UX of YouTube / GitHub's loading bar.
 */
export default function RouteProgressBar() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);
  const completeRef = useRef(null);
  const fadeRef = useRef(null);

  const clearAll = () => {
    clearInterval(timerRef.current);
    clearTimeout(completeRef.current);
    clearTimeout(fadeRef.current);
  };

  useEffect(() => {
    // Start the bar on every route change
    clearAll();
    setProgress(0);
    setVisible(true);

    // Increment quickly to ~85% then stall — simulates async work
    let current = 0;
    timerRef.current = setInterval(() => {
      current += Math.random() * 18 + 4; // random jump: 4–22 %
      if (current >= 85) {
        current = 85;
        clearInterval(timerRef.current);
      }
      setProgress(current);
    }, 120);

    // Complete after a short delay
    completeRef.current = setTimeout(() => {
      clearInterval(timerRef.current);
      setProgress(100);

      // Fade out after completion
      fadeRef.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 400);
    }, 600);

    return clearAll;
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <>
      {/* Top progress bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: `${progress}%`,
          height: '2.5px',
          background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
          boxShadow: 'none',
          zIndex: 99999,
          transition: progress === 100
            ? 'width 0.25s ease-out, opacity 0.3s ease-out'
            : 'width 0.15s ease-out',
          opacity: progress === 100 ? 0 : 1,
          borderRadius: '0 2px 2px 0',
        }}
      />

      {/* Glowing leading edge dot */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: `${progress}%`,
          width: '80px',
          height: '2.5px',
          background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.9))',
          boxShadow: '0 0 8px 2px rgba(56,189,248,0.8)',
          zIndex: 99999,
          transform: 'translateX(-100%)',
          opacity: progress === 100 ? 0 : 1,
          transition: progress === 100 ? 'opacity 0.3s ease-out' : 'left 0.15s ease-out',
        }}
      />
    </>
  );
}
