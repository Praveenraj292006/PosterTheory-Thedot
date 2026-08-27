import React from "react";
import { useTheme } from "../context/ThemeContext";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "nav" | "hero" | "footer";
}

export default function Logo({
  className = "",
  size = "md",
}: LogoProps) {
  const { theme } = useTheme();

  const sizeClasses = {
    sm: "h-12 sm:h-14 md:h-16",
    md: "h-16 sm:h-20 md:h-24",
    lg: "h-24 md:h-32",
    nav: "w-[110px] sm:w-[130px] md:w-[150px] lg:w-[160px] h-auto",
    hero: "w-full max-w-[600px] h-auto max-h-[350px] sm:max-h-[500px] md:max-h-[600px]",
    footer: "h-20 md:h-32",
  };

  const logoSrc =
    theme === "dark" || size === "nav"
      ? "/logo-dark.png"
      : "/logo.png";

  return (
    <div className={`inline-flex items-center shrink-0 ${className}`}>
      <img
        src={logoSrc}
        alt="POSTER THEORY"
        className={`${sizeClasses[size]} object-contain block max-w-full`}
      />
    </div>
  );
}