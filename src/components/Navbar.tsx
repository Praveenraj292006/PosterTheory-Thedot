import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingBag, User, Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Logo from "./Logo";
import api from "../lib/api";


interface Collection {
 
  id: number;
  name: string;
  slug: string;
  is_active?: boolean;
}

interface NavbarProps {
  cartCount?: number;
}

const TEMP_COLLECTIONS: Collection[] = [
    { id: 1, name: "Anime", slug: "anime" },
    { id: 2, name: "Movies", slug: "movies" },
    { id: 3, name: "Music", slug: "music" },
    { id: 4, name: "Minimal", slug: "minimal" },
    { id: 5, name: "Typography", slug: "typography" },
  ];

export default function Navbar({ cartCount = 0 }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
 const [collections, setCollections] = useState<Collection[]>(TEMP_COLLECTIONS);
  const [searchOpen, setSearchOpen] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);


  

// useEffect(() => {
//   api.get("/api/collections")
//     .then((res) => {
//       if (Array.isArray(res.data)) {
//         setCollections(res.data);
//       } else {
//         setCollections([]);
//         console.error("Expected array, received:", res.data);
//       }
//     })
//     .catch((err) => {
//       console.error("Failed to fetch collections:", err);
//       setCollections([]);
//     });
// }, []);

  // useEffect(() => {
  // const fetchHomepage = async () => {
  //   try {
  //     const response = await api.get("/api/collections");

  //     const data = response.data;

  //     const collectionData = data.collections || [];

  //     setCollections(
  //       collectionData.map((collection: any) => ({
  //         name: collection.name,
  //         path: collection.path || `/collection/${collection.slug}`,
  //         img: collection.img || collection.image,
  //       }))
  //     );
  //   } catch (error) {
  //     console.error("Failed to load collections:", error);
  //   }
  // };

//   fetchHomepage();
// }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        searchRef.current?.focus();
      }, 100);
    }
  }, [searchOpen]);

  const menuItems = [
    { name: "Frames", path: "/frames" },
    { name: "Split Posters", path: "/split-posters" },
    { name: "Customize", path: "/customize" },
    { name: "Buy in Bulk", path: "/bulk" },
    { name: "About Us", path: "/about" },
    { name: "Reviews", path: "/reviews" },
    { name: "Help Center", path: "/help" },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? "bg-black/95 backdrop-blur-xl border-b border-white/10" : "bg-black border-b border-white/10"}`}>
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-[80px] flex items-center  justify-between relative">

            {/* LEFT — LOGO */}
            <div className="flex items-center shrink-0">
              <Link to="/" className="block hover:opacity-80 transition-opacity">
                <Logo size="nav" />
              </Link>
            </div>

            {/* CENTER — DESKTOP MENU */}
            <nav className="hidden xl:flex items-center justify-center gap-5 2xl:gap-7 absolute left-1/2 -translate-x-1/2">

              {/* COLLECTIONS DROPDOWN */}
              <div className="relative">
                <button onClick={() => setCollectionsOpen(!collectionsOpen)} className="flex items-center gap-1 text-[10px] 2xl:text-[11px] font-mono font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors whitespace-nowrap">
                  Collections
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${collectionsOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {collectionsOpen && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }} className="absolute top-full left-1/2 -translate-x-1/2 mt-5 w-48 bg-black border border-white/15 shadow-2xl p-2">
                     {collections.filter((collection) => collection.is_active !== false).map((collection) => (
                    <Link key={collection.id} to={`/collection/${collection.slug}`} onClick={() => setCollectionsOpen(false)} className="block px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                      {collection.name}
                    </Link>
                  ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {menuItems.map((item) => (
                <Link key={item.name} to={item.path} className="text-[10px] 2xl:text-[11px] font-mono font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors whitespace-nowrap">
                  {item.name}
                </Link>
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
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 min-w-[15px] h-[15px] px-1 flex items-center justify-center bg-white text-black text-[8px] font-mono font-bold rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* USER */}
              <Link to="/account" aria-label="Account" className="hidden sm:flex w-9 h-9 items-center justify-center text-white/70 hover:text-white transition-colors">
                <User className="w-[18px] h-[18px]" />
              </Link>

              {/* MOBILE MENU */}
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
                      {collectionItems.map((item) => (
                        <Link key={item.name} to={item.path} onClick={() => setMobileOpen(false)} className="block py-2 text-[10px] font-mono uppercase tracking-widest text-white/40 hover:text-white">
                          {item.name}
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
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* NAVBAR SPACING */}
      
    </>
  );
}