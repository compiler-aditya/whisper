"use client";

import type { WhisperResult } from "@/types";

interface ObjectCardProps {
  whisper: WhisperResult;
}

export default function ObjectCard({ whisper }: ObjectCardProps) {
  return (
    <div className="space-y-3">
      {/* Entity badge for environmental mode */}
      {whisper.isEnvironmental && whisper.entityName && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-300 text-xs font-medium">
            {whisper.entityName} is speaking
          </span>
        </div>
      )}

      {/* Object name */}
      <h2 className="text-white text-xl font-semibold">
        {whisper.objectName}
      </h2>

      {/* Traits */}
      <div className="flex flex-wrap gap-1.5">
        {whisper.personality.traits.map((trait) => (
          <span
            key={trait}
            className="px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-full text-white/50 text-xs"
          >
            {trait}
          </span>
        ))}
      </div>

      {/* Monologue text */}
      <p className="text-white/70 text-sm leading-relaxed italic">
        &ldquo;{whisper.monologue}&rdquo;
      </p>

      {/* Facts */}
      {whisper.facts.length > 0 && (
        <details className="group">
          <summary className="text-white/30 text-xs cursor-pointer hover:text-white/50 transition-colors">
            {whisper.facts.length} facts gathered
          </summary>
          <ul className="mt-2 space-y-1">
            {whisper.facts.slice(0, 3).map((fact, i) => (
              <li key={i} className="text-white/30 text-xs leading-relaxed">
                {fact.length > 150 ? `${fact.slice(0, 150)}...` : fact}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
