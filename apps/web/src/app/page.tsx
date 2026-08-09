import Link from 'next/link';
import { APP_NAME, ROLE_PORTAL_PATH } from '@iswitch/shared';
import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  RadioTower,
  ShieldCheck,
  Waves,
} from 'lucide-react';

const TRAFFIC = [28, 42, 35, 56, 48, 70, 62, 76, 58, 88, 72, 94, 82, 68, 84, 78, 96, 88, 74, 92, 86, 100, 82, 94];

export default async function HomePage() {
  const user = await getSessionUser();
  if (user) redirect(ROLE_PORTAL_PATH[user.role]);

  return (
    <main className="signal-landing">
      <nav className="landing-nav">
        <div className="landing-logo"><span><Activity size={17} /></span>{APP_NAME}<small>Signal OS</small></div>
        <div className="landing-status"><i /> Global network operational</div>
      </nav>
      <section className="landing-hero">
        <div className="hero-copy">
          <div className="eyebrow"><Waves size={14} /> Carrier-grade control plane</div>
          <h1>Every call.<br /><em>Under control.</em></h1>
          <p>One intelligent command center for retail PBX, wholesale SIP, routing, billing, fraud prevention, and live network operations.</p>
          <div className="hero-actions">
            <Button asChild size="lg"><Link href="/login">Enter command center <ArrowUpRight /></Link></Button>
            <span><ShieldCheck size={15} /> Role-secured operations</span>
          </div>
        </div>
        <div className="hero-console" aria-label="Network status preview">
          <div className="console-head"><span><i /> LIVE SIGNAL</span><span>UTC +05:00</span></div>
          <div className="console-grid">
            <div className="console-stat hero-stat"><small>ACTIVE CALLS</small><strong>2,847</strong><span>+12.4% <ArrowUpRight size={13} /></span></div>
            <div className="console-stat"><small>ASR</small><strong>64.8%</strong><span className="positive">Healthy</span></div>
            <div className="console-stat"><small>AVG. PDD</small><strong>1.2s</strong><span className="positive">Optimal</span></div>
            <div className="signal-chart"><div className="chart-label"><span>Traffic pulse</span><span>Last 60 min</span></div><div className="signal-bars">{TRAFFIC.map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div></div>
          </div>
          <div className="console-foot"><span><CheckCircle2 size={14} /> 18 routes healthy</span><span><RadioTower size={14} /> 42 trunks online</span></div>
        </div>
      </section>
      <footer className="landing-foot"><span>Built for operators who cannot miss a signal.</span><span>Retail PBX · Wholesale SIP · Real-time billing</span></footer>
    </main>
  );
}
