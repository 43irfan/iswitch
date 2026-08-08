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
        body: JSON.stringify({ prefix, reason: reason || undefined }),
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
    <form onSubmit={onSubmit} className="form-panel">
      <div className="field">
        <label htmlFor="prefix">Prefix</label>
        <input
          id="prefix"
          className="mono"
          placeholder="1900"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
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
      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? 'Adding…' : 'Add block'}
      </button>
      {error ? (
        <p style={{ gridColumn: '1 / -1', margin: 0, color: 'var(--danger)' }}>
          {error}
        </p>
      ) : null}
    </form>
  );
}
