import { useState, useEffect, useRef } from 'react';
import { Location } from '../types';

async function fetchLocationName(lat: number, lon: number) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`);
    const data = await res.json();
    return data.address.city || data.address.town || data.address.village || data.address.county || "Current Location";
  } catch (err) {
    console.warn("Reverse geocoding failed:", err);
    return "Current Location";
  }
}

export function useGeolocation() {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastFetchTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    const FETCH_THROTTLE = 60000; // 1 minute

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        const now = Date.now();
        if (now - lastFetchTimeRef.current > FETCH_THROTTLE) {
          const name = await fetchLocationName(latitude, longitude);
          setLocation({
            latitude,
            longitude,
            name,
          });
          lastFetchTimeRef.current = now;
        } else {
          setLocation(prev => ({
            latitude,
            longitude,
            name: prev?.name || "Current Location"
          }));
        }
      },
      (err) => {
        setError(`Location access denied: ${err.message}`);
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { location, error };
}
