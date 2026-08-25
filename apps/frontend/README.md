# Frontend — Farmatodo Retail Media

Cliente web construido con **Next.js (App Router) + TypeScript estricto**, arquitectura **MVVM**
(Vista / hook-ViewModel / Service) y **Tailwind CSS v4**, que implementa las bandejas de campañas
del analista comercial y las de aprobación del gerente, con un formulario dinámico que cambia según
el canal de medio elegido.

Este documento cubre en detalle el frontend. Para la visión general del monorepo (stack completo,
puesta en marcha conjunta, máquina de estados, seguridad en tres capas y deuda técnica) ver el
[README de la raíz](../../README.md). Para el modelo de dominio compartido con el backend, ver
[packages/types/README.md](../../packages/types/README.md). Para la API consumida, ver
[apps/backend/README.md](../backend/README.md).

## Stack y dependencias

- **Next.js** 14.2 (App Router), **React** 18.3, **TypeScript** 5.6 estricto (heredado de
  `tsconfig.base.json` de la raíz: `strict`, `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`, `noImplicitOverride`), alias `@/*` → `src/*`.
- **`@tanstack/react-query`** 5.59 — cache y sincronización de datos del servidor (queries y
  mutaciones), invalidación de cache tras cada acción de escritura.
- **`react-hook-form`** 7.53 — estado y validación del formulario de campañas.
- **`firebase`** 10.14 (client SDK) — Authentication (Google Sign-In) y Firestore (lectura directa
  de catálogos de referencia).
- **`zod`** 3.23 — mismos esquemas de `@farmatodo-retail-media/types` usados por el backend, para
  validar el formulario antes de enviarlo.
- **Tailwind CSS v4** (`@tailwindcss/postcss`) — sin `tailwind.config.js`; toda la configuración de
  theme vive en `src/app/globals.css` mediante el bloque `@theme` (config CSS-first de Tailwind v4).
- **Jest** 29 + `@testing-library/react` 16 + `jest-environment-jsdom` — testing.
- `next.config.js` declara `transpilePackages: ["@farmatodo-retail-media/types"]` (necesario porque
  el paquete compartido se consume como fuente TS sin build propio) y `reactStrictMode: true`.

## Scripts

Ejecutar con `pnpm --filter frontend <script>` desde la raíz, o directamente en `apps/frontend`:

| Script | Comando | Descripción |
|---|---|---|
| `dev` | `next dev` | Servidor de desarrollo. |
| `build` | `next build` | Build de producción. |
| `start` | `next start` | Sirve el build de producción. |
| `lint` | `next lint` | Lint (puede pedir configuración interactiva la primera vez, ya que no hay `.eslintrc*` propio en el proyecto). |
| `test` | `jest` | Corre toda la suite de tests. |
| `test:watch` | `jest --watch` | Tests en modo watch. |

## Variables de entorno

Archivo `apps/frontend/.env.local` (no versionado, ver `.env.local.example`):

```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FB_API_KEY=<Web API key del proyecto>
NEXT_PUBLIC_FB_AUTH_DOMAIN=<project-id>.firebaseapp.com
NEXT_PUBLIC_FB_PROJECT_ID=<project-id>
NEXT_PUBLIC_FB_APP_ID=<app id de la Web App>
```

- `NEXT_PUBLIC_API_URL`: base URL del backend NestJS (default `http://localhost:3001` si no está
  definida). Usada en `services/api-client.ts`.
- `NEXT_PUBLIC_FB_*`: configuración pública del proyecto de Firebase (`lib/firebase-client.ts`),
  obtenida registrando una Web App en Firebase Console → Project settings → General → Your apps.
  No hay `measurementId`/`storageBucket`/`messagingSenderId` (no se usan Analytics/Storage/Messaging).

Todo el frontend es cliente puro respecto a configuración: no hay ninguna variable de entorno
server-side.

## Puesta en marcha

```bash
pnpm install
pnpm --filter frontend dev       # http://localhost:3000
```

Requiere el backend corriendo (o al menos accesible en `NEXT_PUBLIC_API_URL`) y un usuario con rol
asignado (ver "Asignar rol a un usuario" en el [README raíz](../../README.md)).

## Arquitectura MVVM

```
src/
├── middleware.ts        # redirección por rol vía cookies (edge, solo UX)
├── app/                  # routing puro (App Router) — sin lógica de negocio
├── views/                # componentes presentacionales — reciben todo por props
├── view-models/          # hooks: dueños del estado de cada pantalla (React Query + estado local)
├── services/             # única capa que habla con el backend/Firebase
├── lib/                   # utilidades transversales (init de Firebase, vocabulario ES, rutas por rol)
└── components/           # UI genérica reutilizable, sin conocimiento de dominio
```

