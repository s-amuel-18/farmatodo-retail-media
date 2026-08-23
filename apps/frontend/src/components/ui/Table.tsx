import type { TdHTMLAttributes, ThHTMLAttributes, HTMLAttributes } from "react";
import clsx from "clsx";

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  caption?: string;
}

export function Table({ className, caption, children, ...props }: TableProps) {
  return (
    <table className={clsx("w-full border-collapse text-sm text-ink", className)} {...props}>
      {caption ? <caption className="sr-only">{caption}</caption> : null}
      {children}
    </table>
  );
}

export function TableHead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={clsx("border-b border-border text-left", className)} {...props} />;
}

export function TableBody(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={clsx("border-b border-border last:border-0 hover:bg-canvas", className)} {...props} />;
}

export function Th({ className, scope = "col", ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope={scope}
      className={clsx("px-3 py-2 text-xs font-semibold uppercase tracking-wide text-text-muted", className)}
      {...props}
    />
  );
}

export function Td({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={clsx("px-3 py-2.5 align-middle", className)} {...props} />;
}
