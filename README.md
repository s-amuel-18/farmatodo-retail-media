# Farmatodo Retail Media — Plataforma de Gestión de Campañas

Prototipo funcional para la gestión del ciclo completo de creación, revisión y aprobación de
campañas de Retail Media (piso de venta y canales digitales), con dos roles con permisos
diferenciados y trazabilidad completa de cada transición de estado.

## Documentación por paquete

Este README cubre la visión general del monorepo. Cada paquete tiene su propio README con el
detalle completo de su implementación:

- **[apps/backend/README.md](apps/backend/README.md)** — API NestJS: módulos, máquina de estados,
  cálculo de costos, todos los endpoints HTTP, colecciones de Firestore, scripts de
  seed/reset/roles, variables de entorno y cobertura de tests.
- **[apps/frontend/README.md](apps/frontend/README.md)** — cliente Next.js: rutas, autenticación,
  servicios, view-models, el formulario dinámico de campañas, sistema de diseño y suite de tests.
- **[packages/types/README.md](packages/types/README.md)** — tipos y esquemas zod compartidos:
  modelo de `Campaign` por canal, validaciones, y por qué existe este paquete.

## Stack

- **Backend**: NestJS + TypeScript estricto, arquitectura hexagonal (dominio / aplicación /
  infraestructura), Firestore vía `firebase-admin`.
- **Frontend**: Next.js (App Router) + TypeScript estricto, arquitectura MVVM (Vista / hook-ViewModel /
  Service), React Query, react-hook-form.
- **Dominio compartido**: `packages/types` — tipos y esquemas de validación (zod) usados por ambas apps,
  sin duplicación.
- **Auth**: Firebase Authentication (Google Sign-In), rol transportado en un custom claim.
- **Base de datos**: Firestore, con `firestore.rules` de denegación por defecto.

## Estructura

```
farmatodo-retail-media/
├── firestore.rules
├── firestore.indexes.json
├── packages/types/src/        # Campaign, User, Approval, esquemas zod, utilidades
└── apps/
    ├── backend/src/
    │   ├── auth/               # FirebaseAuthGuard, RolesGuard, @Roles()
    │   ├── firebase/            # init de firebase-admin
    │   └── campaigns/
    │       ├── domain/          # máquina de estados y cálculo de costo (funciones puras)
    │       ├── application/     # casos de uso + puertos (interfaces de repositorio)
    │       └── infrastructure/  # adaptadores Firestore + controller HTTP
    └── frontend/src/
        ├── app/                 # routing puro (App Router)
        ├── views/               # componentes presentacionales
        ├── view-models/         # hooks: dueños del estado de cada pantalla
        └── services/            # única capa que habla con la API/Firebase
```

## Requisitos

- Node.js ≥ 20
- pnpm ≥ 9 (`corepack enable` si no lo tienes)
- Un proyecto de Firebase (Authentication con Google habilitado + Firestore)

## Variables de entorno

### `apps/backend/.env` (no versionado)

```
PORT=3001
FRONTEND_ORIGIN=http://localhost:3000
FIREBASE_PROJECT_ID=<tu-project-id>
FIREBASE_SERVICE_ACCOUNT_BASE64=<base64 del JSON de la service account>
```

Para generar el base64 del service account (Project settings → Service accounts → Generate new
private key):

```bash
base64 -w0 service-account.json
```

### `apps/frontend/.env.local` (no versionado)

```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FB_API_KEY=<Web API key del proyecto>
NEXT_PUBLIC_FB_AUTH_DOMAIN=<project-id>.firebaseapp.com
NEXT_PUBLIC_FB_PROJECT_ID=<project-id>
NEXT_PUBLIC_FB_APP_ID=<app id de la Web App>
```

Estos cuatro valores se obtienen registrando una Web App en Project settings → General → Your apps.

## Puesta en marcha

```bash
pnpm install

# 1. Publicar las reglas y los índices de Firestore (requiere `firebase login` una sola vez)
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules,firestore:indexes

# 2. Poblar datos de referencia (marcas, productos, proveedores, costos por medio)
pnpm --filter backend seed

# 3. Backend
pnpm --filter backend dev        # http://localhost:3001

# 4. Frontend (otra terminal)
pnpm --filter frontend dev       # http://localhost:3000
```

