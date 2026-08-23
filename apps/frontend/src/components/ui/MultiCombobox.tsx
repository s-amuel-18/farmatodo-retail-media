"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { CONTROL_CLASSES } from "./controls";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface MultiComboboxProps {
  options: ComboboxOption[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  /** Shown instead of the search input when disabled — e.g. "select a brand first". */
  emptyMessage?: string;
  disabled?: boolean;
}

/**
 * Searchable multi-select with removable chips, replacing a bare `<select multiple>`.
 * Selection survives a stray click (nothing collapses to one item), the current picks
 * are always visible as chips, and a long catalog stays usable via type-to-filter.
 */
export function MultiCombobox({ options, value, onChange, placeholder, emptyMessage, disabled }: MultiComboboxProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const selected = useMemo(() => options.filter((o) => value.includes(o.value)), [options, value]);
  const filtered = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase())),
    [options, query],
  );

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query, isOpen]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function toggleOption(optionValue: string) {
    onChange(
      value.includes(optionValue) ? value.filter((v) => v !== optionValue) : [...value, optionValue],
    );
  }

  function removeChip(optionValue: string, event: React.MouseEvent) {
    event.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (isOpen && filtered[highlightedIndex]) toggleOption(filtered[highlightedIndex].value);
    } else if (event.key === "Escape") {
      setIsOpen(false);
      setQuery("");
    } else if (event.key === "Backspace" && query === "" && selected.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        className={clsx(
          CONTROL_CLASSES,
          "flex min-h-10 flex-wrap items-center gap-1.5 py-1.5",
          disabled && "cursor-not-allowed bg-canvas",
        )}
        onClick={() => !disabled && inputRef.current?.focus()}
      >
        {selected.map((option) => (
          <span
            key={option.value}
            className="inline-flex items-center gap-1 rounded-pill bg-navy-100 py-0.5 pl-2.5 pr-1 text-xs font-medium text-navy-900"
          >
            {option.label}
            <button
              type="button"
              aria-label={`Quitar ${option.label}`}
              onClick={(event) => removeChip(option.value, event)}
              disabled={disabled}
              className="rounded-full p-0.5 text-navy-700 transition-colors hover:bg-navy-900/10 hover:text-navy-900"
            >
              <svg viewBox="0 0 12 12" aria-hidden="true" className="h-3 w-3">
                <path
                  d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </span>
        ))}
        {disabled ? (
          <span className="px-1 text-sm text-text-muted">{emptyMessage}</span>
        ) : (
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={listId}
            aria-autocomplete="list"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={selected.length === 0 ? placeholder : undefined}
            className="min-w-24 flex-1 bg-transparent text-sm text-ink placeholder:text-text-muted focus:outline-none"
          />
        )}
      </div>

      {isOpen && !disabled ? (
        <ul
          id={listId}
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-control border border-border bg-surface py-1"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-text-muted">Sin resultados.</li>
          ) : (
            filtered.map((option, index) => {
              const isSelected = value.includes(option.value);
              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => toggleOption(option.value)}
                  className={clsx(
                    "flex cursor-pointer items-center justify-between px-3 py-1.5 text-sm",
                    index === highlightedIndex ? "bg-brand-blue-50 text-navy-900" : "text-ink",
                  )}
                >
                  {option.label}
                  {isSelected ? (
                    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-brand-blue-700">
                      <path
                        d="M3.5 8.5L6.5 11.5L12.5 4.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : null}
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}
