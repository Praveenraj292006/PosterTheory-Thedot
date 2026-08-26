import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'nav' | 'hero' | 'footer';
}

export default function Logo({ className = "", size = 'md' }: LogoProps) {
  const { theme } = useTheme();

  const sizeClasses = {
    sm: "h-12 sm:h-14 md:h-16",
    md: "h-16 sm:h-20 md:h-24",
    lg: "h-24 md:h-32",
    nav: "w-[150px] sm:w-[160px] md:w-[180px] lg:w-[180px] h-auto p-2",
    hero: "w-full h-auto max-h-[350px] sm:max-h-[500px] md:max-h-[600px]",
    footer: "h-20 md:h-32"
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      {theme === 'dark' || size == 'nav' ? (
        <img 
          src="/logo-dark.png" 
          alt="POSTER THEORY" 
          className={`${sizeClasses[size]} w-auto object-contain transition-all duration-300`}
        />
      ) : (
        <img 
          src="/logo.png" 
          alt="POSTER THEORY" 
          className={`${sizeClasses[size]} w-auto object-contain transition-all duration-300`}
        />
      )}
    </div>
  );
}
