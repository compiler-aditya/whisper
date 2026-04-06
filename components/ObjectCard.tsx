"use client";

import type { WhisperResult } from "@/types";

interface ObjectCardProps {
  whisper: WhisperResult;
}

export default function ObjectCard({ whisper }: ObjectCardProps) {
  return (
    <div className="space-y-4">
      {/* Entity badge — environmental mode */}
      {whisper.isEnvironmental && whisper.entityName && (
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "var(--eco)" }}
          />
          <span className="text-xs font-light" style={{ color: "var(--eco)" }}>
            {whisper.entityName} is speaking
          </span>
        </div>
      )}

      {/* Object name — large, light weight */}
      <h2
        className="text-[28px] font-extralight tracking-[-0.02em] leading-tight"
        style={{ color: "var(--text)" }}
      >
        {whisper.objectName}
      </h2>

      {/* Traits — inline text, not pills */}
      <p className="text-xs font-light" style={{ color: "var(--text-muted)" }}>
        {whisper.personality.traits.join(" / ")}
      </p>

      {/* Monologue */}
      <p
        className="text-sm leading-[1.7] font-light italic"
        style={{ color: "var(--text-secondary)" }}
      >
        &ldquo;{whisper.monologue}&rdquo;
      </p>

      {/* Facts */}
      {whisper.facts.length > 0 && (
        <details className="group">
          <summary
            className="text-[11px] cursor-pointer transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            {whisper.facts.length} facts gathered
          </summary>
          <ul className="mt-3 space-y-2">
            {whisper.facts.slice(0, 3).map((fact, i) => (
              <li
                key={i}
                className="text-xs leading-relaxed font-light"
                style={{ color: "var(--text-muted)" }}
              >
                {fact.length > 150 ? `${fact.slice(0, 150)}...` : fact}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
