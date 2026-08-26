import React from "react";
import { Link } from "react-router-dom";

const Menubar: React.FC = () => {
  const menus = [
    { label: "Collections", path: "/collection" },
    { label: "Frames", path: "/frames" },
    { label: "Split Posters", path: "/split-posters" },
    { label: "Customize", path: "/customize" },
    { label: "Buy in Bulk", path: "/bulk" },
    { label: "About Us", path: "/about" },
    { label: "Reviews", path: "/reviews" },
    { label: "Help Center", path: "/help" },
  ];

  return (
    <div className="fixed top-[72px] left-0 right-0 z-[90] border-b border-z-border/20 bg-z-paper/95 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-center gap-6 overflow-x-auto px-6 py-2 scrollbar-hide">
        {menus.map((menu) => (
          <Link key={menu.label} to={menu.path} className="shrink-0 whitespace-nowrap px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-z-muted transition-colors hover:bg-z-ink hover:text-z-paper">
            {menu.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Menubar;