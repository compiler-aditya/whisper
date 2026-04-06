"use client";

import { useEffect, useRef, useState } from "react";
import { useWhisperStore, type RevealData } from "@/store/whisper-store";
import type { ProcessingStage } from "@/types";

interface WhisperRevealProps {
  reveal: RevealData;
  stage: ProcessingStage;
  onAudioFinished?: () => void;
}

export default function WhisperReveal({ reveal, stage, onAudioFinished }: WhisperRevealProps) {
  const [typedText, setTypedText] = useState("");
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Typewriter effect for monologue
  useEffect(() => {
    if (!reveal.monologue) return;
    if (typingRef.current) clearInterval(typingRef.current);

    let i = 0;
    setTypedText("");
    typingRef.current = setInterval(() => {
      if (i < reveal.monologue!.length) {
        setTypedText(reveal.monologue!.slice(0, i + 1));
        i++;
      } else {
        if (typingRef.current) clearInterval(typingRef.current);
      }
    }, 25);

    return () => {
      if (typingRef.current) clearInterval(typingRef.current);
    };
  }, [reveal.monologue]);

  // Auto-play audio when it arrives
  useEffect(() => {
    if (!reveal.audioBase64 || audioRef.current) return;

    const audio = new Audio(`data:audio/mp3;base64,${reveal.audioBase64}`);
    audioRef.current = audio;
    setAudioPlaying(true);

    audio.onended = () => {
      setAudioPlaying(false);
      onAudioFinished?.();
    };
    audio.onerror = () => {
      setAudioPlaying(false);
      onAudioFinished?.();
    };
    audio.play().catch(() => {
      setAudioPlaying(false);
    });

    return () => {
      audio.pause();
    };
  }, [reveal.audioBase64, onAudioFinished]);

  const stageIndex = ["recognizing", "personality", "voice", "speaking", "complete"].indexOf(stage);

  return (
    <div className="absolute inset-0 z-20 overflow-hidden">
      {/* Captured image background — blurred */}
      <div className="absolute inset-0">
        <img
          src={`data:image/jpeg;base64,${reveal.imageBase64}`}
          alt=""
          className="w-full h-full object-cover scale-110 blur-md brightness-[0.3]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center px-6 text-center">
        {/* Stage indicator dots */}
        <div className="absolute top-16 flex items-center gap-2">
          {["See", "Think", "Voice", "Speak"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex flex-col items-center gap-1 transition-all duration-500 ${
                i <= stageIndex ? "opacity-100" : "opacity-30"
              }`}>
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i < stageIndex
                    ? "bg-green-400"
                    : i === stageIndex
                      ? "bg-violet-400 animate-pulse"
                      : "bg-white/20"
                }`} />
                <span className="text-[9px] text-white/50 tracking-wider uppercase">{label}</span>
              </div>
              {i < 3 && (
                <div className={`w-6 h-px mb-4 transition-colors duration-500 ${
                  i < stageIndex ? "bg-green-400/40" : "bg-white/10"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Captured image thumbnail */}
        <div className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-700 mb-6 ${
          reveal.name ? "border-violet-400/50 shadow-lg shadow-violet-500/20" : "border-white/20"
        }`}>
          <img
            src={`data:image/jpeg;base64,${reveal.imageBase64}`}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        {/* Object type (appears immediately after vision) */}
        {reveal.objectType && !reveal.name && (
          <div className="animate-fade-in">
            <p className="text-white/40 text-xs tracking-[0.2em] uppercase mb-1">Identified</p>
            <h2 className="text-white/80 text-lg font-light">{reveal.objectType}</h2>
            {reveal.material && (
              <p className="text-white/30 text-xs mt-1">{reveal.material} · {reveal.condition}</p>
            )}
            <div className="mt-4 flex items-center justify-center gap-1">
              <div className="w-1 h-1 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0s" }} />
              <div className="w-1 h-1 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0.15s" }} />
              <div className="w-1 h-1 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0.3s" }} />
            </div>
          </div>
        )}

        {/* Name + personality (appears after personality stage) */}
        {reveal.name && (
          <div className="animate-fade-in-scale space-y-4 max-w-sm">
            {/* Entity badge */}
            {reveal.entityName && (
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/25 rounded-full animate-fade-in">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-300 text-[10px] font-medium">{reveal.entityName} is awakening</span>
                </div>
              </div>
            )}

            {/* Object name — dramatic reveal */}
            <h1 className="text-white text-2xl font-bold tracking-tight animate-fade-in">
              {reveal.name}
            </h1>

            {/* Traits */}
            <div className="flex flex-wrap justify-center gap-1.5 stagger-children">
              {reveal.traits?.map((trait) => (
                <span
                  key={trait}
                  className="px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-full text-white/50 text-[10px]"
                >
                  {trait}
                </span>
              ))}
            </div>

            {/* Monologue — typewriter */}
            {reveal.monologue && (
              <div className="relative">
                <p className="text-white/70 text-sm leading-relaxed italic min-h-[3em]">
                  &ldquo;{typedText}
                  {typedText.length < (reveal.monologue?.length || 0) && (
                    <span className="inline-block w-0.5 h-4 bg-violet-400 ml-0.5 animate-pulse" />
                  )}
                  {typedText.length >= (reveal.monologue?.length || 0) && "&rdquo;"}
                </p>
              </div>
            )}

            {/* Audio visualization */}
            {audioPlaying && (
              <div className="flex items-center justify-center gap-[3px] py-2 animate-fade-in">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[3px] bg-gradient-to-t from-violet-500 to-blue-400 rounded-full wave-bar"
                    style={{
                      height: "16px",
                      animationDelay: `${i * 0.07}s`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Waiting for voice indicator */}
            {!reveal.audioBase64 && reveal.name && (
              <div className="flex items-center justify-center gap-2 text-white/30 text-xs animate-fade-in">
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Designing voice...
              </div>
            )}
          </div>
        )}

        {/* Initial loading — before vision */}
        {!reveal.objectType && (
          <div className="animate-fade-in space-y-4">
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 rounded-full bg-violet-500/20 animate-orb-pulse blur-lg" />
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-violet-500/40 to-blue-500/40 animate-orb-pulse" style={{ animationDelay: "0.3s" }} />
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-violet-400 to-blue-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <p className="text-white/40 text-xs tracking-wider">Looking...</p>
          </div>
        )}
      </div>
    </div>
  );
}
