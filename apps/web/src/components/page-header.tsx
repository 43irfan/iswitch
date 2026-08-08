type PageHeaderProps = {
  title: string;
  description?: string;
  kicker?: string;
};

export function PageHeader({ title, description, kicker }: PageHeaderProps) {
  return (
    <header className="mb-7">
      {kicker ? <p className="page-kicker">{kicker}</p> : null}
      <h2 className="page-title mt-1">{title}</h2>
      {description ? <p className="page-lede">{description}</p> : null}
    </header>
  );
}
