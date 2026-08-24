import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Dark theme disabled for now — force light mode
  // To re-enable: remove the forced 'light' and restore the localStorage/matchMedia logic below
  const [theme, setTheme] = useState<Theme>('light');
  /*
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme) return savedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });
  */

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');
    // if (theme === 'dark') root.classList.add('dark');
    // localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    // Disabled — uncomment to re-enable
    // setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
