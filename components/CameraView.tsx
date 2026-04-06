"use client";

import { useEffect, useState } from "react";
import { useCamera } from "@/hooks/useCamera";

interface CameraViewProps {
  onCapture: (imageBase64: string) => void;
  disabled?: boolean;
  assistMode?: boolean;
  onToggleAssist?: () => void;
}

export default function CameraView({ onCapture, disabled, assistMode, onToggleAssist }: CameraViewProps) {
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
      setFlash(true);
      setTimeout(() => setFlash(false), 120);
      onCapture(frame);
    }
  };

  return (
    <div className="relative w-full h-full" style={{ background: "var(--bg)" }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover pointer-events-none"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Flash */}
      {flash && (
        <div className="absolute inset-0 bg-white/10 z-10 pointer-events-none" />
      )}

      {/* Corner viewfinder marks */}
      {ready && !disabled && (
        <div className="absolute inset-0 pointer-events-none z-5">
          {/* Top-left */}
          <div className="absolute top-[22%] left-[12%]">
            <div className="w-6 h-px" style={{ background: "var(--accent)", opacity: 0.4 }} />
            <div className="h-6 w-px" style={{ background: "var(--accent)", opacity: 0.4 }} />
          </div>
          {/* Top-right */}
          <div className="absolute top-[22%] right-[12%] flex flex-col items-end">
            <div className="w-6 h-px" style={{ background: "var(--accent)", opacity: 0.4 }} />
            <div className="h-6 w-px self-end" style={{ background: "var(--accent)", opacity: 0.4 }} />
          </div>
          {/* Bottom-left */}
          <div className="absolute bottom-[28%] left-[12%] flex flex-col justify-end">
            <div className="h-6 w-px" style={{ background: "var(--accent)", opacity: 0.4 }} />
            <div className="w-6 h-px" style={{ background: "var(--accent)", opacity: 0.4 }} />
          </div>
          {/* Bottom-right */}
          <div className="absolute bottom-[28%] right-[12%] flex flex-col items-end justify-end">
            <div className="h-6 w-px self-end" style={{ background: "var(--accent)", opacity: 0.4 }} />
            <div className="w-6 h-px" style={{ background: "var(--accent)", opacity: 0.4 }} />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center p-8" style={{ background: "var(--bg)", opacity: 0.97 }}>
          <div className="text-center space-y-5">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{error}</p>
            <label
              className="inline-block cursor-pointer text-sm py-3 px-6 transition-all active:scale-95"
              style={{
                color: "var(--text)",
                border: "1px solid var(--border)",
                borderRadius: 10,
              }}
            >
              Upload a photo
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

      {/* Capture button + mode toggle */}
      {ready && (
        <div className="absolute bottom-0 left-0 right-0 pb-10 pt-16 flex flex-col items-center gap-4 safe-bottom"
          style={{ background: "linear-gradient(to top, rgba(5,5,5,0.6) 0%, transparent 100%)" }}
        >
          {/* Mode toggle */}
          {onToggleAssist && !disabled && (
            <button
              onClick={onToggleAssist}
              className="flex items-center gap-2 px-4 py-2 text-xs transition-all active:scale-95"
              style={{
                background: assistMode ? "rgba(61,221,182,0.12)" : "rgba(255,255,255,0.06)",
                border: assistMode ? "1px solid rgba(61,221,182,0.25)" : "1px solid var(--border)",
                borderRadius: 20,
                color: assistMode ? "var(--eco)" : "var(--text-muted)",
              }}
            >
              {assistMode ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
              )}
              {assistMode ? "Read & Help" : "Character"}
            </button>
          )}
          <button
            onClick={handleCapture}
            disabled={disabled}
            className={`
              relative w-[68px] h-[68px] rounded-full
              flex items-center justify-center
              transition-all duration-300
              ${disabled ? "opacity-20 cursor-not-allowed" : "active:scale-90"}
            `}
            style={{
              border: `2px solid ${disabled ? "rgba(237,232,224,0.15)" : "var(--accent)"}`,
            }}
          >
            <div
              className="w-[56px] h-[56px] rounded-full transition-all duration-200"
              style={{
                background: disabled
                  ? "rgba(237,232,224,0.05)"
                  : "var(--accent)",
                opacity: disabled ? 0.3 : 0.9,
              }}
            />
            {!disabled && <div className="absolute inset-0 capture-ripple" />}
          </button>
        </div>
      )}
    </div>
  );
}
