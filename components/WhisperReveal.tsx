"use client";

import { useEffect, useRef, useState } from "react";
import type { RevealData } from "@/store/whisper-store";
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

  // Typewriter
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

  // Auto-play audio
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

  const stages = ["recognizing", "personality", "voice", "speaking", "complete"];
  const stageIndex = stages.indexOf(stage);

  return (
    <div className="absolute inset-0 z-20 overflow-hidden">
      {/* Background image — heavily darkened */}
      <div className="absolute inset-0">
        <img
          src={`data:image/jpeg;base64,${reveal.imageBase64}`}
          alt=""
          className="w-full h-full object-cover scale-105 blur-lg"
          style={{ filter: "blur(16px) brightness(0.15) saturate(0.5)" }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(5,5,5,0.5), rgba(5,5,5,0.8))" }} />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center px-8 text-center">
        {/* Stage line — minimal, horizontal */}
        <div className="absolute top-16 flex items-center gap-1">
          {["See", "Think", "Voice", "Speak"].map((label, i) => (
            <div key={label} className="flex items-center gap-1">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className="w-5 h-[2px] rounded-full transition-all duration-700"
                  style={{
                    background: i < stageIndex
                      ? "var(--accent)"
                      : i === stageIndex
                        ? "var(--accent)"
                        : "var(--text-muted)",
                    opacity: i <= stageIndex ? 1 : 0.3,
                  }}
                />
                <span
                  className="text-[8px] tracking-[0.15em] uppercase transition-all duration-500"
                  style={{
                    color: i <= stageIndex ? "var(--text-secondary)" : "var(--text-muted)",
                  }}
                >
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Captured image — clean square */}
        <div
          className="w-20 h-20 overflow-hidden mb-8 transition-all duration-700"
          style={{
            borderRadius: 16,
            border: reveal.name
              ? "1px solid var(--accent)"
              : "1px solid var(--border)",
            boxShadow: reveal.name
              ? "0 0 40px rgba(232,196,124,0.1)"
              : "none",
          }}
        >
          <img
            src={`data:image/jpeg;base64,${reveal.imageBase64}`}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        {/* Vision result (before personality) */}
        {reveal.objectType && !reveal.name && (
          <div className="animate-fade-in space-y-2">
            <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--text-muted)" }}>
              Identified
            </p>
            <h2 className="text-xl font-extralight" style={{ color: "var(--text)" }}>
              {reveal.objectType}
            </h2>
            {reveal.material && (
              <p className="text-xs font-light" style={{ color: "var(--text-muted)" }}>
                {reveal.material} · {reveal.condition}
              </p>
            )}
            <div className="mt-6 flex items-center justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1 h-1 rounded-full animate-pulse"
                  style={{
                    background: "var(--accent)",
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Name + personality */}
        {reveal.name && (
          <div className="animate-fade-in-scale space-y-5 max-w-sm">
            {/* Entity badge */}
            {reveal.entityName && (
              <div className="flex justify-center animate-fade-in">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--eco)" }} />
                  <span className="text-[11px] font-light" style={{ color: "var(--eco)" }}>
                    {reveal.entityName} is awakening
                  </span>
                </div>
              </div>
            )}

            {/* Object name — dramatic */}
            <h1
              className="text-[36px] font-extralight tracking-[-0.02em] leading-none"
              style={{ color: "var(--text)" }}
            >
              {reveal.name}
            </h1>

            {/* Traits — inline, subtle */}
            {reveal.traits && (
              <p className="text-[11px] font-light tracking-wide" style={{ color: "var(--text-muted)" }}>
                {reveal.traits.join(" / ")}
              </p>
            )}

            {/* Monologue */}
            {reveal.monologue && (
              <p
                className="text-sm leading-[1.8] font-light italic"
                style={{ color: "var(--text-secondary)" }}
              >
                &ldquo;{typedText}
                {typedText.length < (reveal.monologue?.length || 0) && (
                  <span
                    className="inline-block w-[2px] h-4 ml-0.5 animate-pulse"
                    style={{ background: "var(--accent)" }}
                  />
                )}
                {typedText.length >= (reveal.monologue?.length || 0) && "&rdquo;"}
              </p>
            )}

            {/* Audio wave */}
            {audioPlaying && (
              <div className="flex items-center justify-center gap-[3px] py-3 animate-fade-in">
                {Array.from({ length: 11 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[2px] rounded-full wave-bar"
                    style={{
                      height: 18,
                      background: "var(--accent)",
                      opacity: 0.5 + (Math.abs(i - 5) < 3 ? 0.3 : 0),
                      animationDelay: `${i * 0.08}s`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Waiting for voice */}
            {!reveal.audioBase64 && reveal.name && (
              <div className="flex items-center justify-center gap-2 animate-fade-in">
                <div
                  className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"
                  style={{ color: "var(--text-muted)" }}
                />
                <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  Designing voice...
                </span>
              </div>
            )}
          </div>
        )}

        {/* Initial loading */}
        {!reveal.objectType && (
          <div className="animate-fade-in space-y-6">
            {/* Breathing dot */}
            <div className="relative mx-auto w-16 h-16">
              <div
                className="absolute inset-0 rounded-full animate-breathe"
                style={{
                  background: "radial-gradient(circle, rgba(232,196,124,0.15), transparent 70%)",
                  filter: "blur(8px)",
                }}
              />
              <div
                className="absolute inset-3 rounded-full animate-breathe flex items-center justify-center"
                style={{
                  background: "rgba(232,196,124,0.08)",
                  border: "1px solid rgba(232,196,124,0.15)",
                  animationDelay: "0.5s",
                }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>Looking...</p>
          </div>
        )}
      </div>
    </div>
  );
}
