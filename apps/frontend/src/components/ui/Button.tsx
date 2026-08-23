import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  // blue-700, not the lighter blue-600 swatch: white text on blue-600 only reaches 3.4:1 (fails 4.5:1 body-text contrast).
  primary: "bg-brand-blue-700 text-white hover:bg-brand-blue-800 disabled:bg-navy-100 disabled:text-text-muted",
  secondary:
    "bg-surface text-navy-900 border border-border hover:border-navy-700 disabled:text-text-muted disabled:hover:border-border",
  ghost: "bg-transparent text-navy-900 hover:bg-navy-100 disabled:text-text-muted disabled:hover:bg-transparent",
  danger: "bg-danger-600 text-white hover:bg-danger-600/90 disabled:bg-navy-100 disabled:text-text-muted",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
};

/**
 * Shared with any link that must look like a button (e.g. Next.js `<Link>`)
 * so styling stays on one recipe without nesting a <button> inside an <a>.
 */
export function buttonClassName(variant: ButtonVariant = "secondary", size: ButtonSize = "md", className?: string) {
  return clsx(
    "inline-flex items-center justify-center gap-2 rounded-control font-medium transition-colors disabled:cursor-not-allowed",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", className, ...props },
  ref,
) {
  return <button ref={ref} className={buttonClassName(variant, size, className)} {...props} />;
});
