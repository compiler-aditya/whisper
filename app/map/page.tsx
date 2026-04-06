"use client";

import { useEffect, useRef, useState } from "react";
import { useWhisperStore } from "@/store/whisper-store";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import { useRouter } from "next/navigation";
import type { WhisperResult, MapPin } from "@/types";

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const mapPins = useWhisperStore((s) => s.mapPins);
  const whispers = useWhisperStore((s) => s.whispers);
  const router = useRouter();
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const { togglePlayback, isPlaying, progress } = useAudioPlayback();

  const selectedWhisper = selectedPin
    ? whispers.find((w) => w.id === selectedPin.whisperId) ?? null
    : null;

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamic import to avoid SSR issues with Leaflet
    import("leaflet").then((L) => {
      // We use custom divIcon pins, no default marker fix needed

      if (!mapRef.current) return;

      const center: [number, number] =
        mapPins.length > 0
          ? [mapPins[0].location.lat, mapPins[0].location.lng]
          : [20, 0];

      const zoom = mapPins.length > 0 ? 13 : 2;

      const map = L.map(mapRef.current, {
        zoomControl: false,
      }).setView(center, zoom);

      // Dark tile layer
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
        }
      ).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Add pins
      mapPins.forEach((pin) => {
        const whisper = whispers.find((w) => w.id === pin.whisperId);
        const isEnv = whisper?.isEnvironmental;

        const icon = L.divIcon({
          className: "whisper-map-pin",
          html: `
            <div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">
              <div style="width:12px;height:12px;border-radius:50%;z-index:2;box-shadow:0 0 12px 2px ${
                isEnv ? "rgba(16,185,129,0.5)" : "rgba(139,92,246,0.5)"
              };background:linear-gradient(135deg,${
                isEnv ? "#10b981,#06b6d4" : "#8b5cf6,#3b82f6"
              });"></div>
              <div style="position:absolute;inset:0;border-radius:50%;border:2px solid ${
                isEnv ? "rgba(16,185,129,0.3)" : "rgba(139,92,246,0.3)"
              };animation:whisper-ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([pin.location.lat, pin.location.lng], {
          icon,
        }).addTo(map);

        marker.on("click", () => {
          setSelectedPin(pin);
        });
      });

      // Fit bounds if multiple pins
      if (mapPins.length > 1) {
        const bounds = L.latLngBounds(
          mapPins.map(
            (p) => [p.location.lat, p.location.lng] as [number, number]
          )
        );
        map.fitBounds(bounds, { padding: [50, 50] });
      }

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative h-full w-full bg-[#0a0a0c]">
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />

      {/* Map container */}
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] pointer-events-none">
        <div className="flex items-center justify-between px-4 pt-4">
          <button
            onClick={() => router.push("/")}
            className="pointer-events-auto w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <svg
              className="w-4 h-4 text-white/70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="pointer-events-auto flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5">
            <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-white/60 text-xs font-medium">
              {mapPins.length} whisper{mapPins.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Selected pin detail card */}
      {selectedPin && selectedWhisper && (
        <div className="absolute bottom-6 left-4 right-4 z-[1000] animate-fade-in">
          <div className="bg-[#0e0e10]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              {selectedWhisper.imageBase64 ? (
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                  <img
                    src={`data:image/jpeg;base64,${selectedWhisper.imageBase64}`}
                    alt={selectedPin.objectName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">
                    {selectedWhisper.isEnvironmental ? "🌍" : "🔊"}
                  </span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-white/90 text-sm font-medium truncate">
                  {selectedPin.objectName}
                </p>
                {selectedPin.entityName && (
                  <p className="text-emerald-400/60 text-xs mt-0.5">
                    {selectedPin.entityName}
                  </p>
                )}
                <p className="text-white/30 text-[10px] mt-1">
                  {new Date(selectedPin.timestamp).toLocaleDateString(
                    undefined,
                    {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>

              {/* Play button */}
              <button
                onClick={() => togglePlayback(selectedWhisper.audioBase64)}
                className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 hover:bg-violet-500/30 transition-colors"
              >
                {isPlaying ? (
                  <svg
                    className="w-4 h-4 text-violet-300"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 text-violet-300 ml-0.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                )}
              </button>

              {/* Close button */}
              <button
                onClick={() => setSelectedPin(null)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0"
              >
                <svg
                  className="w-3.5 h-3.5 text-white/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Progress bar */}
            {isPlaying && (
              <div className="mt-3 h-0.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-400 transition-all duration-100"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {mapPins.length === 0 && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center pointer-events-none">
          <div className="text-center px-8">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7 text-white/20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
            </div>
            <p className="text-white/30 text-sm mb-1">
              No whispers on the map yet
            </p>
            <p className="text-white/15 text-xs">
              Scan objects with location enabled to pin them here
            </p>
          </div>
        </div>
      )}

      {/* Custom styles for Leaflet */}
      <style jsx global>{`
        .whisper-map-pin {
          background: none !important;
          border: none !important;
        }
        @keyframes whisper-ping {
          75%,
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
        .leaflet-container {
          background: #0a0a0c !important;
          font-family: inherit;
        }
        .leaflet-control-attribution {
          background: rgba(0, 0, 0, 0.6) !important;
          color: rgba(255, 255, 255, 0.3) !important;
          font-size: 9px !important;
          border: none !important;
        }
        .leaflet-control-attribution a {
          color: rgba(255, 255, 255, 0.4) !important;
        }
        .leaflet-control-zoom a {
          background: rgba(14, 14, 16, 0.9) !important;
          color: rgba(255, 255, 255, 0.6) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(14, 14, 16, 1) !important;
          color: rgba(255, 255, 255, 0.8) !important;
        }
      `}</style>
    </div>
  );
}
