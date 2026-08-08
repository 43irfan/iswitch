'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { ROLE_PORTAL_PATH, type SessionUser } from '@iswitch/shared';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@iswitch.local');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as {
        user?: SessionUser;
        message?: string;
      };
      if (!res.ok || !data.user) {
        throw new Error(data.message ?? 'Login failed');
      }
      router.push(ROLE_PORTAL_PATH[data.user.role]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <div>
        <label className="block text-sm text-zinc-400" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-emerald-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm text-zinc-400" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-emerald-500"
          required
        />
      </div>
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-zinc-950 hover:bg-emerald-400 disabled:opacity-60"
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
      <p className="text-xs text-zinc-500">
        Demo users share password <code className="text-zinc-400">Password123!</code>
      </p>
    </form>
  );
}
