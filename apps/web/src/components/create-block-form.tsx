'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function CreateBlockForm() {
  const router = useRouter();
  const [prefix, setPrefix] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ops/fraud/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prefix,
          reason: reason || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to create block');
      setPrefix('');
      setReason('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="panel mt-4 grid gap-3 p-4 sm:grid-cols-2">
      <div className="field">
        <label htmlFor="prefix">Prefix</label>
        <input
          id="prefix"
          placeholder="e.g. 1900"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          className="mono"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="reason">Reason</label>
        <input
          id="reason"
          placeholder="Optional"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn-primary sm:col-span-2"
      >
        {loading ? 'Adding…' : 'Add destination block'}
      </button>
      {error ? (
        <p className="sm:col-span-2 text-sm text-[var(--danger)]">{error}</p>
      ) : null}
    </form>
  );
}
