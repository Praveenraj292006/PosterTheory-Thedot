import React from "react";
import type { PosterImage } from "../types/poster";

interface PosterProps {
  image: PosterImage;
  className?: string;
  size?: "small" | "medium" | "large";
}

const Poster: React.FC<PosterProps> = ({
  image,
  className = "",
  size = "medium",
}) => {
  const sizeClasses = {
    small: "w-[180px]",
    medium: "w-[220px]",
    large: "w-[260px]",
  };

  return (
    <div
      className={`
        group
        relative
        ${sizeClasses[size]}
        aspect-[2/3]
        shrink-0
        overflow-hidden
        border-2
        border-z-border
        bg-z-paper
        ${className}
      `}
    >
      <img
        src={image.url}
        alt="Featured poster"
        className="
          w-full
          h-full
          object-cover
          transition-transform
          duration-700
          group-hover:scale-105
        "
      />
    </div>
  );
};

export default Poster;