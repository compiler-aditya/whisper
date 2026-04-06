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
    }, 400);
  };

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-30">
      {/* Backdrop — no blur, just darkness */}
      <div
        className={`absolute inset-0 transition-opacity duration-400 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        style={{ background: "rgba(5,5,5,0.7)" }}
        onClick={handleClose}
      />

      {/* Sheet — sharp top edge, no rounded corners */}
      <div
        className={`
          absolute bottom-0 left-0 right-0
          max-h-[88vh] overflow-y-auto
          safe-bottom scrollbar-thin
          ${isClosing ? "translate-y-full" : "animate-slide-up"}
          transition-transform duration-400 ease-out
        `}
        style={{
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
        }}
      >
        {/* Drag handle */}
        <div
          className="sticky top-0 z-10 flex justify-center pt-4 pb-2 cursor-pointer"
          style={{ background: "var(--surface)" }}
          onClick={handleClose}
        >
          <div
            className="w-8 h-[2px] rounded-full transition-colors"
            style={{ background: "var(--text-muted)" }}
          />
        </div>

        {/* Content */}
        <div className="px-6 pb-10 pt-2">{children}</div>
      </div>
    </div>
  );
}
