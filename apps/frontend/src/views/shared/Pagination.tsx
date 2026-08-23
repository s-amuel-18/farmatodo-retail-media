import { useState } from "react";
import { Button } from "@/components/ui";

interface PaginationProps {
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export function Pagination({ hasNextPage, hasPrevPage, onNext, onPrev }: PaginationProps) {
  const [announcement, setAnnouncement] = useState("");

  return (
    <nav aria-label="Paginación" className="mt-4 flex items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          onPrev();
          setAnnouncement("Mostrando página anterior.");
        }}
        disabled={!hasPrevPage}
      >
        <span aria-hidden="true">←</span> Anterior
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          onNext();
          setAnnouncement("Mostrando página siguiente.");
        }}
        disabled={!hasNextPage}
      >
        Siguiente <span aria-hidden="true">→</span>
      </Button>
      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </nav>
  );
}
