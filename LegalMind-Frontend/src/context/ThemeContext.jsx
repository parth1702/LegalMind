import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('legalmind_theme') || 'dark';
  });

  const [fontSize, setFontSizeState] = useState(() => {
    return localStorage.getItem('legalmind_fontsize') || 'normal';
  });

  const [highContrast, setHighContrastState] = useState(() => {
    return localStorage.getItem('legalmind_highcontrast') === 'true';
  });

  // Track computed active light state
  const [isLightActive, setIsLightActive] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light');
    localStorage.setItem('legalmind_theme', 'dark');
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    localStorage.setItem('legalmind_highcontrast', highContrast);
  }, [highContrast]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-font-size', fontSize);
    localStorage.setItem('legalmind_fontsize', fontSize);
  }, [fontSize]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
  };

  const toggleLightDark = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setFontSize = (size) => {
    setFontSizeState(size);
  };

  const setHighContrast = (val) => {
    setHighContrastState(val);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleLightDark,
        isLight: isLightActive,
        fontSize,
        setFontSize,
        highContrast,
        setHighContrast,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
