
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, MessageCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

import Logo from './Logo';

const menuItems = [
  { name: 'Frames', path: '/frames' },
  { name: 'Split Posters', path: '/split-posters' },
  { name: 'Metalic Posters', path: '/metalic-posters' },
  { name: 'Customize', path: '/customize' },
  { name: 'Buy in Bulk', path: '/bulk-inquiry' },
  { name: 'Reviews', path: '/reviews' },
  { name: 'Help Center', path: '/help' },
];



export default function Footer() {
  const { theme } = useTheme();

  const instagramUrl = import.meta.env.VITE_INSTAGRAM_URL;
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER;

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}`
    : '#';

  return (
    <>
      <footer className="bg-z-paper border-t-2 border-z-border pt-12 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6">
        <div className="max-w-[1440px] mx-auto">

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 sm:gap-16 mb-12 sm:mb-24 uppercase font-bold">

            {/* BRAND */}
            <div className="md:col-span-2">
              <Link
                to="/"
                className="inline-block mb-10 hover:opacity-80 transition-opacity"
              >
                <Logo size="footer" />
              </Link>

              <p className="text-z-muted max-w-sm leading-relaxed text-sm mb-10 font-mono tracking-tight font-bold">
                Curated poster prints for your walls — Anime, Movies, Music,
                Minimal & more.
              </p>

              {/* SOCIALS */}
              <div className="flex items-center gap-6 text-z-ink">

                {/* Instagram */}
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="hover:text-z-accent transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}

                {/* WhatsApp */}
                {whatsappNumber && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    className="hover:text-z-accent transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </a>
                )}

              </div>
            </div>

            {/* QUICK LINKS */}
            <div>
              <h4 className="text-[14px] font-display font-black tracking-widest text-z-ink mb-10 border-b-2 border-z-border inline-block pb-1  ">
                QUICK LINKS
              </h4>

              <ul className="space-y-4 text-sm tracking-widest text-z-muted font-bold">
                {menuItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="hover:text-z-accent transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* SUPPORT */}
            <div>
              <h4 className="text-[14px] font-display font-black tracking-widest text-z-ink mb-10 border-b-2 border-z-border inline-block pb-1  ">
                SUPPORT
              </h4>

              <ul className="space-y-4 text-sm tracking-widest text-z-muted font-bold">
                <li>
                  <Link
                    to="/help#terms"
                    className="hover:text-z-accent transition-colors"
                  >
                    Terms & Conditions
                  </Link>
                </li>

                <li>
                  <Link
                    to="/help#privacy"
                    className="hover:text-z-accent transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>

                <li>
                  <Link
                    to="/help#shipping-policy"
                    className="hover:text-z-accent transition-colors"
                  >
                    Shipping Policy
                  </Link>
                </li>

                <li>
                  <Link
                    to="/help#return-policy"
                    className="hover:text-z-accent transition-colors"
                  >
                    Returns & Refunds
                  </Link>
                </li>

                <li>
                  <Link
                    to="/help#cancellation"
                    className="hover:text-z-accent transition-colors"
                  >
                    Cancellation Policy
                  </Link>
                </li>
              </ul>
            </div>

          </div>

          {/* COPYRIGHT */}
          <div className="border-t-2 border-z-border pt-12 flex flex-col md:flex-row justify-between items-center text-z-muted font-mono text-[12px] tracking-[0.2em] font-bold">
            <p className="mb-6 md:mb-0">
              © {new Date().getFullYear()} — POSTER THEORY ARCHIVE SYSTEMS.
              ALL RIGHTS RESERVED.
            </p>
          </div>

        </div>
      </footer>

      {/* DISCLAIMER */}
      <div className="bg-orange-500 text-white py-5 px-6">
        <div className="max-w-[1440px] mx-auto text-center space-y-2">

          <p className="text-[11px] sm:text-[12px] font-mono leading-relaxed text-z-paper/80">
            The posters featured on this platform include fan-made artwork,
            AI-assisted designs, and original creations. None of the artwork
            claims affiliation with or endorsement by any brand, studio, or
            artist unless explicitly stated. For concerns or takedown requests,
            reach out to{' '}
            <a
              href="mailto:support@postertheory.in"
              className="underline font-bold text-z-paper hover:text-z-paper/60 transition-colors"
            >
              support@postertheory.in
            </a>
          </p>

          <p className="text-[10px] font-mono text-z-paper/50">
            © {new Date().getFullYear()} Poster Theory — All rights reserved.
          </p>

        </div>
      </div>
    </>
  );}
