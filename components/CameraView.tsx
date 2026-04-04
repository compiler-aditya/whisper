"use client";

import { useEffect, useState } from "react";
import { useCamera } from "@/hooks/useCamera";

interface CameraViewProps {
  onCapture: (imageBase64: string) => void;
  disabled?: boolean;
}

export default function CameraView({ onCapture, disabled }: CameraViewProps) {
  const { videoRef, canvasRef, startCamera, captureFrame, ready, error } =
    useCamera();
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    startCamera();
  }, [startCamera]);

  const handleCapture = () => {
    if (disabled || !ready) return;
    const frame = captureFrame();
    if (frame) {
      // Flash effect
      setFlash(true);
      setTimeout(() => setFlash(false), 150);
      onCapture(frame);
    }
  };

  return (
    <div className="relative w-full h-full bg-black">
      {/* Camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera flash effect */}
      {flash && (
        <div className="absolute inset-0 bg-white/20 z-10 pointer-events-none" />
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </div>
            <p className="text-white/60 text-sm">{error}</p>
            <label className="inline-block cursor-pointer bg-white/10 border border-white/20 rounded-full px-6 py-3 text-white text-sm hover:bg-white/20 transition-colors active:scale-95">
              Upload a photo instead
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const base64 = (reader.result as string).split(",")[1];
                    onCapture(base64);
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </label>
          </div>
        </div>
      )}

      {/* Instruction text */}
      {ready && !disabled && (
        <div className="absolute top-12 left-0 right-0 text-center pointer-events-none">
          <p className="text-white/50 text-xs font-light tracking-[0.25em] uppercase animate-pulse">
            Point at anything
          </p>
        </div>
      )}

      {/* Capture button area */}
      {ready && (
        <div className="absolute bottom-0 left-0 right-0 pb-10 pt-6 flex justify-center safe-bottom bg-gradient-to-t from-black/40 to-transparent">
          <button
            onClick={handleCapture}
            disabled={disabled}
            className={`
              relative w-[72px] h-[72px] rounded-full
              border-[3px] border-white/70
              flex items-center justify-center
              transition-all duration-200
              ${disabled
                ? "opacity-30 cursor-not-allowed"
                : "hover:border-white active:scale-90"
              }
            `}
          >
            <div
              className={`
                w-[60px] h-[60px] rounded-full transition-all duration-150
                ${disabled
                  ? "bg-white/15"
                  : "bg-white/85 hover:bg-white active:bg-white/70"
                }
              `}
            />
            {/* Ripple indicator when not disabled */}
            {!disabled && <div className="absolute inset-0 capture-ripple" />}
          </button>
        </div>
      )}
    </div>
  );
}
