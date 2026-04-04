"use client";

import { useState } from "react";
import { useClipGenerator } from "@/hooks/useClipGenerator";
import type { WhisperResult } from "@/types";

interface ShareButtonProps {
  whisper: WhisperResult;
}

export default function ShareButton({ whisper }: ShareButtonProps) {
  const { generateClip, isGenerating, progress } = useClipGenerator();
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    const blob = await generateClip(whisper);
    if (!blob) return;

    const fileName = `whisper-${whisper.objectName.replace(/\s+/g, "-").toLowerCase()}.wav`;
    const audioFile = new File([blob], fileName, { type: blob.type });

    const shareText = whisper.isEnvironmental
      ? `${whisper.entityName} just spoke to me through Whisper. "${whisper.monologue.slice(0, 80)}..." #Whisper #ElevenHacks`
      : `My ${whisper.objectName} just spoke to me. "${whisper.monologue.slice(0, 80)}..." #Whisper #ElevenHacks`;

    try {
      if (navigator.share && navigator.canShare?.({ files: [audioFile] })) {
        await navigator.share({
          title: `Whisper: ${whisper.objectName}`,
          text: shareText,
          files: [audioFile],
        });
        setShared(true);
      } else {
        // Fallback: download the clip
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        setShared(true);
      }
    } catch {
      // User cancelled share
    }

    setTimeout(() => setShared(false), 2500);
  };

  const handleDownload = async () => {
    const blob = await generateClip(whisper);
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `whisper-${whisper.objectName.replace(/\s+/g, "-").toLowerCase()}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Share button */}
      <button
        onClick={handleShare}
        disabled={isGenerating}
        className={`
          flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all
          ${shared
            ? "bg-green-500/20 text-green-300 border border-green-500/30"
            : isGenerating
              ? "bg-white/5 text-white/40 cursor-wait"
              : "bg-white/10 text-white/80 border border-white/10 hover:bg-white/20 active:scale-95"
          }
        `}
      >
        {shared ? (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Shared!
          </>
        ) : isGenerating ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            {progress || "Generating..."}
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share Clip
          </>
        )}
      </button>

      {/* Download button */}
      {!isGenerating && !shared && (
        <button
          onClick={handleDownload}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors active:scale-95"
          title="Download clip"
        >
          <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      )}
    </div>
  );
}
