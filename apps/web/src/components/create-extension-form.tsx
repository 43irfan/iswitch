'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function CreateExtensionForm() {
  const router = useRouter();
  const [number, setNumber] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/retail/extensions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number, displayName: displayName || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to create extension');
      setNumber('');
      setDisplayName('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="panel mt-6 grid gap-3 p-4 sm:grid-cols-[1fr_1fr_auto]"
    >
      <div className="field">
        <label htmlFor="ext-number">Extension</label>
        <input
          id="ext-number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="ext-name">Display name</label>
        <input
          id="ext-name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>
      <div className="flex items-end">
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Adding…' : 'Add extension'}
        </button>
      </div>
      {error ? (
        <p className="sm:col-span-3 text-sm text-[var(--danger)]">{error}</p>
      ) : null}
    </form>
  );
}
