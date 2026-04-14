import { queryClient } from '@/api';
import { queryKeys } from '@/api/keys/query';

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    public code: string,
  ) {
    super(`API Error ${status}: ${code}`);
    this.name = 'ApiError';
  }
}

let refreshPromise: Promise<void> | null = null;

async function refreshToken(): Promise<void> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const auth = queryClient.getQueryData<{ refreshToken: string }>([queryKeys.auth]);
      if (!auth?.refreshToken) throw new ApiError(401, null, 'NO_REFRESH_TOKEN');

      const response = await fetch('/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: auth.refreshToken }),
      });

      if (!response.ok) throw new ApiError(401, null, 'REFRESH_FAILED');

      const data = await response.json();
      queryClient.setQueryData([queryKeys.auth], data);
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiClient<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    headers?: Record<string, string>;
  } = {},
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const auth = queryClient.getQueryData<{ accessToken: string }>([queryKeys.auth]);
  if (auth?.accessToken) {
    headers['Authorization'] = `Bearer ${auth.accessToken}`;
  }

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    await refreshToken();
    return apiClient<T>(path, options);
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      errorBody,
      errorBody?.code ?? 'REQUEST_FAILED',
    );
  }

  return response.json() as Promise<T>;
}
