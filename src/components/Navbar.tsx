import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, ArrowRight, ShieldCheck, LogOut, Sun, Moon, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import api from '../lib/api';

import Logo from './Logo';

// Secondary navigation items — each links to its own route via React Router
const secondaryNavItems = [
  { label: 'Collections', path: '/collection' },
  { label: 'Frames', path: '/frames' },
  { label: 'Split Posters', path: '/split-posters' },
  { label: 'Customize', path: '/customize' },
  { label: 'Buy in Bulk', path: '/bulk' },
  { label: 'About Us', path: '/about' },
  { label: 'Reviews', path: '/reviews' },
  { label: 'Help Center', path: '/help' },
];

const collections = [
  { name: "Anime", path: "/collection/anime" },
  { name: "Movies", path: "/collection/movies" },
  { name: "Music", path: "/collection/music" },
  { name: "Minimal", path: "/collection/minimal" },
  { name: "Sports", path: "/collection/sports" },
  { name: "Gaming", path: "/collection/gaming" },
  { name: "Typography", path: "/collection/typography" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchProducts, setSearchProducts] = useState<any[]>([]);
  const [showSearchDrop, setShowSearchDrop] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLFormElement>(null);
  const collectionsRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const hideSearch = ['/admin', '/customize', '/story'].includes(location.pathname);

  const [scrolled, setScrolled] = useState(false);
  // Controls whether the main navbar is shown (slides up/hides on scroll-down, returns on scroll-up)
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Scroll-direction detection: hides the main navbar on scroll-down, reveals it on scroll-up,
  // and always restores it near the top of the page. Passive listener, cleaned up on unmount.
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setScrolled(currentScrollY > 50);

      if (currentScrollY <= 30) {
        setShowNavbar(true);
      } else if (currentScrollY < lastScrollY) {
        setShowNavbar(true);
      } else {
        setShowNavbar(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Fetch products once for autocomplete
  useEffect(() => {
    if (!hideSearch && searchProducts.length === 0) {
      api.get('/api/products?limit=100').then(res => {
        setSearchProducts(Array.isArray(res.data) ? res.data : []);
      }).catch(() => {});
    }
  }, [hideSearch]);

  // Fetch collections for dropdown
  useEffect(() => {
    api.get('/api/products/collections').then(res => {
      setCollections(Array.isArray(res.data) ? res.data : []);
    }).catch(() => {});
  }, []);

  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: { label: string; type: string }[] = [];
    const seen = new Set<string>();

    if (q.startsWith('#')) {
      const tag = q.slice(1);
      if (!tag) return [];
      for (const p of searchProducts) {
        for (const t of (p.tags || [])) {
          if (t.toLowerCase().includes(tag) && !seen.has(t.toLowerCase())) {
            seen.add(t.toLowerCase());
            results.push({ label: t, type: '#tag' });
            if (results.length >= 15) return results;
          }
        }
      }
    } else {
      for (const p of searchProducts) {
        if (p.title?.toLowerCase().includes(q) && !seen.has(p.title.toLowerCase())) {
          seen.add(p.title.toLowerCase());
          results.push({ label: p.title, type: 'title' });
          if (results.length >= 15) return results;
        }
      }
      // Also suggest matching tags
      for (const p of searchProducts) {
        for (const t of (p.tags || [])) {
          if (t.toLowerCase().includes(q) && !seen.has(`#${t.toLowerCase()}`)) {
            seen.add(`#${t.toLowerCase()}`);
            results.push({ label: t, type: '#tag' });
            if (results.length >= 15) return results;
          }
        }
      }
    }
    return results;
  }, [searchQuery, searchProducts]);

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearchDrop(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      if (q.startsWith('#')) {
        navigate(`/collection?tag=${encodeURIComponent(q.slice(1))}`);
      } else {
        navigate(`/collection?q=${encodeURIComponent(q)}`);
      }
      setSearchQuery('');
      setShowSearchDrop(false);
    }
  };

  const selectSuggestion = (s: { label: string; type: string }) => {
    if (s.type === '#tag') {
      navigate(`/collection?tag=${encodeURIComponent(s.label)}`);
    } else {
      navigate(`/collection?q=${encodeURIComponent(s.label)}`);
    }
    setSearchQuery('');
    setShowSearchDrop(false);
  };

  const navLinks = [
    { name: 'Collections', path: '/collection' },
    { name: 'Frames', path: '/frames' },
    { name: 'Customize', path: '/customize' },
    { name: 'Help & Support', path: '/help' },
  ];

  // Close menus on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* MAIN NAVBAR — unchanged positioning/dimensions/logo, now slides away on scroll-down */}
      <nav className={`fixed top-0 left-0 w-full z-[100] bg-black text-white border-b border-white/10 backdrop-blur-md transition-transform duration-300 ease-in-out ${showNavbar ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="relative max-w-[1440px] mx-auto h-16 sm:h-24 px-4 sm:px-6">
          {/* LEFT NAVIGATION */}
          {/* <div className="hidden lg:flex absolute left-0 top-0 h-full ">
            <div className="flex items-center gap-4 text-[13px] uppercase  font-black text-z-paper">
              <div
                className="relative"
                ref={collectionsRef}
                onMouseEnter={() => setCollectionsOpen(true)}
                onMouseLeave={() => setCollectionsOpen(false)}
              >
                <Link
                  to="/collection"
                  className="inline-block px-3 py-1 hover:bg-z-paper hover:text-z-ink transition-all"
                >
                  Collections
                </Link>

                <AnimatePresence>
                  {collectionsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-48 text-z-ink bg-z-paper border-2 border-z-border shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] z-[110]"
                    >
                      <Link
                        to="/collection"
                        onClick={() => setCollectionsOpen(false)}
                        className="block px-4 py-2.5 text-[11px] font-mono font-black uppercase tracking-widest hover:bg-z-ink hover:text-z-paper transition-colors border-b border-z-border/10"
                      >
                        All
                      </Link>

                      {collections.map(c => (
                        <Link
                          key={c.id}
                          to={`/collection?collection=${encodeURIComponent(c.name)}`}
                          onClick={() => setCollectionsOpen(false)}
                          className="block px-4 py-2.5 text-[11px] font-mono font-bold uppercase tracking-widest hover:bg-z-ink hover:text-z-paper transition-colors border-b border-z-border/10 last:border-0"
                        >
                          {c.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            
              <Link
                to="/frames"
                className="px-3 py-1 hover:bg-z-paper hover:text-z-ink transition-all"
              >
                Frames
              </Link>

              <Link
                to="/customize"
                className="px-3 py-1  hover:bg-z-paper hover:text-z-ink transition-all"
              >
                Customize
              </Link>
              <Link
                to="/frames"
                className="px-3 py-1 hover:bg-z-paper hover:text-z-ink transition-all"
              >
                Split Posters
              </Link>

              <Link
                to="/help"
                className="px-3 py-1  hover:bg-z-paper hover:text-z-ink transition-all"
              >
                Buy in bulk 
              </Link>

            </div>
          </div> */}


          {/* CENTER LOGO */}
    
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
        <Link
          to="/"
          className="block hover:opacity-80 transition-opacity"
        >
          <span className="lg:hidden ">
            <Logo size="md" />
          </span>

          <span className="hidden lg:block">
            <Logo size="nav" />
          </span>
        </Link>
      </div>

          {/* RIGHT SIDE */}
          <div className="hidden lg:flex absolute right-6 top-0 h-full items-center gap-10">
            {/* Search */}
            {!hideSearch && (
              <form
                onSubmit={handleSearch}
                className="relative group"
                ref={searchRef}
              >
                <input
                  type="text"
                  placeholder="SEARCH OR #TAG..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchDrop(true);
                  }}
                  onFocus={() => setShowSearchDrop(true)}
                  className="bg-z-ink border-2 border-z-paper px-4 py-1.5 pl-10 text-[12px] font-mono font-bold uppercase tracking-widest focus:outline-none focus:border-z-ink transition-all w-48 focus:w-64 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] "
                />

                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-z-paper" />

                {showSearchDrop && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-z-paper border-2 border-z-border shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] z-[110] max-h-64 overflow-y-auto">
                    {searchSuggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => selectSuggestion(s)}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-[11px] font-mono hover:bg-z-ink hover:text-z-paper transition-colors border-b border-z-border/10 last:border-0"
                      >
                        <span className="font-bold truncate">
                          {s.type === '#tag' ? `#${s.label}` : s.label}
                        </span>

                        <span className="text-[8px] font-black uppercase opacity-50 shrink-0 ml-3">
                          {s.type}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </form>
            )}



            {/* CART */}
            <Link
              to="/cart"
              className="flex items-center gap-2 text-z-ink group"
            >
              <motion.div
                key={totalQuantity}
                initial={{ scale: 1 }}
                animate={totalQuantity > 0 ? { scale: [1, 1.2, 1] } : {}}
                className="bg-z-paper border-2 border-z-border p-2 group-hover:bg-z-ink hover:border-z-paper group-hover:text-white transition-all shadow-[4px_4px_0px_0px_var(--color-z-shadow)] group-hover:shadow-none"
              >
                <ShoppingBag className="w-4 h-4" />
              </motion.div>

              <span className="font-display text-z-paper font-bold text-[15px]">
                / {totalQuantity}
              </span>
            </Link>


            {/* USER */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center text-z-ink group"
              >
                <div className={`border-2 border-z-border p-2 hover:border-z-paper transition-all shadow-[4px_4px_0px_0px_var(--color-z-shadow)] hover:shadow-none ${userMenuOpen ? 'bg-z-ink text-z-paper' : 'bg-z-paper hover:bg-z-ink hover:text-z-paper'}`}>
                  <User className="w-4 h-4" />
                </div>
              </button>

                  {/* User Dropdown Menu */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-6 w-56 bg-z-paper text-z-ink border-2 border-z-border shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.2)] p-4 z-50"
                      >
                        <div className="space-y-2">
                          {user ? (
                            <>
                              <div className="pb-4 border-b-2 border-z-border mb-4">
                                <p className="text-[11px] font-mono font-bold text-z-muted uppercase tracking-widest mb-1">Signed in as</p>
                                <p className="text-sm font-display font-black truncate uppercase tracking-tighter">{user.email}</p>
                              </div>
                              <Link 
                                to="/dashboard" 
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center space-x-3 w-full px-4 py-3 text-[12px] font-mono font-bold uppercase tracking-widest hover:bg-z-ink hover:text-white transition-all"
                              >
                                <ShieldCheck className="w-4 h-4" />
                                <span>My_Dashboard</span>
                              </Link>
                              {user.is_admin && (
                              <Link 
                                to="/admin" 
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center space-x-3 w-full px-4 py-3 text-[12px] font-mono font-bold uppercase tracking-widest hover:bg-z-ink hover:text-white transition-all"
                              >
                                <ArrowRight className="w-4 h-4" />
                                <span>Admin Panel</span>
                              </Link>
                              )}
                              <button 
                                onClick={() => { logout(); navigate('/'); setUserMenuOpen(false); }}
                                className="flex items-center space-x-3 w-full px-4 py-3 text-[12px] font-mono font-bold uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all"
                              >
                                <LogOut className="w-4 h-4" />
                                <span>Sign Out</span>
                              </button>
                            </>
                          ) : (
                            <>
                    <Link 
                                to="/login" 
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center justify-between w-full px-4 py-3 text-[12px] font-mono font-bold uppercase tracking-widest bg-z-ink text-z-paper hover:bg-z-paper hover:text-z-ink border-2 border-z-ink transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"
                              >
                                <span>Sign_In_</span>
                                <ArrowRight className="w-4 h-4" />
                              </Link>
                              <Link 
                                to="/signup" 
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center justify-between w-full px-4 py-3 text-[12px] font-mono font-bold uppercase tracking-widest border-2 border-z-border hover:bg-z-ink hover:text-z-paper transition-all"
                              >
                                <span>New_Identity_</span>
                              </Link>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Mobile menu and Cart button */}
              <div className="lg:hidden flex items-center space-x-4">
                {/* Theme toggle — disabled for now
                <button 
                  onClick={toggleTheme}
                  className="p-2 border-2 border-z-border bg-z-paper text-z-ink hover:bg-z-ink hover:text-z-paper transition-all shadow-[2px_2px_0px_0px_var(--color-z-shadow)]"
                >
                  {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
                */}

                <Link to="/cart" className="relative group">
                  <motion.div 
                    key={totalQuantity}
                    animate={totalQuantity > 0 ? { scale: [1, 1.3, 1] } : {}}
                    className="bg-z-paper border-2 border-z-border p-2 shadow-[2px_2px_0px_0px_var(--color-z-shadow)] lg:my-0 my-3 "
                  >
                    <ShoppingBag className="w-4 h-4 text-z-ink" />
                  </motion.div>
                  {totalQuantity > 0 && (
                    <span className="absolute -top-1 -right-1 bg-z-ink text-z-paper text-[8px] font-bold w-4 h-4 flex items-center justify-center border border-z-paper">
                      {totalQuantity}
                    </span>
                  )}
                </Link>
                <button 
                  onClick={() => setIsOpen(!isOpen)} 
                  className={`p-2 border-2 transition-all shadow-[2px_2px_0px_0px_var(--color-z-shadow)] ${isOpen ? 'bg-z-ink text-z-paper border-z-ink shadow-none translate-x-[1px] translate-y-[1px]' : 'bg-z-paper text-z-ink border-z-border'}`}
                >
                  {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="lg:hidden bg-z-paper border-t-2 border-z-border overflow-hidden"
                >
                  <div className="px-6 py-8 space-y-6">
                    <div className="space-y-4">
                      <p className="text-[11px] font-mono font-black text-z-muted uppercase tracking-[0.4em]">DIRECTORY_</p>
                      {navLinks.map((link) => (
                        <Link
                          key={link.name}
                          to={link.path}
                          className="block font-display font-black text-3xl sm:text-5xl uppercase tracking-tighter hover:text-outline transition-all"
                          onClick={() => setIsOpen(false)}
                        >
                          {link.name}
                        </Link>
                      ))}
                    </div>

                    <div className="pt-10 border-t-2 border-z-border space-y-8">
                      <p className="text-[11px] font-mono font-black text-z-muted uppercase tracking-[0.4em]">IDENTITY_GATE_</p>
                      {user ? (
                        <div className="flex flex-col space-y-4">
                          <Link 
                            to="/dashboard" 
                            className="flex items-center justify-between p-4 border-2 border-z-border font-display font-black uppercase italic"
                            onClick={() => setIsOpen(false)}
                          >
                            Dashboard <ArrowRight className="w-5 h-5" />
                          </Link>
                          {user.is_admin && (
                            <Link 
                              to="/admin" 
                              className="flex items-center justify-between p-4 border-2 border-[#ff4d00] text-[#ff4d00] font-display font-black uppercase italic"
                              onClick={() => setIsOpen(false)}
                            >
                              Admin Panel <ShieldCheck className="w-5 h-5" />
                            </Link>
                          )}
                          <button 
                            onClick={() => { logout(); navigate('/'); setIsOpen(false); }}
                            className="flex items-center justify-between p-4 border-2 border-red-500 text-red-500 font-display font-black uppercase italic"
                          >
                            Logout <LogOut className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          <Link 
                            to="/login" 
                            className="p-4 bg-z-ink text-z-paper text-center font-display font-black uppercase tracking-tighter shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
                            onClick={() => setIsOpen(false)}
                          >
                            SIGN_IN_
                          </Link>
                          <Link 
                            to="/signup" 
                            className="p-4 border-2 border-z-border text-z-ink text-center font-display font-black uppercase tracking-tighter"
                            onClick={() => setIsOpen(false)}
                          >
                            JOIN_
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>

      {/* SECONDARY NAVIGATION MENU — sits under the main navbar at top, then snaps to the viewport
          top once the main navbar has slid away. Same transition duration keeps both layers in sync. */}
      <div className={`fixed left-0 w-full z-[90] bg-black text-white border-b border-white/10 transition-[top] duration-300 ease-in-out ${showNavbar ? 'top-16 sm:top-24' : 'top-0'}`}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center gap-6 overflow-x-auto scrollbar-hide h-10 sm:h-11 whitespace-nowrap">
            {secondaryNavItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`relative shrink-0 text-[11px] font-black font-bold uppercase tracking-widest text-z-paper p-4 hover:bg-z-paper hover:text-z-ink ${isActive ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                >
                  {item.label}

                  {isActive && (
                    <span className="absolute -bottom-[13px] sm:-bottom-[15px] left-0 right-0 h-[2px] bg-white" />
                  )}
                </Link>

                
              );
            })}

           <div className="relative" onMouseEnter={() => setCollectionsOpen(true)} onMouseLeave={() => setCollectionsOpen(false)}>
  <button type="button" className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-widest text-z-ink hover:text-z-muted transition-colors">
    Collections
    
  </button>

 
</div>
</div>
        </div>
      </div>
    </>
  );
}