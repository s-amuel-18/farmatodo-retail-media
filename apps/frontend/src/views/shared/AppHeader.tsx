import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui";

interface AppHeaderProps {
  email: string;
  roleLabel: string;
  onSignOut: () => void;
}

export function AppHeader({ email, roleLabel, onSignOut }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 bg-navy-900 px-6 py-3 text-white">
      <div className="flex items-center gap-3">
        <BrandLogo className="h-6 w-auto brightness-0 invert" />
        <span className="hidden text-sm font-medium text-navy-100 sm:inline">Retail Media</span>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="text-navy-100">
          {email} · {roleLabel}
        </span>
        <Button variant="ghost" size="sm" onClick={onSignOut} className="text-white hover:bg-white/10">
          Cerrar sesión
        </Button>
      </div>
    </header>
  );
}
