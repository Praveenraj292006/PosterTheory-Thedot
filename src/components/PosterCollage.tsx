import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import Poster from "./Poster";
import type { PosterImage } from "./types/poster";

interface PosterCollageProps {
  images: PosterImage[];
  posterCount?: number;
}

interface Layout {
  x: number;
  y: number;
  width: number;
  rotate: number;
  zIndex: number;
  isCenter?: boolean;
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

/*
 * Create a fixed collage layout.
 *
 * IMPORTANT:
 * These positions are generated only once.
 * Mouse movement will NOT regenerate them.
 */
const createLayout = (
  index: number,
  total: number
): Layout => {
  /*
   * First poster is the hero/center poster.
   */
  if (index === 0) {
    return {
      x: 0,
      y: 0,
      width: 27,
      rotate: -2,
      zIndex: 100,
      isCenter: true,
    };
  }

  const r1 = seededRandom(index + 90);
  const r2 = seededRandom(index + 80);
  const r3 = seededRandom(index + 130);
  const r4 = seededRandom(index + 40);

  /*
   * Spread posters around the entire hero.
   *
   * x/y are percentages relative to the center.
   */
  const x =
    -48 +
    r1 * 96;

  const y =
    -48 +
    r2 * 96;

  /*
   * Different A4 poster sizes.
   */
  const width =
    14 +
    r3 * 11;

  const rotate =
    -16 +
    r4 * 32;

  return {
    x,
    y,
    width,
    rotate,
    zIndex: index + 1,
  };
};

/*
 * Create the required number of posters.
 *
 * If the API doesn't provide enough images,
 * random posters are duplicated.
 */
const buildPosterCollection = (
  images: PosterImage[],
  count: number
): PosterImage[] => {
  if (!images.length || count <= 0) {
    return [];
  }

  const result: PosterImage[] = [];

  /*
   * First add the original posters.
   */
  images.forEach((image) => {
    if (result.length < count) {
      result.push(image);
    }
  });

  /*
   * Fill the remaining positions with
   * random existing posters.
   */
  while (result.length < count) {
    const randomIndex = Math.floor(
      Math.random() * images.length
    );

    result.push(images[randomIndex]);
  }

  return result;
};

interface PosterPieceProps {
  image: PosterImage;
  layout: Layout;
  mouseX: number;
  mouseY: number;
}

const PosterPiece: React.FC<PosterPieceProps> = ({
  image,
  layout,
  mouseX,
  mouseY,
}) => {
  /*
   * Convert percentage layout coordinates
   * into mouse-relative coordinates.
   */
  const layoutX = layout.x * 8;
  const layoutY = layout.y * 6;

  const dx = layoutX - mouseX;
  const dy = layoutY - mouseY;

  const distance = Math.sqrt(
    dx * dx + dy * dy
  );

  /*
   * Mouse influence.
   */
  const influence = Math.max(
    0,
    1 - distance / 300
  );

  /*
   * Wind pushes the poster away from
   * the cursor.
   */
  const windStrength = layout.isCenter
    ? 25
    : 60;

  const moveX =
    (dx / Math.max(distance, 1)) *
    influence *
    windStrength;

  const moveY =
    (dy / Math.max(distance, 1)) *
    influence *
    windStrength;

  /*
   * Small rotation caused by the wind.
   */
  const moveRotate =
    layout.rotate +
    (dx / Math.max(distance, 1)) *
      influence *
      6;

  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{
        width: `${layout.width}%`,
        aspectRatio: "210 / 297",
        zIndex: layout.zIndex,
        marginLeft: `${-layout.width / 2}%`,
        marginTop: `${-(layout.width / 2) * (297 / 210)}%`,
      }}
      animate={{
        x: layoutX + moveX,
        y: layoutY + moveY,
        rotate: moveRotate,
      }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 18,
        mass: 0.7,
      }}
      whileHover={{
        scale: 1.025,
      }}
    >
      <div
        className="
          relative
          w-full
          h-full
          bg-white
          overflow-hidden
          border
          border-black/20
          shadow-[10px_14px_25px_rgba(0,0,0,0.35)]
        "
      >
        <Poster
          image={image}
          className="w-full h-full object-cover"
        />

        {/* Paper edge */}
        <div className="pointer-events-none absolute inset-0 border border-white/30" />
      </div>
    </motion.div>
  );
};

const PosterCollage: React.FC<PosterCollageProps> = ({
  images,
  posterCount = 20,
}) => {
  const [mouse, setMouse] = useState({
    x: 0,
    y: 0,
  });

  /*
   * Build the exact number of posters.
   */
  const collageImages = useMemo(() => {
    return buildPosterCollection(
      images,
      posterCount
    );
  }, [images, posterCount]);

  /*
   * Generate the physical arrangement once.
   */
  const layouts = useMemo(() => {
    return collageImages.map((_, index) =>
      createLayout(
        index,
        collageImages.length
      )
    );
  }, [collageImages]);

  const handleMouseMove = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    const rect =
      event.currentTarget.getBoundingClientRect();

    /*
     * Convert mouse position to coordinates
     * relative to the center of the collage.
     */
    const x =
      event.clientX -
      rect.left -
      rect.width / 2;

    const y =
      event.clientY -
      rect.top -
      rect.height / 2;

    setMouse({
      x,
      y,
    });
  };

  const handleMouseLeave = () => {
    setMouse({
      x: 0,
      y: 0,
    });
  };

  if (!collageImages.length) {
    return null;
  }

  return (
    <div
      className="
        relative
        w-full
        h-full
        overflow-hidden
      
      "
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >

      {/* Ambient light */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-[200]
          bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.07),transparent_65%)]
        "
      />

      {/* Poster collage */}
      <div className="absolute inset-0">

        {collageImages.map((image, index) => (
          <PosterPiece
            key={`${image.ref ?? image.url}-${index}`}
            image={image}
            layout={layouts[index]}
            mouseX={mouse.x}
            mouseY={mouse.y}
          />
        ))}

      </div>

      {/* Edge vignette */}
      

      {/* Top fade */}
      {/* <div
        className="
          pointer-events-none
          absolute
          top-0
          left-0
          right-0
          h-24
          z-[220]
          bg-gradient-to-b
          from-z-ink
          to-transparent
        "
      /> */}

      {/* Bottom fade */}
        {/* <div
          className="
            pointer-events-none
            absolute
            bottom-0
            left-0
            right-0
            h-24
            z-[220]
            bg-gradient-to-t
            from-z-ink
            to-transparent
          "
        /> */}

    </div>
  );
};

export default PosterCollage;