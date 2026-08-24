import React from "react";
import type { PosterImage } from "../types/poster";

interface PosterProps {
  image: PosterImage;
  className?: string;
}

const Poster: React.FC<PosterProps> = ({
  image,
  className = "",
}) => {
  return (
    <div
      className={`
        group
        relative
        w-full
        aspect-[2/3]
        overflow-hidden
        border-2
        border-white/10
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