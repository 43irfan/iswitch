import { APP_NAME, ROLE_PORTAL_PATH } from '@iswitch/shared';
import { LoginForm } from '@/components/login-form';
import { ThemeSwitch } from '@/components/theme-provider';
import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect(ROLE_PORTAL_PATH[user.role]);

  return (
    <main className="auth-stage">
      <div style={{ position: 'absolute', top: 16, right: 16 }}>
        <ThemeSwitch />
      </div>
      <div className="auth-card">
        <div className="brand">
          {APP_NAME}
          <span>NOC</span>
        </div>
        <h1>Operator sign-in</h1>
        <p className="lede">Role-scoped portals · session cookie auth</p>
        <LoginForm />
        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid var(--border)',
          }}
        >
          <p className="faint" style={{ margin: 0, fontSize: 11, fontWeight: 700 }}>
            DEMO ACCOUNTS
          </p>
          <ul
            className="mono"
            style={{
              margin: '8px 0 0',
              padding: 0,
              listStyle: 'none',
              color: 'var(--text-muted)',
              lineHeight: 1.7,
            }}
          >
            <li>admin@iswitch.local</li>
            <li>reseller@iswitch.local</li>
            <li>retail@iswitch.local</li>
            <li>wholesale@iswitch.local</li>
            <li>user@iswitch.local</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
