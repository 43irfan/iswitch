'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

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
      className="mt-6 grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:grid-cols-2"
    >
      <input
        placeholder="Trunk name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
        required
      />
      <input
        placeholder="IP ACL (comma-separated, optional)"
        value={ipAcl}
        onChange={(e) => setIpAcl(e.target.value)}
        className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
      />
      <input
        placeholder="Max channels"
        value={maxChannels}
        onChange={(e) => setMaxChannels(e.target.value)}
        className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
      />
      <input
        placeholder="Max CPS"
        value={maxCps}
        onChange={(e) => setMaxCps(e.target.value)}
        className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="sm:col-span-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400 disabled:opacity-60"
      >
        {loading ? 'Creating…' : 'Create SIP trunk'}
      </button>
      {error ? <p className="sm:col-span-2 text-sm text-rose-400">{error}</p> : null}
    </form>
  );
}
