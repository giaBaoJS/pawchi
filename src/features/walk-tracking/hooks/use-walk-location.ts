import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

interface UseWalkLocationResult {
  distanceMeters: number | null;
  hasPermission: boolean;
}

export function useWalkLocation(active: boolean): UseWalkLocationResult {
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const lastCoordRef = useRef<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (!active) return;
    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      if (status !== 'granted') {
        setHasPermission(false);
        return;
      }
      setHasPermission(true);
      setDistanceMeters(0);
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        (loc) => {
          const { latitude, longitude } = loc.coords;
          const prev = lastCoordRef.current;
          if (prev) {
            const d = haversineMeters(prev, { latitude, longitude });
            setDistanceMeters((current) => (current ?? 0) + d);
          }
          lastCoordRef.current = { latitude, longitude };
        },
      );
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
      lastCoordRef.current = null;
    };
  }, [active]);

  return { distanceMeters, hasPermission };
}

function haversineMeters(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
