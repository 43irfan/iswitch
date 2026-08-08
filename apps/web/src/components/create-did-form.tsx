'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DidDestinationType } from '@iswitch/shared';

export function CreateDidForm({
  extensions,
}: {
  extensions: { id: string; number: string; displayName: string | null }[];
}) {
  const router = useRouter();
  const [number, setNumber] = useState('');
  const [description, setDescription] = useState('');
  const [destinationRef, setDestinationRef] = useState(extensions[0]?.id ?? '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/retail/dids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number,
          description: description || undefined,
          destinationType: DidDestinationType.EXTENSION,
          destinationRef,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to create DID');
      setNumber('');
      setDescription('');
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
        <label htmlFor="did-number">DID</label>
        <input
          id="did-number"
          placeholder="+1555…"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="did-desc">Description</label>
        <input
          id="did-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="did-dest">Extension</label>
        <select
          id="did-dest"
          value={destinationRef}
          onChange={(e) => setDestinationRef(e.target.value)}
          required
        >
          {extensions.map((ext) => (
            <option key={ext.id} value={ext.id}>
              Ext {ext.number}
              {ext.displayName ? ` — ${ext.displayName}` : ''}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={loading || extensions.length === 0}
        className="btn btn-primary"
      >
        {loading ? 'Adding…' : 'Add DID'}
      </button>
      {error ? (
        <p style={{ gridColumn: '1 / -1', margin: 0, color: 'var(--danger)' }}>
          {error}
        </p>
      ) : null}
    </form>
  );
}
