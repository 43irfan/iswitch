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
    <form
      onSubmit={onSubmit}
      className="mt-6 grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:grid-cols-2"
    >
      <input
        placeholder="DID number e.g. +1555…"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
        required
      />
      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
      />
      <select
        value={destinationRef}
        onChange={(e) => setDestinationRef(e.target.value)}
        className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
        required
      >
        {extensions.map((ext) => (
          <option key={ext.id} value={ext.id}>
            Ext {ext.number}
            {ext.displayName ? ` — ${ext.displayName}` : ''}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={loading || extensions.length === 0}
        className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400 disabled:opacity-60"
      >
        {loading ? 'Adding…' : 'Add DID → extension'}
      </button>
      {error ? <p className="sm:col-span-2 text-sm text-rose-400">{error}</p> : null}
    </form>
  );
}
