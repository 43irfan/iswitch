import { APP_NAME, ROLE_PORTAL_PATH } from '@iswitch/shared';
import { LoginForm } from '@/components/login-form';
import { ThemeSwitch } from '@/components/theme-provider';
import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect(ROLE_PORTAL_PATH[user.role]);

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background p-6">
      <div className="absolute top-4 right-4">
        <ThemeSwitch />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="text-sm font-semibold tracking-tight">
            {APP_NAME}{' '}
            <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
              NOC
            </span>
          </p>
          <CardTitle>Operator sign-in</CardTitle>
          <CardDescription>
            Role-scoped portals · session cookie auth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <div className="mt-5 border-t pt-4">
            <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              Demo accounts
            </p>
            <ul className="mt-2 space-y-1 font-mono text-xs text-muted-foreground">
              <li>admin@iswitch.local</li>
              <li>reseller@iswitch.local</li>
              <li>retail@iswitch.local</li>
              <li>wholesale@iswitch.local</li>
              <li>user@iswitch.local</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
