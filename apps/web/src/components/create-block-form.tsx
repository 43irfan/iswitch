'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    <form
      onSubmit={onSubmit}
      className="mb-4 grid gap-3 rounded-xl border bg-card p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
    >
      <div className="grid gap-1.5">
        <Label htmlFor="prefix">Prefix</Label>
        <Input
          id="prefix"
          className="font-mono"
          placeholder="1900"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="reason">Reason</Label>
        <Input
          id="reason"
          placeholder="Optional"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Adding…' : 'Add block'}
      </Button>
      {error ? (
        <p className="text-sm text-destructive sm:col-span-3">{error}</p>
      ) : null}
    </form>
  );
}
