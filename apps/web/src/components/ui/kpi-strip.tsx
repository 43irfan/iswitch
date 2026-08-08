export type KpiItem = {
  label: string;
  value: string | number;
  hint?: string;
  hero?: boolean;
};

export function KpiStrip({ items }: { items: KpiItem[] }) {
  return (
    <div className="kpi-strip">
      {items.map((item) => (
        <div key={item.label} className={`kpi${item.hero ? ' hero' : ''}`}>
          <p className="label">{item.label}</p>
          <p className="value">{item.value}</p>
          {item.hint ? <p className="hint">{item.hint}</p> : null}
        </div>
      ))}
    </div>
  );
}