### Asignar rol a un usuario

El login es exclusivamente con Google; un usuario nuevo aparece en Firebase Auth recién después de
su primer inicio de sesión. Para habilitarlo:

```bash
cd apps/backend
pnpm set-claim <email> COMMERCIAL_ANALYST   # o APPROVER_MANAGER
```

El usuario debe cerrar sesión y volver a entrar para que el claim llegue al ID token.

## Usuarios de prueba

| Email | Rol |
|---|---|
| samueldeveloper20@gmail.com | COMMERCIAL_ANALYST |
| samuelgraterol12@gmail.com | APPROVER_MANAGER |

## Máquina de estados

```
DRAFT ──(enviar, analista dueño)──▶ PENDING_APPROVAL ──(aprobar, gerente)──▶ APPROVED (terminal)
  ▲                                        │
  └────(reenviar, analista dueño)──── REJECTED ◀──(rechazar + comentario, gerente)
```

Toda transición fuera de esta tabla es rechazada por el backend (`InvalidTransitionError`, HTTP 409).
El rol y la propiedad de la campaña se validan en el dominio (`ForbiddenActionError`, HTTP 403),
independientemente de lo que la interfaz permita mostrar.

## Seguridad en tres capas

1. **Frontend**: `middleware.ts` redirige por rol leyendo una cookie no-httpOnly — es una conveniencia
   de UX, nunca la fuente de verdad.
2. **Backend**: `FirebaseAuthGuard` verifica el ID Token con `firebase-admin`; `RolesGuard` +
   `@Roles()` deniegan por rol; la máquina de estados del dominio vuelve a validar rol y propiedad
   independientemente del guard.
3. **Firestore**: `firestore.rules` con denegación por defecto — el cliente nunca escribe
   `campaigns` directamente (solo el backend, vía Admin SDK), y solo puede leer lo que le
   corresponde por rol.

Verificado con pruebas automatizadas (93 tests en `apps/backend`: dominio, casos de uso, guards,
pipe y filtro HTTP) y manualmente contra el backend real: un token válido de `COMMERCIAL_ANALYST`
invocando `POST /campaigns/:id/approve` o `POST /campaigns/:id/reject` directamente recibe
`403 Forbidden`; un token de `APPROVER_MANAGER` invocando `POST /campaigns` para crear una campaña
recibe el mismo `403`. En ningún caso la evaluación del rol depende de la interfaz.

## Testing

```bash
pnpm --filter backend test     # 16 archivos de test, 93+ bloques it/it.each
pnpm --filter frontend test    # 53 archivos de test (~6000 líneas)
```

