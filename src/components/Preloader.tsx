import React from "react";
import preloaderGif from "../assets/gif.gif";

interface PreloaderProps {
  isLoading: boolean;
}

const Preloader: React.FC<PreloaderProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
      <img
        src={preloaderGif}
        alt="Loading..."
        className="w-24 h-24 object-contain"
      />
    </div>
  );
};

export default Preloader;