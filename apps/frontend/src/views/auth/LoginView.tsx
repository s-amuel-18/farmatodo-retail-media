import { BrandLogo } from "@/components/BrandLogo";
import { Button, Card, ErrorText } from "@/components/ui";

interface LoginViewProps {
  isLoading: boolean;
  pendingAccess: boolean;
  error: string | null;
  onSignIn: () => void;
  onSignOut: () => void;
}

export function LoginView({ isLoading, pendingAccess, error, onSignIn, onSignOut }: LoginViewProps) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex min-h-screen items-center justify-center bg-canvas px-4 outline-none"
    >
      <Card className="w-full max-w-sm text-center shadow-float">
        <BrandLogo className="mx-auto mb-6 h-8 w-auto" />
        <h1 className="mb-1 text-xl font-semibold text-ink">Retail Media</h1>
        <p className="mb-6 text-sm text-text-muted">Farmatodo — gestión de campañas</p>

        {pendingAccess ? (
          <div>
            <p className="mb-4 text-sm text-ink">
              Tu cuenta todavía no tiene un rol asignado. Contacta al administrador para que te
              habilite el acceso.
            </p>
            <Button variant="secondary" onClick={onSignOut} className="w-full">
              Cerrar sesión
            </Button>
          </div>
        ) : (
          <>
            <Button variant="primary" onClick={onSignIn} disabled={isLoading} className="w-full">
              {isLoading ? "Ingresando..." : "Ingresar con Google"}
            </Button>
            {error ? <ErrorText>{error}</ErrorText> : null}
          </>
        )}
      </Card>
    </main>
  );
}
