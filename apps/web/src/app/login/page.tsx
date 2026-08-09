import { APP_NAME, ROLE_PORTAL_PATH } from '@iswitch/shared';
import { LoginForm } from '@/components/login-form';
import { ThemeSwitch } from '@/components/theme-provider';
import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, CheckCircle2, LockKeyhole, RadioTower, ShieldCheck } from 'lucide-react';

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect(ROLE_PORTAL_PATH[user.role]);

  return (
    <main className="login-stage">
      <div className="login-theme"><ThemeSwitch /></div>
      <section className="login-context">
        <div className="landing-logo"><span><Activity size={17} /></span>{APP_NAME}<small>Signal OS</small></div>
        <div>
          <div className="eyebrow"><RadioTower size={14} /> Secure operator access</div>
          <h1>Your network never sleeps.<br /><em>Neither does Signal.</em></h1>
          <p>Monitor calls, route traffic, protect margins, and resolve incidents from one role-aware command center.</p>
        </div>
        <div className="login-assurances"><span><CheckCircle2 /> Encrypted sessions</span><span><ShieldCheck /> Scoped access control</span><span><LockKeyhole /> Audited operations</span></div>
      </section>
      <Card className="login-card">
        <CardHeader>
          <p className="login-card-kicker">CONTROL PLANE ACCESS</p>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to your secure iSwitch workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <details className="demo-accounts">
            <summary>View demo accounts</summary>
            <ul>
              <li>admin@iswitch.local</li><li>reseller@iswitch.local</li><li>retail@iswitch.local</li><li>wholesale@iswitch.local</li><li>user@iswitch.local</li>
            </ul>
          </details>
        </CardContent>
      </Card>
    </main>
  );
}
