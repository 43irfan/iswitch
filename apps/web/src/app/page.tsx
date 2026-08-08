import { APP_NAME } from '@iswitch/shared';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function fetchHealth() {
  try {
    const res = await fetch(`${apiUrl}/health`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as {
      status: string;
      database?: string;
      timestamp?: string;
    };
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const health = await fetchHealth();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
          Phase 1 · Foundation
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight">{APP_NAME}</h1>
        <p className="mt-4 max-w-xl text-lg text-zinc-400">
          Class 5 control plane shell. Portals talk to the NestJS API; PostgreSQL is
          the source of truth; Asterisk sync comes later.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <h2 className="text-sm font-medium text-zinc-300">API</h2>
            <p className="mt-2 font-mono text-sm text-zinc-500">{apiUrl}</p>
            <p className="mt-4 text-sm">
              Health:{' '}
              <span className={health?.status === 'ok' ? 'text-emerald-400' : 'text-amber-400'}>
                {health?.status ?? 'unreachable'}
              </span>
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Database: {health?.database ?? 'n/a'}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <h2 className="text-sm font-medium text-zinc-300">Next</h2>
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-zinc-400">
              <li>Phase 2 — Auth & tenancy</li>
              <li>Role-based portal shells</li>
              <li>Retail / wholesale modules</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
