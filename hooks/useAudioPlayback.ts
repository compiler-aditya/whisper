"use client";

import { useRef, useState, useCallback } from "react";

export function useAudioPlayback() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const playBase64Audio = useCallback(async (base64: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        // Stop current playback
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }

        const audio = new Audio(`data:audio/mp3;base64,${base64}`);
        audioRef.current = audio;

        audio.onloadedmetadata = () => {
          setDuration(audio.duration);
        };

        audio.ontimeupdate = () => {
          if (audio.duration > 0) {
            setProgress(audio.currentTime / audio.duration);
          }
        };

        audio.onended = () => {
          setIsPlaying(false);
          setProgress(1);
          resolve();
        };

        audio.onerror = () => {
          setIsPlaying(false);
          reject(new Error("Audio playback failed"));
        };

        setIsPlaying(true);
        setProgress(0);
        audio.play().catch(reject);
      } catch (err) {
        reject(err);
      }
    });
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setProgress(0);
    }
  }, []);

  const togglePlayback = useCallback(
    (base64: string) => {
      if (isPlaying) {
        stop();
      } else {
        playBase64Audio(base64);
      }
    },
    [isPlaying, stop, playBase64Audio]
  );

  return {
    playBase64Audio,
    stop,
    togglePlayback,
    isPlaying,
    progress,
    duration,
  };
}
