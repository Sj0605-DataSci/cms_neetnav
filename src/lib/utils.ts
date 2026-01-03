import clsx, { type ClassValue } from 'clsx';
import * as tailwindMerge from 'tailwind-merge';

const { twMerge } = tailwindMerge as typeof tailwindMerge & {
  twMerge: (...classLists: (string | undefined | null | false)[]) => string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api';
export const AUTH_STORAGE_KEY = 'cms_auth_state';

type ApiFetchOptions = RequestInit & { auth?: boolean };

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { auth = true, headers, ...rest } = options;
  const resolvedHeaders = new Headers(headers);

  const body = rest.body;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  if (!resolvedHeaders.has('Content-Type') && !isFormData) {
    resolvedHeaders.set('Content-Type', 'application/json');
  }

  if (auth) {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as { token?: string };
      if (parsed?.token) {
        resolvedHeaders.set('Authorization', `Bearer ${parsed.token}`);
      }
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: resolvedHeaders,
    body: isFormData ? body : typeof body === 'object' && body !== undefined ? JSON.stringify(body) : body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
