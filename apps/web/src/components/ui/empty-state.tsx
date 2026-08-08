import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="border-dashed">
      <CardHeader className="items-center text-center">
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
        {action ? <div className="pt-2">{action}</div> : null}
      </CardHeader>
    </Card>
  );
}

export function EmptyStateButton(props: React.ComponentProps<typeof Button>) {
  return <Button {...props} />;
}
