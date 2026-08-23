interface AppHeaderProps {
  email: string;
  roleLabel: string;
  onSignOut: () => void;
}

export function AppHeader({ email, roleLabel, onSignOut }: AppHeaderProps) {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 24px",
        borderBottom: "1px solid #e5e7eb",
        background: "#fff",
      }}
    >
      <strong>Retail Media — Farmatodo</strong>
      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14 }}>
        <span style={{ color: "#555" }}>
          {email} · {roleLabel}
        </span>
        <button onClick={onSignOut}>Cerrar sesión</button>
      </div>
    </header>
  );
}
