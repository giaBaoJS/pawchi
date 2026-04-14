import type { StateStorage } from 'zustand/middleware';
import { pawchiStorage } from './mmkv';

export function createMMKVStorage(): StateStorage {
  return {
    getItem: (name) => pawchiStorage.getString(name) ?? null,
    setItem: (name, value) => pawchiStorage.set(name, value),
    removeItem: (name) => {
      pawchiStorage.remove(name);
    },
  };
}
