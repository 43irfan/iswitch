import Link from 'next/link';
import { APP_NAME, ROLE_PORTAL_PATH } from '@iswitch/shared';
import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  const user = await getSessionUser();
  if (user) redirect(ROLE_PORTAL_PATH[user.role]);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        {APP_NAME}
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Softswitch NOC for retail PBX and wholesale SIP — status, balance
        alerts, routing, and CDRs.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Button asChild>
          <Link href="/login">Open NOC</Link>
        </Button>
        <span className="text-xs text-muted-foreground">
          shadcn/ui · Rhea · Light/Dark/Auto
        </span>
      </div>
    </main>
  );
}
