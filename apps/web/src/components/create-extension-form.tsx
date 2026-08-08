'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
      className="mb-4 grid gap-3 rounded-xl border bg-card p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
    >
      <div className="grid gap-1.5">
        <Label htmlFor="ext-number">Extension</Label>
        <Input
          id="ext-number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="ext-name">Display name</Label>
        <Input
          id="ext-name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Adding…' : 'Add'}
      </Button>
      {error ? (
        <p className="text-sm text-destructive sm:col-span-3">{error}</p>
      ) : null}
    </form>
  );
}
