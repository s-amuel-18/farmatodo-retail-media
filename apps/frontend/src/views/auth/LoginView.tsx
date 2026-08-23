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
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 360 }}>
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>Retail Media</h1>
        <p style={{ color: "#555", marginBottom: 24 }}>Farmatodo — gestión de campañas</p>

        {pendingAccess ? (
          <div>
            <p style={{ marginBottom: 16 }}>
              Tu cuenta todavía no tiene un rol asignado. Contacta al administrador para que te
              habilite el acceso.
            </p>
            <button onClick={onSignOut}>Cerrar sesión</button>
          </div>
        ) : (
          <>
            <button onClick={onSignIn} disabled={isLoading} style={{ padding: "10px 20px" }}>
              {isLoading ? "Ingresando..." : "Ingresar con Google"}
            </button>
            {error ? <p style={{ color: "#c0392b", marginTop: 12 }}>{error}</p> : null}
          </>
        )}
      </div>
    </main>
  );
}
