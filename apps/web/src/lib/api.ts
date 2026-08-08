import { cookies } from 'next/headers';
import { SESSION_COOKIE } from '@iswitch/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type FetchOptions = RequestInit & { cookieHeader?: string };

export async function apiFetch<T>(
  path: string,
  init: FetchOptions = {},
): Promise<T> {
  const { cookieHeader, ...rest } = init;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(rest.headers ?? {}),
  };

  if (cookieHeader) {
    (headers as Record<string, string>).Cookie = cookieHeader;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    credentials: 'include',
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (typeof body.message === 'string') message = body.message;
      else if (Array.isArray(body.message)) message = body.message.join(', ');
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** Build Cookie header for server components / route handlers. */
export async function serverCookieHeader() {
  const jar = await cookies();
  const sid = jar.get(SESSION_COOKIE)?.value;
  return sid ? `${SESSION_COOKIE}=${sid}` : '';
}

export { API_URL };
