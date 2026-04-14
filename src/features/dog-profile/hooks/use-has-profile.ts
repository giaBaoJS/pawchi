import { useDogProfileStore } from '../stores/dog-profile-store';

export function useHasProfile(): boolean {
  return useDogProfileStore((s) => s.profile !== null);
}
