'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function CreateTrunkForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [maxChannels, setMaxChannels] = useState('10');
  const [maxCps, setMaxCps] = useState('5');
  const [ipAcl, setIpAcl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/wholesale/trunks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          authType: ipAcl ? 'BOTH' : 'USERPASS',
          ipAcl: ipAcl || undefined,
          maxChannels: Number(maxChannels),
          maxCps: Number(maxCps),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to create trunk');
      setName('');
      setIpAcl('');
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
      className="mb-4 grid gap-3 rounded-xl border bg-card p-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end"
    >
      <div className="grid gap-1.5">
        <Label htmlFor="trunk-name">Trunk name</Label>
        <Input
          id="trunk-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="ip-acl">IP ACL</Label>
        <Input
          id="ip-acl"
          placeholder="Optional"
          value={ipAcl}
          onChange={(e) => setIpAcl(e.target.value)}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="max-ch">Max channels</Label>
        <Input
          id="max-ch"
          value={maxChannels}
          onChange={(e) => setMaxChannels(e.target.value)}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="max-cps">Max CPS</Label>
        <Input
          id="max-cps"
          value={maxCps}
          onChange={(e) => setMaxCps(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Creating…' : 'Create trunk'}
      </Button>
      {error ? (
        <p className="text-sm text-destructive sm:col-span-2 lg:col-span-5">
          {error}
        </p>
      ) : null}
    </form>
  );
}