- **`app/`**: solo routing y layout. `layout.tsx` (`<html lang="es">`, script inline anti-flash de
  tema, skip-link, `<Providers>`), `providers.tsx` compone
  `ThemeProvider > QueryClientProvider > ToastProvider > SessionProvider`.
- **`views/`**: componentes presentacionales puros; no llaman `useQuery`/`useMutation` directamente
  (salvo estado de UI local como modales), reciben datos y callbacks por props desde su
  view-model.
- **`view-models/`**: hooks que son los "dueños" del estado de cada pantalla, combinando React
  Query con estado local (filtros, formularios, paginación).
- **`services/`**: única capa que conoce `fetch`/Firebase; nada fuera de `services/` llama
  directamente a la API o al SDK de Firebase.

### Rutas (App Router)

| Ruta | Página | Rol | Notas |
|---|---|---|---|
| `/` | `app/page.tsx` | — | Sin UI propia: redirige a `/login` o a la home del rol. |
| `/login` | `app/login/page.tsx` | público | Login con Google; si ya hay sesión con rol, redirige automáticamente a la home. |
| `/campaigns` | `(protected)/campaigns/page.tsx` | `COMMERCIAL_ANALYST` | Bandeja de campañas del analista. |
| `/campaigns/new` | `(protected)/campaigns/new/page.tsx` | `COMMERCIAL_ANALYST` | Alta de campaña (formulario dinámico). |
| `/campaigns/:id` | `(protected)/campaigns/[id]/page.tsx` | `COMMERCIAL_ANALYST` | Detalle de campaña (vista del propio analista, sin acciones de aprobación). |
| `/campaigns/:id/edit` | `(protected)/campaigns/[id]/edit/page.tsx` | `COMMERCIAL_ANALYST` | Edición (solo si el estado es `DRAFT` o `REJECTED`). |
| `/approvals` | `(protected)/approvals/page.tsx` | `APPROVER_MANAGER` | Bandeja de aprobación del gerente. |
| `/approvals/:id` | `(protected)/approvals/[id]/page.tsx` | `APPROVER_MANAGER` | Mismo `CampaignDetailView`, con acciones de aprobar/rechazar. |

El grupo de rutas `(protected)` está envuelto por `(protected)/layout.tsx`, que exige sesión
(redirige a `/login` si no hay usuario) y renderiza `AppHeader` (email, rol, cerrar sesión, toggle
de tema).

**`middleware.ts`** (`matcher: ["/campaigns/:path*", "/approvals/:path*"]`): lee dos cookies
**no-httpOnly** (`session`, `role`). Sin `session` → redirige a `/login`. Rol no autorizado para el
prefijo de ruta (`/approvals` requiere `APPROVER_MANAGER`, `/campaigns` no admite
`APPROVER_MANAGER`) → redirige a la home del otro rol. Esto es **exclusivamente conveniencia de
UX** — la autorización real vive en `FirebaseAuthGuard`/`RolesGuard` del backend y en
`firestore.rules`; la cookie nunca se trata como prueba de identidad.

### Autenticación

- **Login**: `authService.signInWithGoogle()` usa `signInWithPopup` + `GoogleAuthProvider` de
  Firebase Auth, invocado desde el hook `useLogin`.
