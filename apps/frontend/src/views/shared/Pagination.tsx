import { Button } from "@/components/ui";

interface PaginationProps {
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export function Pagination({ hasNextPage, hasPrevPage, onNext, onPrev }: PaginationProps) {
  return (
    <div className="mt-4 flex gap-2">
      <Button variant="secondary" size="sm" onClick={onPrev} disabled={!hasPrevPage}>
        ← Anterior
      </Button>
      <Button variant="secondary" size="sm" onClick={onNext} disabled={!hasNextPage}>
        Siguiente →
      </Button>
    </div>
  );
}
