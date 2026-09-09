import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const transitionRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    const transition = transitionRef.current;
    const page = pageRef.current;

    if (!transition || !page) return;

    // Don't animate on the first page load
    if (firstRender.current) {
      firstRender.current = false;

      gsap.set(transition, {
        scaleX: 0,
        transformOrigin: "right center",
      });

      gsap.set(page, {
        opacity: 1,
        y: 0,
      });

      return;
    }

    const tl = gsap.timeline();

    // Page enters under the transition
    tl.set(transition, {
      transformOrigin: "left center",
      scaleX: 0,
    })
      .to(transition, {
        scaleX: 1,
        duration: 0.45,
        ease: "power4.inOut",
      })
      .set(page, {
        opacity: 0,
        y: 20,
      })
      .to(
        page,
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: "power2.out",
        },
        "-=0.05"
      )
      .to(transition, {
        scaleX: 0,
        duration: 0.55,
        ease: "power4.inOut",
        transformOrigin: "right center",
      });

    return () => {
      tl.kill();
    };
  }, [location.pathname]);

  return (
    <>
      <div ref={pageRef}>{children}</div>

      <div
        ref={transitionRef}
        className="fixed inset-0 z-[9999] bg-black pointer-events-none origin-left"
      />
    </>
  );
};

export default PageTransition;