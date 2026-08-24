import React from 'react';

/**
 * A "paper clip" style tag component that displays labels (like A3, A4)
 * with a brutalist archival aesthetic.
 */
export default function PaperClip({ label }: { label: string }) {
  return (
    <div className="relative inline-flex flex-col items-center group/clip">
      {/* The wire clip part - visual representation of a bent metal clip */}
      <div className="w-5 h-12 border-[2.5px] border-z-ink rounded-full absolute -top-8 left-1/2 -translate-x-1/2 z-40 bg-white/10 backdrop-blur-[2px] pointer-events-none transition-all duration-300 group-hover/clip:-translate-y-1">
        {/* Inner loop of the clip */}
        <div className="w-2.5 h-8 border-[1.5px] border-z-ink rounded-full absolute top-1 left-1/2 -translate-x-1/2"></div>
      </div>
      
      {/* The hanging tag */}
      <div className="bg-z-paper border-2 border-z-border px-3 py-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] relative z-30 group-hover/clip:shadow-none group-hover/clip:translate-x-[2px] group-hover/clip:translate-y-[2px] transition-all">
        {/* The "hole" for the clip */}
        <div className="w-2 h-2 bg-z-ink rounded-full mx-auto mb-2 shadow-inner"></div>
        <span className="font-mono text-[14px] font-black uppercase tracking-tighter block text-center leading-none text-z-ink">
          {label}
        </span>
      </div>
    </div>
  );
}
