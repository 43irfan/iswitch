import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@iswitch/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function forward(path: string, init?: RequestInit) {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Cookie: `${SESSION_COOKIE}=${token}`,
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  return NextResponse.json(body, { status: res.status });
}

export async function POST(request: Request) {
  const body = await request.text();
  return forward('/retail/extensions', { method: 'POST', body });
}
