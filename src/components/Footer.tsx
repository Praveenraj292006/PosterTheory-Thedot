import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

import Logo from './Logo';

export default function Footer() {
  const { theme } = useTheme();
  return (
    <>
    <footer className="bg-z-paper border-t-2 border-z-border pt-12 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 sm:gap-16 mb-12 sm:mb-24 uppercase font-bold">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="inline-block mb-10 hover:opacity-80 transition-opacity">
              <Logo size="footer" />
            </Link>
            <p className="text-z-muted max-w-sm leading-relaxed text-sm mb-10 font-mono tracking-tight font-bold">
              Curated poster prints for your walls — Anime, Movies, Music, Minimal & more.
            </p>
            <div className="flex space-x-8 text-z-ink">
              <Instagram className="w-5 h-5 hover:text-outline cursor-pointer transition-all" />
              <Twitter className="w-5 h-5 hover:text-outline cursor-pointer transition-all" />
              <Facebook className="w-5 h-5 hover:text-outline cursor-pointer transition-all" />
            </div>
          </div>

          <div>
            <h4 className="text-[14px] font-display font-black tracking-widest text-z-ink mb-10 border-b-2 border-z-border inline-block pb-1 italic">SUPPORT</h4>
            <ul className="space-y-4 text-sm tracking-widest text-z-muted font-bold">
              <li><Link to="/help#terms" className="hover:text-z-accent transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/help#privacy" className="hover:text-z-accent transition-colors">Privacy Policy</Link></li>
              <li><Link to="/help#shipping-policy" className="hover:text-z-accent transition-colors">Shipping Policy</Link></li>
              <li><Link to="/help#return-policy" className="hover:text-z-accent transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/help#cancellation" className="hover:text-z-accent transition-colors">Cancellation Policy</Link></li>
            </ul>
          </div>

         
        </div>
        
        <div className="border-t-2 border-dash-z-border border-z-border pt-12 flex flex-col md:flex-row justify-between items-center text-z-muted font-mono text-[12px] tracking-[0.2em] font-bold">
          <p className="mb-6 md:mb-0">
            © {new Date().getFullYear()} — POSTER THEORY ARCHIVE SYSTEMS. ALL RIGHTS RESERVED.
          </p>
          <div className="flex space-x-12">
            <a href="/terms" className="hover:text-z-accent transition-colors">TERMS_OF_USE</a>
            <a href="/privacy" className="hover:text-z-accent transition-colors">PRIVACY_PROTOCOL</a>
          </div>
        </div>
      </div>
    </footer>

    {/* Disclaimer */}
    <div className="bg-orange-500 text-white py-5 px-6">
      <div className="max-w-[1440px] mx-auto text-center space-y-2">
        <p className="text-[11px] sm:text-[12px] font-mono leading-relaxed text-z-paper/80">
          The posters featured on this platform include fan-made artwork, AI-assisted designs, and original creations. None of the artwork claims affiliation with or endorsement by any brand, studio, or artist unless explicitly stated. For concerns or takedown requests, reach out to{' '}
          <a href="mailto:support@postertheory.in" className="underline font-bold text-z-paper hover:text-z-paper/60 transition-colors">support@postertheory.in</a>
        </p>
        <p className="text-[10px] font-mono text-z-paper/50">© {new Date().getFullYear()} Poster Theory — All rights reserved.</p>
      </div>
    </div>
    </>
  );
}
