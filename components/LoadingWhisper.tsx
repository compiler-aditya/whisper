"use client";

import type { ProcessingStage } from "@/types";

interface LoadingWhisperProps {
  stage: ProcessingStage;
}

const STAGES: { key: ProcessingStage; label: string }[] = [
  { key: "capturing", label: "Seeing" },
  { key: "recognizing", label: "Recognizing" },
  { key: "generating", label: "Creating voice" },
  { key: "speaking", label: "Speaking" },
];

export default function LoadingWhisper({ stage }: LoadingWhisperProps) {
  const currentIndex = STAGES.findIndex((s) => s.key === stage);

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-20">
      <div className="text-center space-y-8">
        {/* Animated orb */}
        <div className="relative mx-auto w-28 h-28">
          {/* Outer glow */}
          <div className="absolute inset-0 rounded-full bg-violet-500/20 animate-orb-pulse blur-xl" />
          {/* Mid ring */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-violet-500/40 to-blue-500/40 animate-orb-pulse" style={{ animationDelay: "0.3s" }} />
          {/* Inner core */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-violet-400 to-blue-500 animate-orb-pulse flex items-center justify-center" style={{ animationDelay: "0.6s" }}>
            {/* Sound waves icon */}
            <div className="flex items-end gap-[3px]">
              {[0.4, 0.7, 1, 0.7, 0.4].map((scale, i) => (
                <div
                  key={i}
                  className="w-[3px] bg-white/90 rounded-full wave-bar"
                  style={{
                    height: `${scale * 20}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Stage progress */}
        <div className="space-y-3 px-8">
          {STAGES.map((s, i) => {
            const isComplete = i < currentIndex;
            const isCurrent = i === currentIndex;
            const isPending = i > currentIndex;

            return (
              <div
                key={s.key}
                className={`
                  flex items-center gap-3 transition-all duration-500
                  ${isComplete ? "opacity-40" : isCurrent ? "opacity-100" : "opacity-20"}
                `}
              >
                {/* Step indicator */}
                <div className={`
                  w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300
                  ${isComplete
                    ? "bg-green-500/30 border border-green-400/50"
                    : isCurrent
                      ? "bg-violet-500/30 border border-violet-400/50"
                      : "bg-white/5 border border-white/10"}
                `}>
                  {isComplete ? (
                    <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isCurrent ? (
                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  )}
                </div>

                {/* Label */}
                <span className={`text-sm ${isCurrent ? "text-white font-medium" : "text-white/60"}`}>
                  {s.label}
                </span>

                {/* Progress dots for current step */}
                {isCurrent && (
                  <div className="flex gap-1 ml-auto">
                    {[0, 1, 2].map((d) => (
                      <div
                        key={d}
                        className="w-1 h-1 rounded-full bg-violet-400 animate-pulse"
                        style={{ animationDelay: `${d * 0.3}s` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
