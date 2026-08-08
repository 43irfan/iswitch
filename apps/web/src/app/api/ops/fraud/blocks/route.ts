import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@iswitch/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function POST(request: Request) {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }
  const body = await request.text();
  const res = await fetch(`${API_URL}/ops/fraud/blocks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `${SESSION_COOKIE}=${token}`,
    },
    body,
    cache: 'no-store',
  });
  const text = await res.text();
  return NextResponse.json(text ? JSON.parse(text) : {}, { status: res.status });
}
