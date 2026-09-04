import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingBag, User, Menu, X, ChevronDown, LogOut, LayoutDashboard, UserCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Logo from "./Logo";
import api from "../lib/api";

/* =========================================================
   TYPES
========================================================= */

interface Collection {
  name: string;
  path: string;
  img?: string;
  is_active?: boolean;
}

interface AuthUser {
  name?: string;
  email?: string;
  role?: string; // "admin" unlocks the Admin Panel link in the dropdown
}

interface NavbarProps {
  cartCount?: number;
}

// fallback so the nav never renders empty while the real list loads / if the request fails
const TEMP_COLLECTIONS: Collection[] = [
  { name: "Anime", path: "/collection?collection=Anime" },
  { name: "Movies", path: "/collection?collection=Movies" },
  { name: "Music", path: "/collection?collection=Music" },
  { name: "Minimal", path: "/collection?collection=Minimal" },
  { name: "Typography", path: "/collection?collection=Typography" },
];

export default function Navbar({ cartCount = 0 }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [collections, setCollections] = useState<Collection[]>(TEMP_COLLECTIONS);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  // auth state — `authChecked` avoids flashing "guest" UI before the request resolves
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const isAdmin = user?.role === "admin";

  const searchRef = useRef<HTMLInputElement>(null);
  const collectionsRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  /* =========================================================
     COLLECTIONS — pulled from the backend
  ========================================================= */
  useEffect(() => {
    api
      .get("/api/products/collections")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setCollections(
          data.map((c: any) => ({
            name: c.name,
            path: `/collection?collection=${c.name}`,
            is_active: c.is_active,
          }))
        );
      })
      .catch((err) => {
        console.error("Failed to fetch collections:", err);
        // TEMP_COLLECTIONS stays as the fallback
      });
  }, []);

  /* =========================================================
     AUTH — who's logged in, and are they an admin
     NOTE: assumes GET /api/auth/me returns the current user
     (401/error = guest) and POST /api/auth/logout logs out.
     Swap these paths for your actual auth routes if different.
  ========================================================= */
  useEffect(() => {
    api
  .get("/api/auth/me")
  .then((res) => setUser(res.data?.user || null))
  .catch(() => setUser(null))
  .finally(() => setAuthChecked(true));
  }, []);

  const handleLogout = () => {
    api.post("/api/auth/logout").catch(() => {});
    setUser(null);
    setUserMenuOpen(false);
    setMobileOpen(false);
  };

  /* =========================================================
     SCROLL STATE
  ========================================================= */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 100);
  }, [searchOpen]);

  /* =========================================================
     CLICK OUTSIDE — closes whichever dropdown is open
  ========================================================= */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (collectionsRef.current && !collectionsRef.current.contains(e.target as Node)) setCollectionsOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { name: "Frames", path: "/frames" },
    { name: "Split Posters", path: "/split-posters" },
    { name: "Metalic Posters", path: "/metalic-posters" },
    { name: "Customize", path: "/customize" },
    { name: "Buy in Bulk", path: "/bulk-inquiry" },
    { name: "Reviews", path: "/reviews" },
    { name: "Help Center", path: "/help" },
  ];

  // shared dropdown entrance — brutalist: quick, hard snap rather than a soft ease
  const dropdownMotion = {
    initial: { opacity: 0, y: 8, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 8, scale: 0.98 },
    transition: { duration: 0.16, ease: [0.16, 1, 0.3, 1] as const },
  };

  // shared classes for every flat, sharp-edged dropdown row (collections + user menu)
  const dropdownRow = "group/item flex items-center justify-between gap-2 px-4 py-3 border-l-2 border-transparent text-[10px] font-mono font-bold uppercase tracking-widest text-white/60 hover:text-white hover:border-white hover:bg-white/5 transition-all";

  return (
    <>
   
      <header className={`fixed border-dashed border-b border-white top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? "bg-black/95 backdrop-blur-xl border-b-0" : "bg-black "}`}>
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 ">
          <div className="h-[80px] flex items-center justify-between relative">

            {/* LEFT — LOGO */}
            <div className="flex items-center shrink-0">
              <Link to="/" className="block hover:opacity-80 transition-opacity">
                <Logo size="nav" />
              </Link>
            </div>

            {/* CENTER — DESKTOP MENU */}
            <nav className="hidden xl:flex items-center justify-center gap-5 2xl:gap-7 absolute left-1/2 -translate-x-1/2">

              {/* COLLECTIONS DROPDOWN */}
              <div ref={collectionsRef} className="relative" onMouseEnter={() => setHoveredNav("collections")} onMouseLeave={() => setHoveredNav(null)}>
                <button onClick={() => setCollectionsOpen((v) => !v)} className="relative flex items-center gap-1 py-2 text-[10px] 2xl:text-[11px] font-mono font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors whitespace-nowrap">
                  Collections
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${collectionsOpen ? "rotate-180" : ""}`} />
                  {hoveredNav === "collections" && <motion.span layoutId="nav-hover-underline" className="absolute left-0 right-0 -bottom-1 h-[2px] bg-white" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                </button>

                <AnimatePresence>
                  {collectionsOpen && (
                    <motion.div {...dropdownMotion} className="absolute top-full left-1/2 -translate-x-1/2 mt-5 w-52 bg-black border-2 border-white/15 shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] p-2">
                      {collections.filter((c) => c.is_active !== false).map((collection, i) => (
                        <motion.div key={collection.name} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03, duration: 0.15 }}>
                          <Link to={collection.path} onClick={() => setCollectionsOpen(false)} className={dropdownRow}>
                            <span className="group-hover/item:translate-x-1 transition-transform">{collection.name}</span>
                            <span className="opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all">→</span>
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* MAIN LINKS — shared sliding underline on hover */}
              {menuItems.map((item) => (
                <div key={item.name} className="relative" onMouseEnter={() => setHoveredNav(item.name)} onMouseLeave={() => setHoveredNav(null)}>
                  <Link to={item.path} className="relative block py-2 text-[10px] 2xl:text-[11px] font-mono font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors whitespace-nowrap">
                    {item.name}
                    {hoveredNav === item.name && <motion.span layoutId="nav-hover-underline" className="absolute left-0 right-0 -bottom-1 h-[2px] bg-white" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                  </Link>
                </div>
              ))}
            </nav>

            {/* RIGHT — ACTIONS */}
            <div className="flex items-center gap-2 sm:gap-3 ml-auto shrink-0">

              {/* SEARCH */}
              <motion.div layout className="flex items-center">
                <AnimatePresence mode="wait">
                  {searchOpen ? (
                    <motion.div initial={{ width: 40, opacity: 0 }} animate={{ width: 190, opacity: 1 }} exit={{ width: 40, opacity: 0 }} transition={{ duration: 0.25 }} className="h-9 flex items-center border border-white/20 bg-white/5">
                      <Search className="w-4 h-4 text-white/50 ml-3 shrink-0" />
                      <input ref={searchRef} type="text" placeholder="SEARCH..." className="w-full bg-transparent outline-none border-none px-2 text-[10px] font-mono uppercase tracking-widest text-white placeholder:text-white/30" />
                      <button onClick={() => setSearchOpen(false)} className="mr-2 text-white/50 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setSearchOpen(true)} aria-label="Search" className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                      <Search className="w-[18px] h-[18px]" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* CART */}
              <Link to="/cart" aria-label="Shopping cart" className="relative w-9 h-9 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                <ShoppingBag className="w-[18px] h-[18px]" />
                {cartCount > 0 && <span className="absolute top-0 right-0 min-w-[15px] h-[15px] px-1 flex items-center justify-center bg-white text-black text-[8px] font-mono font-bold rounded-full">{cartCount}</span>}
              </Link>

              {/* USER — auth-aware dropdown: guest -> login/signup, user -> profile, admin -> profile + admin panel */}
              <div ref={userRef} className="relative hidden sm:block">
                <button onClick={() => setUserMenuOpen((v) => !v)} aria-label="Account" className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                  <User className="w-[18px] h-[18px]" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div {...dropdownMotion} className="absolute top-full right-0 mt-5 w-48 bg-black border-2 border-white/15 shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] p-2">
                      {!authChecked ? (
                        <div className="px-4 py-3 text-[10px] font-mono uppercase tracking-widest text-white/40">Loading...</div>
                      ) : user ? (
                        <>
                          <div className="px-4 pt-2 pb-3 mb-1 border-b border-white/10 text-[9px] font-mono uppercase tracking-widest text-white/40 truncate">{user.name || user.email || "Account"}</div>

                          {isAdmin && (
                            <Link to="/admin" onClick={() => setUserMenuOpen(false)} className={dropdownRow}>
                              <span className="flex items-center gap-2 group-hover/item:translate-x-1 transition-transform"><LayoutDashboard className="w-3.5 h-3.5" />Admin Panel</span>
                            </Link>
                          )}

                          <Link to="/profile" onClick={() => setUserMenuOpen(false)} className={dropdownRow}>
                            <span className="flex items-center gap-2 group-hover/item:translate-x-1 transition-transform"><UserCircle className="w-3.5 h-3.5" />Profile</span>
                          </Link>

                          <button onClick={handleLogout} className={`w-full ${dropdownRow}`}>
                            <span className="flex items-center gap-2 group-hover/item:translate-x-1 transition-transform"><LogOut className="w-3.5 h-3.5" />Logout</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <Link to="/login" onClick={() => setUserMenuOpen(false)} className={dropdownRow}>
                            <span className="group-hover/item:translate-x-1 transition-transform">Login</span>
                            <span className="opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all">→</span>
                          </Link>
                          <Link to="/signup" onClick={() => setUserMenuOpen(false)} className={dropdownRow}>
                            <span className="group-hover/item:translate-x-1 transition-transform">Sign Up</span>
                            <span className="opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all">→</span>
                          </Link>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* MOBILE MENU TOGGLE */}
              <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu" className="xl:hidden w-9 h-9 flex items-center justify-center text-white/80 hover:text-white transition-colors">
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="xl:hidden overflow-hidden border-t border-white/10 bg-black">
              <nav className="px-5 py-5 space-y-1">

                {/* MOBILE COLLECTIONS */}
                <button onClick={() => setCollectionsOpen(!collectionsOpen)} className="w-full flex items-center justify-between py-3 text-left text-[11px] font-mono font-bold uppercase tracking-widest text-white/70 hover:text-white">
                  <span>Collections</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${collectionsOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {collectionsOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pl-4 border-l border-white/10">
                      {collections.filter((c) => c.is_active !== false).map((collection) => (
                        <Link key={collection.name} to={collection.path} onClick={() => { setCollectionsOpen(false); setMobileOpen(false); }} className="block py-2 text-[10px] font-mono uppercase tracking-widest text-white/40 hover:text-white">
                          {collection.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {menuItems.map((item) => (
                  <Link key={item.name} to={item.path} onClick={() => setMobileOpen(false)} className="block py-3 text-[11px] font-mono font-bold uppercase tracking-widest text-white/70 hover:text-white border-b border-white/5">
                    {item.name}
                  </Link>
                ))}

                {/* MOBILE ACCOUNT — same auth rules as the desktop dropdown */}
                <div className="pt-3 mt-3 border-t border-white/10 space-y-1">
                  {user ? (
                    <>
                      {isAdmin && <Link to="/admin" onClick={() => setMobileOpen(false)} className="block py-3 text-[11px] font-mono font-bold uppercase tracking-widest text-white/70 hover:text-white">Admin Panel</Link>}
                      <Link to="/profile" onClick={() => setMobileOpen(false)} className="block py-3 text-[11px] font-mono font-bold uppercase tracking-widest text-white/70 hover:text-white">Profile</Link>
                      <button onClick={handleLogout} className="w-full text-left py-3 text-[11px] font-mono font-bold uppercase tracking-widest text-white/70 hover:text-white">Logout</button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setMobileOpen(false)} className="block py-3 text-[11px] font-mono font-bold uppercase tracking-widest text-white/70 hover:text-white">Login</Link>
                      <Link to="/signup" onClick={() => setMobileOpen(false)} className="block py-3 text-[11px] font-mono font-bold uppercase tracking-widest text-white/70 hover:text-white">Sign Up</Link>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    
    </>
  );
}