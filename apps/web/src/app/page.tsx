import Link from 'next/link';
import { APP_NAME, ROLE_PORTAL_PATH } from '@iswitch/shared';
import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const user = await getSessionUser();
  if (user) redirect(ROLE_PORTAL_PATH[user.role]);

  return (
    <main className="landing-stage">
      <p className="brand">{APP_NAME}</p>
      <p className="lede">
        Softswitch NOC for retail PBX and wholesale SIP — status, balance
        alerts, routing, and CDRs on one control plane.
      </p>
      <div className="landing-actions">
        <Link href="/login" className="btn btn-primary">
          Open NOC
        </Link>
        <span className="muted" style={{ fontSize: 12 }}>
          Light · Dark · Auto themes
        </span>
      </div>
    </main>
  );
}
