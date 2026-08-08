import { EmptyState } from './empty-state';

export function DataTable({
  columns,
  rows,
  emptyTitle = 'No rows',
  emptyDescription,
  emptyAction,
}: {
  columns: string[];
  rows: React.ReactNode[];
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}
