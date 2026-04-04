"use client";

import { useState, useCallback } from "react";
import type { GeoLocation } from "@/types";

export function useGeolocation() {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getLocation = useCallback((): Promise<GeoLocation | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setError("Geolocation not supported");
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setLocation(loc);
          setError(null);
          resolve(loc);
        },
        () => {
          setError("Location access denied");
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 5000 }
      );
    });
  }, []);

  return { location, error, getLocation };
}
