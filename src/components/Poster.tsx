import React from "react";
import type { PosterImage } from "./types/poster";

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
        relative
        overflow-hidden
        bg-z-paper
        border
        border-white/10
        ${className}
      `}
    >
      <img
        src={image.url}
        alt="Poster"
        className="block w-full h-auto object-contain"
        draggable={false}
      />
    </div>
  );
};

export default Poster;