Backend (detalle completo en [apps/backend/README.md](apps/backend/README.md#testing)):

- `domain/`: máquina de estados y cálculo de costo — funciones puras, sin mocks, incluyendo los
  cuatro canales y los casos límite de costo (cantidad 0, proveedor sin costo configurado para ese
  canal).
- `application/use-cases/`: cada caso de uso probado con un repositorio en memoria (fake), sin
  Firestore ni NestJS.
- `auth/`: `FirebaseAuthGuard` (token ausente/mal formado/inválido/expirado, claim de rol ausente)
  y `RolesGuard` (sin usuario, sin `@Roles()`, rol no autorizado) — es la prueba unitaria del
  "punto crítico" de seguridad del enunciado, antes solo verificado manualmente.
- `common/`: `ZodValidationPipe` (datos inválidos, campos extra) y `DomainErrorFilter` (cada
  `DomainError` mapeado a su status HTTP, más el *fallback* 500 que no filtra el mensaje interno).
- `infrastructure/http/`: `CampaignsController` (cada endpoint delega al caso de uso correcto con
  los argumentos correctos) y `parseListFilters` (estados inválidos descartados, `pageSize`
  inválido ignorado en vez de romper la consulta).
- No cubierto por diseño: los adaptadores de Firestore (`firestore-*.repository.ts`) y
  `firebase-admin.service.ts` envuelven el SDK de Firebase Admin directamente — mockear su API
  encadenada aporta poca señal; la cobertura real de esa capa es el Firestore Emulator, que sigue
  como deuda técnica (ver abajo).

Frontend (detalle completo en [apps/frontend/README.md](apps/frontend/README.md#testing)): suite
con `@testing-library/react` cubriendo páginas, layout, middleware, servicios, view-models, vistas
y componentes de UI. Esta suite se agregó después de la ventana original de 48 horas — ver nota en
"Deuda técnica" más abajo.

## Roadmap ejecutado (ventana de 48 horas)

| Bloque | Foco | Estado |
|---|---|---|
| 1 · h0-12 | Monorepo, `packages/types`, auth guard + roles, conexión real a Firebase | ✅ |
| 2 · h12-24 | Dominio + casos de uso + Firestore + `firestore.rules` + seed | ✅ |
| 3 · h24-36 | Frontend completo: login, bandejas, formulario dinámico, detalle, aprobación | ✅ |
| 4 · h36-48 | Pruebas de seguridad negativas, despliegue, README, video walkthrough | ✅ |

## Deuda técnica asumida

- **Tests de frontend**: en la ventana original de 48 horas no se escribieron (se priorizó el
  dominio y la seguridad del backend, que es lo que puntúa explícitamente); la separación de capas
  MVVM se respetó de forma consistente precisamente para que fueran triviales de agregar después.
  Esa suite ya se agregó (53 archivos de test con `@testing-library/react`, ver
  [apps/frontend/README.md](apps/frontend/README.md#testing)), por lo que este punto ya no es deuda
  pendiente, solo se documenta como parte del historial del proyecto.
- **Tests de integración con Firestore Emulator**: no se configuraron; el desarrollo y las pruebas
  manuales se hicieron contra el proyecto real de Firebase, no contra un emulador local.
- **`firestore.rules` / índices**: el despliegue automático vía Firebase CLI requiere login
  interactivo (`firebase login`), así que quedó como paso manual documentado arriba en vez de
  automatizarse en un script.
- **Costeo de SMS y TikTok**: el catálogo `mediaCosts` almacena un costo plano por proveedor+canal
  para estos dos medios (en vez de un costo por unidad de audiencia), separado del `dailyBudgetUsd`
  de TikTok, que es el gasto publicitario propio de la cuenta. Es un supuesto razonable dado que el
  enunciado no especifica la unidad de costeo para estos dos canales.
- **Catálogo de tiendas y creativos**: se ingresan como texto libre separado por comas en el
  formulario, ya no existe un catálogo de tiendas en el enunciado y no se justificaba crear uno para
  el prototipo.
- **Paginación**: cursor-based simple con un stack de cursores en memoria del cliente (se pierde al
  recargar la página); es funcional pero no persiste el punto de navegación entre sesiones.
- **Concurrencia en edición**: `PATCH /campaigns/:id` sobreescribe sin control de versión optimista
  (last-write-wins). Para una campaña que solo su dueño puede editar y en estados no concurrentes
  (DRAFT/REJECTED), el riesgo real es bajo, pero es una simplificación consciente.
- **Diseño visual**: en la ventana original se dejó como CSS mínimo inline, sin sistema de diseño,
  explícitamente fuera de alcance según el enunciado ("no se busca... refinamiento visual"). Desde
  entonces se incorporó un sistema de diseño completo con Tailwind CSS v4 (tokens, modo oscuro,
  componentes de UI reutilizables) documentado en
  [apps/frontend/DESIGN.md](apps/frontend/DESIGN.md) y en
  [apps/frontend/README.md](apps/frontend/README.md#estilos).
- **Colecciones `users` / `approvals` / módulo `users` de NestJS**: el enunciado las menciona, pero se
  optó por no crear una colección `users` en Firestore (el rol vive únicamente en el custom claim del
  token, que es la fuente de verdad que el propio enunciado exige) ni una colección `approvals`
  separada (cada decisión es una entrada más en la subcolección `history` de la campaña, append-only,
  que ya cubre "quién, cuándo, decisión, comentario" sin duplicar estado). Aprobar/rechazar vive como
  acciones del módulo `campaigns` en vez de un módulo `approvals` aparte, porque operan sobre el mismo
  agregado y transacción. La colección `invoices` no se implementó: liquidaciones y facturación están
  explícitamente fuera de alcance.
