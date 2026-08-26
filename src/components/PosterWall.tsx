import React, { useMemo, useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import Poster from "./Poster";
import type { PosterImage } from "./types/poster";

interface PosterCollageProps {
  images: PosterImage[];
}

interface Layout {
  x: number;
  y: number;
  rotate: number;
  width: number;
  height: number;
  zIndex: number;
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

const createLayout = (index: number): Layout => {
  const r1 = seededRandom(index + 10);
  const r2 = seededRandom(index + 50);
  const r3 = seededRandom(index + 100);
  const r4 = seededRandom(index + 150);

  /*
   * IMPORTANT:
   * These values are generated ONCE.
   * They do not change when the mouse moves.
   */

  const width = 150 + r1 * 130;
  const height = 190 + r2 * 180;

  return {
    x: -320 + r3 * 640,
    y: -280 + r4 * 560,
    rotate: -18 + seededRandom(index + 200) * 36,
    width,
    height,
    zIndex: index + 1,
  };
};

const PosterPiece: React.FC<{
  image: PosterImage;
  layout: Layout;
  index: number;
  mouseX: number;
  mouseY: number;
}> = ({ image, layout, index, mouseX, mouseY }) => {
  const ref = useRef<HTMLDivElement>(null);

  /*
   * Distance between mouse and this poster.
   */
  const dx = layout.x - mouseX;
  const dy = layout.y - mouseY;

  const distance = Math.sqrt(dx * dx + dy * dy);

  /*
   * Only posters close to the cursor react.
   */
  const influence = Math.max(0, 1 - distance / 280);

  /*
   * Push the poster AWAY from the cursor.
   */
  const moveX = (dx / Math.max(distance, 1)) * influence * 55;

  const moveY = (dy / Math.max(distance, 1)) * influence * 55;

  /*
   * Slight rotation makes the movement
   * feel like paper being pushed by wind.
   */
  const moveRotate =
    layout.rotate +
    (dx / Math.max(distance, 1)) * influence * 8;

  return (
    <motion.div
      ref={ref}
      className="absolute left-1/2 top-1/2 cursor-pointer"
      style={{
        width: layout.width,
        height: layout.height,
        zIndex: layout.zIndex,
        marginLeft: -layout.width / 2,
        marginTop: -layout.height / 2,
      }}
      animate={{
        x: layout.x + moveX,
        y: layout.y + moveY,
        rotate: moveRotate,
      }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 18,
        mass: 0.7,
      }}
      whileHover={{
        scale: 1.03,
      }}
    >
      <div className="relative w-full h-full bg-white border border-black/20 shadow-[8px_8px_20px_rgba(0,0,0,0.35)] overflow-hidden">
        <Poster
          image={image}
          className="w-full h-full object-cover"
        />

        {/* Paper edge */}
        <div className="pointer-events-none absolute inset-0 border border-white/20" />
      </div>
    </motion.div>
  );
};

const PosterCollage: React.FC<PosterCollageProps> = ({ images }) => {
  const [mouse, setMouse] = React.useState({
    x: 0,
    y: 0,
  });

  /*
   * Generate layouts ONLY ONCE.
   *
   * useMemo is extremely important here.
   * The positions will NOT change when the mouse moves.
   */
  const layouts = useMemo(() => {
    return images.map((_, index) => createLayout(index));
  }, [images]);

  const handleMouseMove = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();

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

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-z-ink"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Ambient table lighting */}
      <div className="pointer-events-none absolute inset-0 z-[100] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_60%)]" />

      {/* Posters */}
      <div className="absolute inset-0">
        {images.map((image, index) => (
          <PosterPiece
            key={`${image.ref ?? image.url}-${index}`}
            image={image}
            layout={layouts[index]}
            index={index}
            mouseX={mouse.x}
            mouseY={mouse.y}
          />
        ))}
      </div>

      {/* Edge shadows */}
      <div className="pointer-events-none absolute inset-0 z-[110] bg-[radial-gradient(circle,transparent_45%,rgba(0,0,0,0.35)_100%)]" />
    </div>
  );
};

export default PosterCollage;