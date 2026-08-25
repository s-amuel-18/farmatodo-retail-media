import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { Button, ThemeToggle } from "@/components/ui";

interface AppHeaderProps {
  email: string;
  roleLabel: string;
  homeHref: string;
  onSignOut: () => void;
}

export function AppHeader({ email, roleLabel, homeHref, onSignOut }: AppHeaderProps) {
  return (
    <header className="bg-navy-900 px-6 py-3 text-white">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4">
        <Link href={homeHref} className="flex min-w-0 shrink-0 items-center gap-3">
          <BrandLogo className="h-6 w-auto shrink-0 brightness-0 invert" />
          <span className="hidden text-sm font-medium text-navy-100 sm:inline">Retail Media</span>
        </Link>
        <div className="flex min-w-0 items-center gap-4 text-sm">
          <span className="min-w-0 max-w-[45vw] truncate text-navy-100 sm:max-w-none">
            {email} · {roleLabel}
          </span>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={onSignOut}
            className="shrink-0 text-white hover:bg-white/10"
          >
            Cerrar sesión
          </Button>
        </div>
      </div>
    </header>
  );
}
