import { QueryClient } from '@tanstack/react-query';
import { createMMKV } from 'react-native-mmkv';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import LZString from 'lz-string';
import React from 'react';
import { queryKeys } from './keys/query';

const storage = createMMKV({ id: 'query-cache' });

const mmkvStoragePersister = createSyncStoragePersister({
  storage: {
    getItem: key => storage.getString(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: key => storage.remove(key),
  },
  serialize: data => LZString.compressToUTF16(JSON.stringify(data)),
  deserialize: data => JSON.parse(LZString.decompressFromUTF16(data) ?? '{}'),
});

const PERSISTED_KEYS = new Set<string>([queryKeys.auth, queryKeys.language]);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: Infinity,
    },
  },
});

type QueryClientProviderProps = {
  children: React.ReactNode;
};

export function AppQueryClientProvider({ children }: QueryClientProviderProps) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: mmkvStoragePersister,
        dehydrateOptions: {
          shouldDehydrateQuery: query => {
            const key = query.queryKey[0];
            return typeof key === 'string' && PERSISTED_KEYS.has(key);
          },
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
