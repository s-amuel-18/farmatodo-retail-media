export function LoadingState({ message = "Cargando..." }: { message?: string }) {
  return (
    <div className="flex items-center gap-2 py-6 text-sm text-text-muted">
      <span
        className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-brand-blue-600"
        aria-hidden="true"
      />
      {message}
    </div>
  );
}
