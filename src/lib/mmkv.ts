import { createMMKV } from 'react-native-mmkv';

// Separate instance from the query-cache MMKV (which handles TanStack Query persistence)
export const clientStore = createMMKV({ id: 'client-state' });

export function readClientState<T>(key: string, fallback: T): T {
  const raw = clientStore.getString(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeClientState<T>(key: string, value: T): void {
  clientStore.set(key, JSON.stringify(value) as string);
}
