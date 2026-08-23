export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-control border border-dashed border-border bg-surface px-4 py-10 text-center text-sm text-text-muted">
      {message}
    </div>
  );
}
