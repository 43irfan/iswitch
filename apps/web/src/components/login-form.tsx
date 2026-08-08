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
    <form
      onSubmit={onSubmit}
      style={{ marginTop: 20, display: 'grid', gap: 12 }}
    >
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
        <p style={{ margin: 0, color: 'var(--danger)', fontSize: 13 }}>
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? 'Signing in…' : 'Continue'}
      </button>
      <p className="faint" style={{ margin: 0, fontSize: 12 }}>
        Password <span className="mono">Password123!</span>
      </p>
    </form>
  );
}
