import Link from 'next/link';
import { Activity, ArrowUpRight, RadioTower, ShieldCheck } from 'lucide-react';

const PULSE = [32, 40, 35, 48, 44, 62, 55, 70, 64, 82, 69, 88, 77, 91, 73, 86, 80, 96, 84, 92, 76, 98, 87, 94, 82, 100, 89, 95];

type SignalMetric = { label: string; value: string | number; detail?: string };

export function SignalCommand({ eyebrow, title, description, primaryLabel, primaryValue, primaryDetail, metrics, healthy = true, href, actionLabel = 'Open console' }: {
  eyebrow: string; title: string; description: string; primaryLabel: string;
  primaryValue: string | number; primaryDetail: string; metrics: SignalMetric[];
  healthy?: boolean; href: string; actionLabel?: string;
}) {
  return (
    <section className={`signal-command${healthy ? '' : ' degraded'}`}>
      <div className="command-copy">
        <div className="command-eyebrow"><RadioTower size={14} /> {eyebrow}</div>
        <h3>{title}</h3>
        <p>{description}</p>
        <Link href={href} className="command-action">{actionLabel}<ArrowUpRight size={15} /></Link>
      </div>
      <div className="command-data">
        <div className="command-primary">
          <div className="command-label"><span>{primaryLabel}</span><span className="command-live"><i /> LIVE</span></div>
          <strong>{primaryValue}</strong>
          <span className={healthy ? 'positive' : 'negative'}>{healthy ? <ShieldCheck size={14} /> : <Activity size={14} />}{primaryDetail}</span>
        </div>
        <div className="command-pulse">
          <div className="pulse-head"><span>Network pulse</span><span>60 MIN</span></div>
          <div className="pulse-bars">{PULSE.map((height, index) => <i key={index} style={{ height: `${height}%`, animationDelay: `${index * 18}ms` }} />)}</div>
          <div className="pulse-baseline"><span>-60m</span><span>Now</span></div>
        </div>
        <div className="command-metrics">
          {metrics.map((metric) => <div key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong>{metric.detail ? <small>{metric.detail}</small> : null}</div>)}
        </div>
      </div>
    </section>
  );
}
