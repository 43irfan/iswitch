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
    <form onSubmit={onSubmit} className="panel mt-6 grid gap-3 p-4 sm:grid-cols-2">
      <div className="field">
        <label htmlFor="trunk-name">Trunk name</label>
        <input
          id="trunk-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="ip-acl">IP ACL</label>
        <input
          id="ip-acl"
          placeholder="Comma-separated, optional"
          value={ipAcl}
          onChange={(e) => setIpAcl(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="max-ch">Max channels</label>
        <input
          id="max-ch"
          value={maxChannels}
          onChange={(e) => setMaxChannels(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="max-cps">Max CPS</label>
        <input
          id="max-cps"
          value={maxCps}
          onChange={(e) => setMaxCps(e.target.value)}
        />
      </div>
      <button type="submit" disabled={loading} className="btn-primary sm:col-span-2">
        {loading ? 'Creating…' : 'Create SIP trunk'}
      </button>
      {error ? (
        <p className="sm:col-span-2 text-sm text-[var(--danger)]">{error}</p>
      ) : null}
    </form>
  );
}
