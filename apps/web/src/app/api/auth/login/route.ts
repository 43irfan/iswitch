import { NextResponse } from 'next/server';
import type { SessionUser } from '@iswitch/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function POST(request: Request) {
  const body = await request.json();
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as {
    user?: SessionUser;
    message?: string;
  };

  const setCookie = res.headers.get('set-cookie');
  if (!res.ok || !setCookie || !data.user) {
    return NextResponse.json(
      { message: data.message ?? 'Login failed' },
      { status: res.status || 401 },
    );
  }

  const response = NextResponse.json({ user: data.user });
  response.headers.set('set-cookie', setCookie);
  return response;
}
