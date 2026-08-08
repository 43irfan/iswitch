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
    <form onSubmit={onSubmit} className="mt-7 space-y-4">
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
        />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>
      {error ? (
        <p className="text-sm font-medium text-[var(--danger)]">{error}</p>
      ) : null}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
      <p className="text-xs text-[var(--ink-faint)]">
        Demo password{' '}
        <code className="mono text-[var(--ink-soft)]">Password123!</code>
      </p>
    </form>
  );
}
