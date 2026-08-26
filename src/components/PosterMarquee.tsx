import React from "react";
import { motion } from "motion/react";
import Poster from "./Poster";
import type { PosterImage } from "./types/poster";

interface PosterMarqueeProps {
  images: PosterImage[];
}

interface PosterColumnProps {
  images: PosterImage[];
  duration: number;
  direction?: "up" | "down";
}

const PosterColumn: React.FC<PosterColumnProps> = ({
  images,
  duration,
  direction = "down",
}) => {
  /*
   * Duplicate the posters.
   *
   * This allows us to continuously move one copy
   * into the position of the next copy.
   */
  const duplicatedImages = [...images, ...images];

  return (
    <div className="relative h-[850px] overflow-hidden">

      <motion.div
        className="flex flex-col gap-5"
        initial={{
          y: direction === "down" ? "-50%" : "0%",
        }}
        animate={{
          y: direction === "down" ? "0%" : "-50%",
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {duplicatedImages.map((image, index) => (
          <Poster
            key={`${image.ref ?? image.url}-${index}`}
            image={image}
            className="
              w-full
              shrink-0
              shadow-[8px_8px_0px_0px_rgba(255,255,255,0.08)]
            "
          />
        ))}
      </motion.div>

    </div>
  );
};


const PosterMarquee: React.FC<PosterMarqueeProps> = ({
  images,
}) => {

  if (!images || images.length === 0) {
    return null;
  }

  /*
   * Split posters between the three columns.
   */
  const columnOne = images.filter(
    (_, index) => index % 3 === 0
  );

  const columnTwo = images.filter(
    (_, index) => index % 3 === 1
  );

  const columnThree = images.filter(
    (_, index) => index % 3 === 3
  );


  /*
   * If there aren't enough images,
   * reuse the complete array.
   */
  const firstColumn =
    columnOne.length > 0 ? columnOne : images;

  const secondColumn =
    columnTwo.length > 0 ? columnTwo : images;

  const thirdColumn =
    columnThree.length > 0 ? columnThree : images;


  return (
    <div className="relative w-full h-full">

      {/* Poster columns */}

      <div
        className="
          grid
          grid-cols-3
          gap-4
          h-full
          px-4
        "
      >

        {/* Column 1 */}

        <PosterColumn
          images={firstColumn}
          duration={18}
          direction="down"
        />


        {/* Column 2 */}

        <PosterColumn
          images={secondColumn}
          duration={23}
          direction="down"
        />


        {/* Column 3 */}

        <PosterColumn
          images={thirdColumn}
          duration={20}
          direction="down"
        />

      </div>


      {/* Top fade */}

      <div
        className="
          pointer-events-none
          absolute
          top-0
          left-0
          right-0
          h-32
          z-20
          bg-gradient-to-b
          from-z-ink
          to-transparent
        "
      />


      {/* Bottom fade */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-0
          left-0
          right-0
          h-40
          z-20
          bg-gradient-to-t
          from-z-ink
          to-transparent
        "
      />


      {/* Left fade */}

      <div
        className="
          pointer-events-none
          absolute
          inset-y-0
          left-0
          w-16
          z-20
          bg-gradient-to-r
          from-z-ink
          to-transparent
        "
      />


      {/* Right fade */}

      <div
        className="
          pointer-events-none
          absolute
          inset-y-0
          right-0
          w-16
          z-20
          bg-gradient-to-l
          from-z-ink
          to-transparent
        "
      />

    </div>
  );
};

export default PosterMarquee;