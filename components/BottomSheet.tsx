"use client";

import { useState, useEffect } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setIsClosing(false);
    }
  }, [open]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setMounted(false);
      onClose();
    }, 300);
  };

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-30">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className={`
          absolute bottom-0 left-0 right-0
          bg-gradient-to-b from-gray-900/95 to-black/98
          backdrop-blur-xl
          rounded-t-[28px]
          max-h-[85vh] overflow-y-auto
          shadow-[0_-10px_40px_rgba(0,0,0,0.5)]
          safe-bottom
          scrollbar-thin
          ${isClosing ? "translate-y-full" : "animate-slide-up"}
          transition-transform duration-300 ease-out
        `}
      >
        {/* Drag handle */}
        <div
          className="sticky top-0 z-10 flex justify-center pt-3 pb-1 cursor-pointer bg-gradient-to-b from-gray-900/95 to-transparent"
          onClick={handleClose}
        >
          <div className="w-9 h-1 bg-white/20 rounded-full hover:bg-white/40 transition-colors" />
        </div>

        {/* Content */}
        <div className="px-5 pb-8 pt-1">{children}</div>
      </div>
    </div>
  );
}
