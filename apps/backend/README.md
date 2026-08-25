# Backend — Farmatodo Retail Media

API REST construida con **NestJS + TypeScript estricto** que implementa el ciclo completo de
creación, envío, aprobación y rechazo de campañas de Retail Media, con arquitectura hexagonal
(dominio / aplicación / infraestructura) y persistencia en **Firestore** vía `firebase-admin`.

Este documento cubre en detalle el backend. Para la visión general del monorepo (stack completo,
puesta en marcha conjunta, máquina de estados, seguridad en tres capas y deuda técnica) ver el
[README de la raíz](../../README.md). Para el modelo de dominio compartido con el frontend, ver
[packages/types/README.md](../../packages/types/README.md). Para el cliente web, ver
[apps/frontend/README.md](../frontend/README.md).

## Stack y dependencias

- **NestJS** 10.4 (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`) — el proyecto **no
  usa el CLI de Nest** (no hay `nest-cli.json`): arranca manualmente con `ts-node-dev`/`ts-node`/`tsc`
  sobre `src/main.ts`.
- **firebase-admin** 12.7 — Auth (verificación de ID tokens, custom claims) y Firestore (persistencia,
  transacciones).
- **zod** 3.23 — validación de payloads HTTP, reutilizando los esquemas de `@farmatodo-retail-media/types`.
- **Jest** 29 + `ts-jest` — testing.
- **TypeScript** 5.6 en modo estricto (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
  `noImplicitOverride`), heredado de `tsconfig.base.json` en la raíz del monorepo; el backend
  sobreescribe `module: "CommonJS"` y `moduleResolution: "Node"` y habilita `emitDecoratorMetadata` /
  `experimentalDecorators` (requeridos por los decoradores de Nest).
- **`@farmatodo-retail-media/types`** (`workspace:*`) — tipos y esquemas zod compartidos con el
  frontend.
- No hay ESLint configurado en el backend (ni en el resto del monorepo); el script `lint` del
  `package.json` raíz (`pnpm -r lint`) no tiene nada que ejecutar aquí porque `apps/backend/package.json`
  no declara un script `lint`.

## Scripts

Ejecutar siempre desde la raíz del monorepo con `pnpm --filter backend <script>`, o desde
`apps/backend` directamente:

| Script | Comando | Descripción |
|---|---|---|
| `dev` | `ts-node-dev --respawn --transpile-only src/main.ts` | Servidor en caliente (hot reload) para desarrollo. |
| `build` | `pnpm --filter @farmatodo-retail-media/types build && tsc -p tsconfig.json` | Compila primero el paquete compartido (`@farmatodo-retail-media/types`, ver [packages/types/README.md](../../packages/types/README.md)) y luego este backend a `dist/`. Compilar `types` explícitamente en este script (en vez de confiar solo en el `postinstall` de la raíz) evita que un build con caché restaurada en un CI/PaaS se salte ese paso. |
| `start` | `node dist/main.js` | Arranque en producción, requiere `build` previo. |
| `test` | `jest` | Corre toda la suite de tests. |
| `test:watch` | `jest --watch` | Tests en modo watch. |
| `seed` | `ts-node scripts/seed.ts` | Siembra los catálogos de referencia (marcas, productos, proveedores, costos de medios). |
| `reset` | `ts-node scripts/reset.ts` | Borra únicamente las campañas (y su historial). Requiere `--yes`/`-y` o `--dry-run`. |
| `reset:full` | `ts-node scripts/reset-and-seed.ts` | Borra **todas** las colecciones y vuelve a sembrar los catálogos. Requiere `--yes`/`-y` o `--dry-run`. |
| `set-claim` | `ts-node scripts/set-role-claim.ts` | Asigna el rol (custom claim) a un usuario de Firebase Auth por email. |

## Variables de entorno

Archivo `apps/backend/.env` (no versionado, ver `.env.example`):

```
PORT=3001
FRONTEND_ORIGIN=http://localhost:3000
FIREBASE_PROJECT_ID=<tu-project-id>
FIREBASE_SERVICE_ACCOUNT_BASE64=<base64 del JSON de la service account>
```

- `PORT`: puerto HTTP del servidor. Si no está definida, `main.ts` usa `3001` por defecto.
- `FRONTEND_ORIGIN`: uno o más orígenes permitidos por CORS, separados por comas. Si no está
  definida, CORS permite cualquier origen (solo recomendado en desarrollo).
- `FIREBASE_PROJECT_ID` / `FIREBASE_SERVICE_ACCOUNT_BASE64`: credenciales de la cuenta de servicio
  de Firebase Admin, usadas tanto por `FirebaseAdminService` como por todos los scripts de
  `scripts/`. Si falta cualquiera de las dos, el proceso lanza un error explícito al iniciar.

Estas cuatro son las **únicas** variables de entorno que lee el backend (confirmado por revisión de
todo `process.env.*` en `src/` y `scripts/`).

Para generar el base64 del service account (Firebase Console → Project settings → Service accounts
→ Generate new private key):

```bash
base64 -w0 service-account.json
```

## Puesta en marcha

```bash
pnpm install

# publicar reglas e índices de Firestore (requiere `firebase login` una vez)
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules,firestore:indexes

# poblar catálogos de referencia
pnpm --filter backend seed

# levantar el servidor
pnpm --filter backend dev        # http://localhost:3001
```

### Asignar rol a un usuario

El login ocurre siempre en el frontend con Google; un usuario nuevo solo aparece en Firebase Auth
después de su primer inicio de sesión. Para habilitarlo con un rol:

```bash
cd apps/backend
pnpm set-claim <email> COMMERCIAL_ANALYST   # o APPROVER_MANAGER
```

El usuario debe cerrar sesión y volver a entrar para que el custom claim llegue a su ID token
(el propio script lo recuerda en consola al terminar).

## Arquitectura

Arquitectura hexagonal (puertos y adaptadores) con ideas de DDD ligero, aplicada de forma
consistente dentro de `campaigns/`:

```
src/
├── main.ts                       # bootstrap: dotenv, CORS por FRONTEND_ORIGIN, filtro global de
│                                  # errores, listen en PORT
├── app.module.ts                 # módulo raíz: FirebaseModule + AuthModule + CampaignsModule
├── auth/                         # verificación de identidad y de rol (ver más abajo)
├── firebase/                     # inicialización de firebase-admin (Auth + Firestore)
├── common/                       # pipe de validación zod + filtro global de errores de dominio
└── campaigns/
    ├── domain/                   # lógica de negocio pura, sin Nest/Firestore/HTTP
    ├── application/               # casos de uso + puertos (interfaces de repositorio)
    └── infrastructure/
        ├── firestore/             # adaptadores concretos de los puertos, sobre Firestore
        └── http/                  # controller REST + DTOs de query
```

- **`domain/`**: no depende de Nest, Firestore ni HTTP. Los errores de dominio son clases `Error`
  propias (no `HttpException`); el mapeo a códigos HTTP ocurre únicamente en
  `infrastructure/http` — el dominio nunca sabe que existe HTTP.
- **`application/`**: orquesta los casos de uso contra las *interfaces* de repositorio (`ports/`),
  no contra Firestore directamente. Cada caso de uso es una clase plain TS (sin decoradores de
  Nest) instanciada vía `useFactory` en `campaigns.module.ts`, usando tokens de inyección
  (`CAMPAIGN_REPOSITORY`, `MEDIA_COST_REPOSITORY`) para desacoplarlos de la implementación
  concreta. Esto permite sustituir Firestore por los repositorios fake en memoria
  (`application/testing/`) en los tests, sin tocar Nest.
- **`infrastructure/`**: única capa que conoce Firestore, Express y HTTP.

### Módulo `auth/`

| Pieza | Responsabilidad |
|---|---|
| `FirebaseAuthGuard` | Extrae el header `Authorization: Bearer <token>`. Sin header o sin `Bearer` → `401 Missing bearer token`. Verifica el token con `firebase-admin` (`verifyIdToken`); inválido/expirado → `401 Invalid or expired token`. Si es válido, adjunta `request.user = { uid, email, role }` (el custom claim `role` puede venir `undefined` si el usuario aún no tiene rol asignado — este guard no lo rechaza). |
| `RolesGuard` | Debe declararse **después** de `FirebaseAuthGuard` en `@UseGuards()`. Lee los roles requeridos vía `@Roles(...)` (metadata de handler/clase). Sin usuario en el request → `403`. Sin `@Roles()` en la ruta → permite. Rol del usuario no incluido en la lista (incluye `undefined`) → `403 Role '<rol o "none">' is not allowed to perform this action`. |
| `@Roles(...roles)` | Decorador que fija la metadata que lee `RolesGuard`. |
| `@CurrentUser()` | Decorador de parámetro que expone el `AuthenticatedUser` verificado (nunca datos del body/params). Si se usa en una ruta sin `RolesGuard` (o sin rol resuelto), lanza `500 CurrentUser used on a route without RolesGuard` como defensa contra mal uso. |
| `RequestUser` vs `AuthenticatedUser` | `RequestUser` (interno, `role` puede ser `undefined`) es lo que adjunta `FirebaseAuthGuard`, antes de que `RolesGuard` confirme membresía. `AuthenticatedUser` (`role: Role`, de `@farmatodo-retail-media/types`) es lo que reciben los casos de uso, ya garantizado no nulo. |

Los dos únicos roles del sistema (`Role`, en `@farmatodo-retail-media/types`) son
`COMMERCIAL_ANALYST` y `APPROVER_MANAGER`. No hay módulo de login/registro en el backend: la
autenticación de credenciales ocurre enteramente en el cliente (Firebase Auth SDK); el backend
solo verifica tokens ya emitidos por Firebase.

### Módulo `firebase/`

`FirebaseModule` es `@Global()` y provee una única instancia de `FirebaseAdminService` a toda la
app. En `onModuleInit`, si ya existe una app de `firebase-admin` inicializada la reutiliza
(relevante en tests/hot-reload); si no, decodifica `FIREBASE_SERVICE_ACCOUNT_BASE64` (base64 →
JSON) e inicializa `firebase-admin` con `admin.credential.cert(serviceAccount)` y el
`FIREBASE_PROJECT_ID`. Aplica `firestore().settings({ ignoreUndefinedProperties: true })` para que
campos `undefined` de un objeto TS no rompan un `set()` en Firestore. Expone `auth()` y
`firestore()`.

### Dominio de campañas (`campaigns/domain/`)

**Máquina de estados** (`campaign-state-machine.ts`, función pura `transition(campaign, action, actor)`):

```
DRAFT ──(SUBMIT, analista dueño)──▶ PENDING_APPROVAL ──(APPROVE, manager)──▶ APPROVED (terminal)
  ▲                                        │
  └──(SUBMIT, analista dueño)──── REJECTED ◀──(REJECT + comment, manager)
```

- **`SUBMIT`**: válido desde `DRAFT` o `REJECTED`, exige `actor.role === "COMMERCIAL_ANALYST"` **y**
  `actor.uid === campaign.createdBy`. Al reenviar desde `REJECTED`, el campo
  `currentApprovalComment` se **elimina por completo** del objeto resultante (no se limpia con
  `null`/`""`), por lo que tras un reenvío ese campo puede directamente no existir en el documento.
- **`APPROVE`**: válido solo desde `PENDING_APPROVAL`, exige `actor.role === "APPROVER_MANAGER"`.
  `APPROVED` es terminal: ninguna acción es válida desde ahí, para ningún actor.
- **`REJECT { comment }`**: válido solo desde `PENDING_APPROVAL`, exige
  `actor.role === "APPROVER_MANAGER"` y un `comment` no vacío tras `trim()` (si está vacío,
  devuelve `ValidationError` en vez de aplicar la transición). El comentario recortado queda en
  `currentApprovalComment`.
- Cualquier acción sobre un estado no listado como origen válido → `InvalidTransitionError`.
- **El chequeo de rol se evalúa antes que el de estado de origen**: un `APPROVER_MANAGER` que
  intenta `SUBMIT` sobre una campaña `APPROVED` recibe `ForbiddenActionError`, no
  `InvalidTransitionError`, aunque ambas condiciones fallarían.
- `transition()` es pura y sin I/O — dado el mismo `campaign`/`action`/`actor` siempre devuelve el
  mismo resultado (`{ok:true, campaign, historyAction}` o `{ok:false, error}}`); es la única fuente
  de verdad de qué transiciones son válidas.

**Edición** (`editable.ts`, `assertEditable`): permitida solo si el actor es el analista dueño
(`COMMERCIAL_ANALYST` + `actor.uid === campaign.createdBy`) y el estado actual está en
`EDITABLE_CAMPAIGN_STATUSES` (`DRAFT`, `REJECTED`). A diferencia de `transition()`, esta función
lanza en vez de devolver un `Result`, porque siempre protege un early-return dentro de un caso de
uso.

**Cálculo de costos** (`cost-calculator.ts`, `calculateTotalCost(input, mediaCosts)`):

- Busca en el catálogo `MediaCost[]` la entrada exacta por `supplierId` + `channel`
  (`ChannelType`: `PETALO`, `PARRILLERA`, `SMS`, `TIKTOK`); si no existe, lanza `ValidationError`
  ("No cost configured for supplier '<id>' and channel '<channel>'"). El costo total **nunca** se
  confía del cliente: siempre se deriva server-side del catálogo, tanto al crear como al editar una
  campaña.
- La fórmula ramifica por el `pricingModel` de la entrada encontrada, **no** por el nombre del
  canal:
  - `PER_UNIT`: `unitCostUsd * (input.quantity ?? 0)`.
  - `FLAT`: `unitCostUsd` (ignora `quantity` por completo).
- En los datos de seed, `SMS`/`TIKTOK` son `FLAT` (costo de contratación fijo, independiente de la
  audiencia estimada o del `dailyBudgetUsd` propio de TikTok, que es presupuesto de pauta y no lo
  que Farmatodo cobra) y `PETALO`/`PARRILLERA` son `PER_UNIT`. Pero es una convención de los
  **datos**, no del código: si una entrada del catálogo tuviera `PETALO` como `FLAT`, el cálculo
  seguiría el `pricingModel` de esa entrada. Esto permite agregar un canal nuevo o repreciar uno
  existente cambiando solo el catálogo en Firestore, sin tocar código.
- Cantidad `0` en `PER_UNIT` devuelve `0` (no lanza). El resultado se redondea a 2 decimales.

**Errores de dominio** (`errors.ts`): `InvalidTransitionError`, `ForbiddenActionError`,
`ValidationError`, `CampaignNotFoundError` (unión `DomainError`).

### Casos de uso (`campaigns/application/use-cases/`)

| Caso de uso | Qué hace |
|---|---|
| `CreateCampaignUseCase` | Exige `COMMERCIAL_ANALYST`; calcula `totalCostUsd` con el catálogo vigente; crea la campaña con `createdBy = actor.uid`. |
| `UpdateCampaignUseCase` | Busca la campaña, corre `assertEditable`, recalcula `totalCostUsd`, reemplaza los campos editables. |
| `GetCampaignUseCase` | Busca la campaña; si el actor es `COMMERCIAL_ANALYST` y no es el creador → `ForbiddenActionError` (un manager puede auditar cualquier campaña, un analista solo las propias). Devuelve `{ campaign, history }`. |
| `ListCampaignsUseCase` | Si el actor es `COMMERCIAL_ANALYST`, fuerza `filters.createdBy = actor.uid` **sobrescribiendo** lo que venga en la query, para que un analista nunca pueda leer el pipeline de otro aunque manipule la request. |
| `SubmitCampaignUseCase` / `ApproveCampaignUseCase` / `RejectCampaignUseCase` | Delegan toda la lógica al dominio vía `decideTransition(action, actor)` + `transition()`, ejecutados dentro de `campaignRepository.transactionalUpdate`. Su única responsabilidad es envolver la acción concreta (`SUBMIT` / `APPROVE` / `REJECT{comment}`). |
| `EstimateCostUseCase` | Contraparte de solo lectura de la lógica de costo: permite que el formulario del frontend pregunte "¿cuánto costaría esto?" contra el mismo catálogo y la misma `calculateTotalCost`, sin crear ni mutar nada. |

`decideTransition` (`decide-transition.ts`) es la factory compartida por los tres casos de uso de
transición: devuelve una función `Decide` que, dado el `current` estado persistido, llama a
`transition()`; si falla, relanza el error (para abortar la transacción); si tiene éxito, devuelve
el nuevo `campaign` (con `updatedAt` refrescado) y el `historyEntry` correspondiente.

### Puertos e infraestructura Firestore

- **`CampaignRepository`** (token DI `CAMPAIGN_REPOSITORY`): `findById`, `create`,
  `replaceEditableFields`, `transactionalUpdate`, `list`, `listHistory`.
- **`MediaCostRepository`** (token DI `MEDIA_COST_REPOSITORY`): `listAll`.
- **`FirestoreCampaignRepository`**: opera sobre la colección `campaigns`
  (`FIRESTORE_COLLECTIONS.campaigns`, de `@farmatodo-retail-media/types`).
  - `transactionalUpdate` usa `firestore().runTransaction()`: lee el doc, llama a `decide(current)`,
    escribe el nuevo estado y crea un documento nuevo en la subcolección
    `campaigns/{id}/history` — esto es lo que hace que la máquina de estados sea segura ante
    peticiones concurrentes (sin condiciones de carrera).
  - `list(filters)` encadena `.where("createdBy", "==", ...)`, `.where("status", "in", ...)`,
    `.where("createdAt", ">=" / "<=", ...)`, siempre `.orderBy("createdAt", "asc")` y
    `.limit(pageSize)` (default `20`). **Paginación por cursor de documento**: si viene
    `filters.cursor`, se busca ese documento y se usa `.startAfter(cursorSnap)` — el cursor es el
    **id de un documento** ya visto, no un offset numérico. `nextCursor` solo se devuelve si la
    página vino llena; si vino incompleta, se asume que no hay más páginas.
- **`FirestoreMediaCostRepository`**: `listAll()` lee la colección `mediaCosts` completa, sin
  filtros ni paginación (catálogo pequeño).
- No hay tests unitarios propios de estos adaptadores: se ejercitan indirectamente a través de los
  fakes en memoria en los tests de casos de uso; su cobertura real requeriría el Firestore
  Emulator, que este proyecto no tiene configurado (deuda técnica, ver README raíz).

### Endpoints HTTP (`CampaignsController`, `@Controller("campaigns")`)

Todas las rutas llevan `@UseGuards(FirebaseAuthGuard, RolesGuard)` a nivel de clase. El actor se
obtiene siempre con `@CurrentUser()` (nunca de body/params), así el `createdBy`/las reglas de rol
usan la identidad verificada del token, no algo que el cliente pueda falsificar.

| Método | Ruta | Roles permitidos | Body / Query | Respuesta |
|---|---|---|---|---|
| `POST` | `/campaigns` | `COMMERCIAL_ANALYST` | Body validado con `newCampaignInputSchema` (zod, `ZodValidationPipe`) | `Campaign` creada en `DRAFT` |
| `PATCH` | `/campaigns/:id` | `COMMERCIAL_ANALYST` | Param `id`; body validado con `newCampaignInputSchema` | `Campaign` actualizada |
| `GET` | `/campaigns` | `COMMERCIAL_ANALYST`, `APPROVER_MANAGER` | Query cruda (`status` CSV, `dateFrom`, `dateTo`, `pageSize`, `cursor`), parseada manualmente por `parseListFilters` | `Paginated<Campaign>` |
| `GET` | `/campaigns/cost-estimate` | `COMMERCIAL_ANALYST` | Query validada con zod: `channel` (enum), `supplierId`, `quantity?` (coercionado a número). Registrada **antes** de `GET /campaigns/:id` para que Nest no confunda `"cost-estimate"` con el parámetro `:id` | `{ totalCostUsd: number }` |
| `GET` | `/campaigns/:id` | `COMMERCIAL_ANALYST`, `APPROVER_MANAGER` | Param `id` | `{ campaign, history }` |
| `POST` | `/campaigns/:id/submit` | `COMMERCIAL_ANALYST` | Param `id`, sin body | `Campaign` en `PENDING_APPROVAL` |
| `POST` | `/campaigns/:id/approve` | `APPROVER_MANAGER` | Param `id`, sin body | `Campaign` en `APPROVED` |
| `POST` | `/campaigns/:id/reject` | `APPROVER_MANAGER` | Param `id`; body validado con `rejectCampaignSchema`: `{ comment: string }` obligatorio, no vacío tras trim | `Campaign` en `REJECTED` |

**DTOs de query propios del backend** (no viven en el paquete compartido):
`CostEstimateQueryDto`/`costEstimateQuerySchema` (zod) y `ListCampaignsQueryDto`/`parseListFilters`
(parser manual, no zod: descarta valores de `status` inválidos y `pageSize` no entero o ≤ 0, sin
aplicar tope máximo — a diferencia de `campaignListFiltersSchema` del paquete compartido, que sí
valida `pageSize.max(100)` pero que el controller no usa actualmente para este endpoint).

### Validación y manejo de errores

- **`ZodValidationPipe`** (`common/`): recibe cualquier `ZodSchema`; en `transform()` corre
  `schema.safeParse(value)`. Si falla, lanza `BadRequestException(result.error.flatten())`
  (expone `fieldErrors`/`formErrors` tal cual). Si pasa, devuelve `result.data` — esto implica que
  **descarta silenciosamente campos no declarados** en el esquema (comportamiento por defecto de
  Zod sin `.strict()`).
- **`DomainErrorFilter`** (`common/`, registrado globalmente en `main.ts`): mapea
  `ForbiddenActionError` → `403`, `InvalidTransitionError` → `409`, `ValidationError` → `400`,
  `CampaignNotFoundError` → `404`; deja pasar cualquier `HttpException` de Nest con su propio
  status; y para cualquier otra excepción no reconocida responde `500`
  `{statusCode:500, message:"Internal server error"}` **sin filtrar el mensaje real** (protege
  contra fugas de detalles internos, p. ej. errores de conexión a Firestore), registrando el error
  completo con `console.error` en el servidor.

## Colecciones de Firestore

Definidas en `FIRESTORE_COLLECTIONS` (`@farmatodo-retail-media/types`):

| Colección | Id de documento | Notas |
|---|---|---|
| `campaigns` | autogenerado | El documento es el propio objeto `Campaign` menos el campo `id` (vive en el path). |
| `campaigns/{id}/history` | autogenerado | Subcolección append-only; cada documento es un `HistoryEntry` menos su `id` (copiado dentro del documento tras generarse). |
| `brands` | id de negocio (`brand-1`, ...) | Catálogo de marcas. |
| `products` | SKU | Catálogo de productos. |
| `suppliers` | id de negocio (`supplier-1`, ...) | Catálogo de proveedores. |
| `mediaCosts` | id de negocio (`mc-supplier-1-petalo`, ...) | Catálogo de costos por proveedor + canal. |

## Scripts standalone (`scripts/`)

Todos usan `ts-node` (no se compilan) y comparten `scripts/lib/init-admin.ts` para inicializar
`firebase-admin` a partir de `.env`.

- **`seed.ts`** (`pnpm seed`): siembra, vía `batch()` de Firestore, 2 proveedores (Laboratorios
  Genfar, Consumer Health SA), 2 marcas (VitaPlus, DermaCare), 2 productos y 6 entradas de
  `mediaCosts` — nótese que `supplier-2` **no** tiene costo configurado para `PARRILLERA` ni
  `TIKTOK`; cotizar esa combinación lanza `ValidationError`. Exporta `seedAll()` para reutilización.
- **`reset.ts`** (`pnpm reset`): borra únicamente `campaigns` (y su subcolección `history` vía
  `recursiveDelete`); no toca los catálogos. Requiere `--yes`/`-y` para ejecutar de verdad, o
  `--dry-run` para solo contar documentos.
- **`reset-and-seed.ts`** (`pnpm reset:full`): borra **todas** las colecciones de
  `FIRESTORE_COLLECTIONS` y vuelve a llamar a `seedAll()`. Misma protección `--yes`/`--dry-run`.
  Nunca toca usuarios de Firebase Auth.
- **`set-role-claim.ts`** (`pnpm set-claim <email> <ROL>`): valida que el rol sea
  `COMMERCIAL_ANALYST` o `APPROVER_MANAGER`, busca el usuario por email y le asigna el custom claim
  `{ role }`.

## Testing

```bash
cd apps/backend
pnpm test
```

Los `.spec.ts` viven junto al archivo que prueban (sin carpeta `__tests__` separada). Jest
(`jest.config.js`, preset `ts-jest`, `rootDir: "src"`) solo descubre specs bajo `src/` — los
scripts de `scripts/` no tienen tests. 16 archivos de test, 93+ bloques `it`/`it.each`:

- **`domain/`**: cobertura exhaustiva de la máquina de estados (cada transición válida, cada rol
  prohibido, cada estado de origen inválido, el caso "`APPROVED` es terminal para cualquier
  acción/actor") y del cálculo de costos (`PER_UNIT` vs `FLAT`, redondeo, catálogo exacto por
  combinación, error si falta configuración, y que el `pricingModel` del catálogo manda por encima
  del nombre del canal).
- **`application/use-cases/`**: cada caso de uso probado contra los repositorios fake en memoria
  (`InMemoryCampaignRepository`/`InMemoryMediaCostRepository`), sin Firestore ni NestJS — reglas de
  autorización (propietario vs. otro analista vs. manager), recálculo de costo en update,
  `CampaignNotFoundError`, flujo completo `DRAFT → PENDING_APPROVAL → APPROVED` con historial, y
  flujo de rechazo-y-reenvío.
- **`auth/`**: `FirebaseAuthGuard` (sin header, header no-Bearer, Bearer vacío, token
  inválido/expirado, token válido sin claim de rol, email ausente) y `RolesGuard` (sin usuario, sin
  `@Roles()`, `@Roles([])`, rol permitido/no permitido, rol `undefined`) — es la prueba unitaria del
  punto crítico de seguridad del proyecto, antes solo verificado manualmente.
- **`common/`**: `ZodValidationPipe` (parseo correcto, remoción de campos extra, `BadRequestException`
  con `fieldErrors`) y `DomainErrorFilter` (cada `DomainError` mapeado a su status HTTP, paso
  transparente de `HttpException`, fallback 500 sin filtrar el mensaje interno).
- **`infrastructure/http/`**: `CampaignsController` probado como routing puro (mocks `jest.fn()` de
  cada caso de uso — no re-testea reglas de negocio) y los parsers de query
  (`parseListFilters`/`costEstimateQuerySchema`) como funciones puras.
- **No cubierto por diseño**: los adaptadores Firestore (`firestore-*.repository.ts`) y
  `firebase-admin.service.ts` envuelven el SDK de Firebase Admin directamente — mockear su API
  encadenada aporta poca señal; la cobertura real de esa capa sería el Firestore Emulator, que
  sigue como deuda técnica (ver README raíz).

Verificación manual adicional (documentada en el README raíz): un token válido de
`COMMERCIAL_ANALYST` invocando `POST /campaigns/:id/approve` o `/reject` directamente recibe `403`;
un token de `APPROVER_MANAGER` invocando `POST /campaigns` recibe el mismo `403` — en ningún caso
la evaluación del rol depende de lo que la interfaz permita mostrar.
