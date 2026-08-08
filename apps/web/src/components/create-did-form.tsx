'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DidDestinationType } from '@iswitch/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
      className="mb-4 grid gap-3 rounded-xl border bg-card p-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
    >
      <div className="grid gap-1.5">
        <Label htmlFor="did-number">DID</Label>
        <Input
          id="did-number"
          placeholder="+1555…"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="did-desc">Description</Label>
        <Input
          id="did-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="did-dest">Extension</Label>
        <select
          id="did-dest"
          className="flex h-8 w-full rounded-2xl border border-input bg-transparent px-3 text-sm outline-none"
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
      <Button type="submit" disabled={loading || extensions.length === 0}>
        {loading ? 'Adding…' : 'Add DID'}
      </Button>
      {error ? (
        <p className="text-sm text-destructive sm:col-span-2 lg:col-span-4">
          {error}
        </p>
      ) : null}
    </form>
  );
}
