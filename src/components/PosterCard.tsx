import React from "react";
import Poster from "./Poster";
import type { PosterImage } from "../types/poster";

interface PosterCardProps {
  image: PosterImage;
  title: string;
  category: string;
}

const PosterCard: React.FC<PosterCardProps> = ({
  image,
  title,
  category,
}) => {
  return (
    <article className="group w-full">

      {/* Poster */}
      <Poster image={image} />


      {/* Product Information */}
      <div className="mt-4">

        <h3
          className="
            font-mono
            font-black
            text-[12px]
            sm:text-[13px]
            uppercase
            leading-tight
            tracking-tight
            text-z-ink
          "
        >
          {title}
        </h3>


        <p
          className="
            mt-2
            font-mono
            text-[9px]
            sm:text-[10px]
            uppercase
            tracking-wider
            text-z-muted
          "
        >
          {category}
        </p>

      </div>

    </article>
  );
};

export default PosterCard;