- **Rol**: no viene de Firestore, sino del **custom claim** del ID token
  (`getIdTokenResult().claims.role`). Si no hay claim, `role` es `null` (estado "pendiente de
  acceso" en `LoginView`).
- **Sesión reactiva**: `authService.onSessionChanged` usa `onIdTokenChanged` (dispara en login,
  logout y cada refresh de token). `SessionProvider` se suscribe una sola vez y expone
  `useSession()` (`user`, `isLoading`, `actions.signInWithGoogle/signOut`).
- **Token en cada request a la API**: `apiClient` obtiene el ID token vía
  `authService.getIdToken()` y lo inyecta como `Authorization: Bearer <token>`.
- **Cookie de rol**: en cada cambio de sesión, `syncSessionCookies(user)` escribe/borra las cookies
  `session`/`role` que lee `middleware.ts`.
- **Logout**: `signOut(firebaseAuth)` + `queryClient.clear()` (no deja datos cacheados de
  campañas/aprobaciones tras cerrar sesión).

### Servicios (`src/services`)

| Servicio | Responsabilidad |
|---|---|
| `api-client.ts` | Wrapper de `fetch` (`get`/`post`/`patch`) con base `NEXT_PUBLIC_API_URL`, inyecta el Bearer token, lanza `ApiError` (con `status`/`message`) si `!response.ok`, devuelve `undefined` en `204`. |
| `auth.service.ts` | Firebase Auth: login con Google, sesión, logout. No llama al backend. |
| `campaigns.service.ts` | `create` (`POST /campaigns`), `update` (`PATCH /campaigns/:id`), `get` (`GET /campaigns/:id`), `list` (`GET /campaigns`), `submit` (`POST /campaigns/:id/submit`), `estimateCost` (`GET /campaigns/cost-estimate`). |
| `approvals.service.ts` | `approve` (`POST /campaigns/:id/approve`), `reject` (`POST /campaigns/:id/reject` con `{comment}`). |
| `reference-data.service.ts` | **No pasa por el backend**: lee directamente de Firestore (`brands`, `products`, `suppliers`, `mediaCosts`) porque son catálogos de solo lectura ya protegidos por `firestore.rules` para usuarios autenticados, sin lógica de negocio que justifique un viaje extra al backend. |

### View-models (hooks)

| Hook | Estado / responsabilidad |
|---|---|
| `useSession` | `user`, `isLoading`; `signInWithGoogle`, `signOut` (con `queryClient.clear()`). |
| `useLogin` | `error`, `isSigningIn`, `pendingAccess`; redirige si ya hay rol. |
| `useTheme` | claro/oscuro, persistido en `localStorage`, sincronizado con la clase `.dark`. |
| `useToast` | cola de notificaciones, autodescarte a los 4s. |
| `useReferenceData` | 4 queries en paralelo (marcas, productos, proveedores, costos de medios). |
| `useCampaign` | detalle de una campaña + historial (`GET /campaigns/:id`). |
| `useCampaignsInbox` | filtros + paginación por cursor (stack en memoria) de la bandeja del analista; mutación `submit` que invalida `["campaigns","inbox"]`. |
| `useApprovalsQueue` | igual patrón, filtro default `status: ["PENDING_APPROVAL"]`; mutaciones `approve`/`reject` que invalidan `["campaigns","approvals"]`. |
| `useApprovalDecision` | versión de un solo registro (pantalla de detalle); invalida `["campaigns"]` completo. |
| `useCampaignForm` | motor del formulario dinámico (ver abajo). |

**`useCampaignForm`** es el hook más complejo:

- Usa `react-hook-form` con un tipo plano `CampaignFormValues` que contiene todos los campos
  posibles de los 4 canales (en vez de la unión discriminada), para no tener que remontar el
  formulario al cambiar de canal.
- `toDefaultValues(campaign)` / `toPayload(values)` traducen entre el `Campaign` (unión
  discriminada de `packages/types`) y el estado plano del formulario, según `channel`.
- `channelsForSupplier(supplierId, mediaCosts)` filtra qué canales tienen tarifa configurada para
  el proveedor elegido (si ninguno, cae a todos los canales); un `useEffect` fuerza el canal a uno
  válido si cambia el proveedor (solo en modo creación — en edición el canal es inmutable).
- `useDebouncedValue(quantity, 350ms)` + `useQuery(["cost-estimate", ...])` (`enabled` solo con
  proveedor+canal, `retry: false`) alimentan el callout de costo estimado en vivo.
- Validación en dos capas: `required` básico de `react-hook-form` para campos generales, y
  `newCampaignInputSchema.safeParse(toPayload(values))` (el **mismo** esquema zod que usa el
  backend) para las reglas específicas de cada canal — los errores de zod se mapean a nombres de
  campo del formulario vía un diccionario (`PAYLOAD_PATH_TO_FIELD`, para casos anidados como
  `sendWindow.from` → `sendWindowFrom`).
- La mutación de crear/actualizar invalida `["campaigns"]` y navega al detalle en éxito.

### Vistas y el formulario dinámico

- **`LoginView`**: login con Google + estado "pendiente de acceso" (rol no asignado).
- **`CampaignsInboxView`**: tabla de campañas del analista, filtros, paginación, botón "+ Nueva
  campaña", acción inline "Enviar a aprobación" (solo si el estado es editable), muestra el
  comentario de rechazo si aplica.
- **`ApprovalsQueueView`**: tabla de campañas pendientes con "Aprobar"/"Rechazar" por fila, modal de
  confirmación y modal con comentario obligatorio de rechazo.
- **`CampaignDetailView`**: reutilizada en `/campaigns/:id` y `/approvals/:id` (prop opcional
  `approverActions`); muestra datos generales, detalle específico del canal, desglose de costo
  (costo unitario × cantidad vs. total, solo para canales *unit-based*) e historial; los botones de
  decisión solo aparecen con `approverActions` y estado `PENDING_APPROVAL`.
- **`CampaignFormView`** (formulario dinámico, componente clave del negocio):
  - Sección "Datos generales" (siempre igual): nombre, marca(s)/producto(s) (`MultiCombobox`,
    productos filtrados por marcas elegidas), proveedor, medio de exhibición (deshabilitado en modo
    edición — el canal no se puede cambiar tras crear la campaña), fechas.
  - Sección "Detalles del canal" — cambia enteramente según `channel`:
    - **PETALO**: tiendas (texto separado por comas), cantidad, zona (`ENTRADA` / `PASILLO_CENTRAL`
      / `CAJAS`).
    - **PARRILLERA**: tiendas, cantidad, niveles, categoría.
    - **SMS**: segmento, audiencia estimada, plantilla de mensaje, ventana de envío (desde/hasta).
    - **TIKTOK**: cuenta publicitaria, objetivo, presupuesto diario USD, creativos (texto separado
      por comas).
  - Callout permanente con el costo total estimado en vivo.

### Sistema de componentes UI (`src/components/ui`)

`Button` (variantes primary/secondary/ghost/danger, más `buttonClassName()` para reusar el estilo
en un `<Link>`), `Card`, `Field` (label + hint + error), `Input`/`Select`/`Textarea` (comparten
`CONTROL_CLASSES`), `Table`/`Th`/`Td`, `Modal` (focus-trap, cierre por Escape/click-fuera,
`role="dialog"` `aria-modal`), `Badge`/`ToggleChip` (con `role="checkbox"`/`aria-checked` agrupado
en `<fieldset>`), `MultiCombobox` (`role="combobox"`/`listbox"`, búsqueda, navegación por teclado,
chips removibles), `EmptyState`, `ErrorText`, `Spinner`/`LoadingState`, `Toast`, `ThemeToggle`.
Exportado desde el barrel `components/ui/index.ts`.

Accesibilidad ya implementada en el código: anuncios `role="status" aria-live="polite"`,
skip-link "Saltar al contenido principal", focus-trap en `Modal`, roles ARIA en `ToggleChip` y
`MultiCombobox`.

### Estilos

Tailwind CSS v4 sin archivo de configuración JS: toda la paleta/tokens viven en
`src/app/globals.css` (`@theme`). Modo oscuro basado en clase (`.dark`), toggleable y persistido en
`localStorage`; un script inline en `app/layout.tsx` aplica la clase antes de la hidratación para
evitar parpadeo. Sin CSS Modules ni styled-components — todo con utilidades de Tailwind +
`clsx` para condicionales. El sistema de diseño está documentado en
[`DESIGN.md`](./DESIGN.md) (paleta, tipografía, radios, reglas por componente); `PRODUCT.md`
describe el brief de producto/roles, aunque su sección de "estado del proyecto" quedó desactualizada
frente al código actual (ya hay sistema de diseño, tokens y trabajo de accesibilidad).

## Testing

```bash
cd apps/frontend
pnpm test
```

Suite activa de 53 archivos `*.spec.ts(x)` (~6000 líneas) bajo `src/`, cubriendo páginas, layout,
providers, middleware, `lib/`, `services/`, `view-models/`, `views/` y componentes de
`components/ui/`. Usa `@testing-library/react` + `@testing-library/user-event`, con mocks de
`next/navigation` y de los servicios, envolviendo en `QueryClientProvider` de prueba donde aplica.
Configuración: `next/jest`, `testEnvironment: "jest-environment-jsdom"`, setup en `jest.setup.ts`.

> Nota: el README de la raíz del monorepo lista "tests de frontend: no se escribieron" como deuda
> técnica asumida en la ventana original de desarrollo; esa suite fue agregada después y hoy sí
> existe y se ejecuta con `pnpm --filter frontend test`.

## Tipos compartidos usados

Del paquete [`@farmatodo-retail-media/types`](../../packages/types/README.md): `Campaign` (unión
discriminada), `NewCampaignInput`, `CampaignStatus` / `CAMPAIGN_STATUSES` /
`EDITABLE_CAMPAIGN_STATUSES`, `ChannelType`, `PetaloZone`, `Role`, `HistoryEntry`,
`Brand`/`Product`/`Supplier`/`MediaCost`/`PricingModel`, `CampaignListFilters`, `Paginated<T>`,
`FIRESTORE_COLLECTIONS`, y el esquema zod `newCampaignInputSchema` (el mismo que valida el backend).
El frontend **no** recalcula costos: siempre muestra `campaign.totalCostUsd` calculado por el
backend, solo lo desglosa visualmente.
