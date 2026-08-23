interface PaginationProps {
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export function Pagination({ hasNextPage, hasPrevPage, onNext, onPrev }: PaginationProps) {
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
      <button onClick={onPrev} disabled={!hasPrevPage}>
        ← Anterior
      </button>
      <button onClick={onNext} disabled={!hasNextPage}>
        Siguiente →
      </button>
    </div>
  );
}
