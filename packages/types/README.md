# @farmatodo-retail-media/types

Paquete compartido de **tipos TypeScript y esquemas de validación (zod)** consumido tanto por el
backend ([`apps/backend`](../../apps/backend/README.md)) como por el frontend
([`apps/frontend`](../../apps/frontend/README.md)) del monorepo. Es la única fuente de verdad del
modelo de dominio de campañas, evitando que ambas apps mantengan copias divergentes de los mismos
tipos y reglas de validación.

Ver también el [README de la raíz](../../README.md) para la visión general del proyecto.

## Cómo se consume

- **Nombre del paquete**: `@farmatodo-retail-media/types`.
- Declarado como dependencia en `apps/backend/package.json` y `apps/frontend/package.json` con el
  protocolo de workspace de pnpm: `"@farmatodo-retail-media/types": "workspace:*"` (resuelto por
  `pnpm-workspace.yaml`, `packages: ["apps/*", "packages/*"]`).
- **No hay build ni bundler** para este paquete (no tsup/rollup/esbuild): `package.json` apunta
  `"main"`/`"types"` directo a `"./src/index.ts"`. Next.js (vía
  `transpilePackages: ["@farmatodo-retail-media/types"]` en `next.config.js`) y el toolchain de
  Nest/ts-node/Jest del backend transpilan ese TypeScript fuente on-the-fly a través del symlink de
  pnpm en `node_modules/@farmatodo-retail-media/types` → `packages/types`. El único script es
  `typecheck` (`tsc --noEmit`), que solo verifica tipos, no emite JS.
- **Import**: siempre desde la raíz del paquete, sin subpaths —
  `import { ... } from "@farmatodo-retail-media/types";` — usado en más de 80 archivos del repo
  (backend, frontend y scripts de seed/reset).
- **`tsconfig.json`** propio (`outDir: "dist"`, `rootDir: "src"`) extiende `tsconfig.base.json` de
  la raíz del monorepo (TypeScript estricto: `strict`, `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`, `noImplicitOverride`, `declaration`/`declarationMap`); el `outDir`
  no se usa en el flujo actual (no se invoca `tsc` para emitir), es vestigial por si en el futuro
  se necesitara compilar/publicar el paquete.
- **Dependencias**: solo `zod` en runtime; `typescript` como dev dependency.

## Estructura (`src/`)

```
src/
├── index.ts       # barrel: re-exporta todo lo demás
├── user.ts        # Role, UserProfile, AuthenticatedUser
├── campaign.ts     # Campaign (unión por canal), estados, catálogo, filtros, paginación
├── approval.ts     # HistoryEntry — único modelo de trazabilidad
├── firestore.ts    # nombres de colecciones de Firestore
├── schemas.ts      # esquemas zod (mismas reglas para backend y frontend)
└── utils.ts        # DistributiveOmit — única utilidad de tipos
```

`index.ts` re-exporta todo (`export * from "./user"`, etc.) — no hay subpaths de exportación; se
importa siempre el paquete completo.

## Tipos exportados

### `user.ts`

- `Role = "COMMERCIAL_ANALYST" | "APPROVER_MANAGER"` — los dos únicos roles del sistema.
- `UserProfile { uid, email, displayName, role: Role | null }` — el `role` puede ser `null` (usuario
  recién creado, aún sin rol asignado).
- `AuthenticatedUser { uid, email, role: Role }` — usuario ya autenticado con rol resuelto (no
  nulo), el que reciben los casos de uso del backend tras pasar los guards.

### `campaign.ts`

- `ChannelType = "PETALO" | "PARRILLERA" | "SMS" | "TIKTOK"` — los 4 canales soportados: dos de piso
  de venta (`PETALO`, `PARRILLERA`) y dos digitales (`SMS`, `TIKTOK`).
- `CAMPAIGN_STATUSES = ["DRAFT", "PENDING_APPROVAL", "APPROVED", "REJECTED"] as const` — fuente
  única de verdad de los estados; tanto el esquema zod como cualquier parsing de query params o
  filtro de UI deriva de este arreglo en vez de repetir las strings.
- `CampaignStatus = (typeof CAMPAIGN_STATUSES)[number]`.
- `EDITABLE_CAMPAIGN_STATUSES: readonly CampaignStatus[] = ["DRAFT", "REJECTED"]` — estados en los
  que el analista puede editar libremente; compartida entre el guard de edición del backend
  (`assertEditable`) y el chequeo de "¿se puede editar?" del frontend, para que nunca diverjan.
- `PetaloZone = "ENTRADA" | "PASILLO_CENTRAL" | "CAJAS"` — zonas físicas del canal `PETALO`.
- `CampaignBase` (campos comunes a los 4 canales): `id`, `name`, `brandIds: string[]`,
  `productSkus: string[]`, `supplierId`, `startDate`, `endDate`, `campaignDate` (fecha de campaña
  capturada por el analista en el formulario — **distinta** de `createdAt`, el timestamp inmutable
  de escritura en Firestore, para poder ordenar/filtrar sin depender de detalles de
  infraestructura), `createdAt`, `updatedAt`, `createdBy`, `status`, `totalCostUsd`,
  `currentApprovalComment?`.
- Unión discriminada por `channel`:
  - `PetaloCampaign`: `channel: "PETALO"`, `stores: string[]`, `quantity`, `zone: PetaloZone`.
  - `ParrilleraCampaign`: `channel: "PARRILLERA"`, `stores: string[]`, `quantity`, `levels`,
    `category`.
  - `SmsCampaign`: `channel: "SMS"`, `segment`, `estimatedAudience`, `template`,
    `sendWindow: { from, to }`.
  - `TiktokCampaign`: `channel: "TIKTOK"`, `adAccount`, `objective`, `creatives: string[]`,
    `dailyBudgetUsd`.
- `Campaign = PetaloCampaign | ParrilleraCampaign | SmsCampaign | TiktokCampaign`.
- `NewCampaignInput = DistributiveOmit<Campaign, "id" | "createdAt" | "updatedAt" | "status" | "totalCostUsd" | "createdBy" | "currentApprovalComment">`
  — la forma que usan tanto el formulario de creación/edición (frontend) como los casos de uso de
  crear/actualizar (backend). Los campos asignados por el servidor nunca son parte del input del
  cliente; `campaignDate`, en cambio, sí lo es (la fija el analista).
- `Brand { id, name }`, `Product { sku, name, brandId }`, `Supplier { id, name }`.
- `PricingModel = "PER_UNIT" | "FLAT"` — determina cómo un costo unitario se convierte en total
  (la función que hace esa conversión, `calculateTotalCost`, vive en el backend, no en este
  paquete — ver más abajo). Puesto en el catálogo y no en el dominio para que la lógica de costo
  nunca tenga que hacer `switch` sobre `ChannelType`.
- `MediaCost { id, supplierId, channel: ChannelType, unitCostUsd, pricingModel: PricingModel }` —
  entrada del catálogo de costos por proveedor/canal.
- `CampaignListFilters { status?: CampaignStatus[], dateFrom?, dateTo?, createdBy?, pageSize?, cursor? }`.
- `Paginated<T> { items: T[], nextCursor: string | null }` — genérico de paginación por cursor.

### `approval.ts`

- `HistoryEntry { id, campaignId, action: "SUBMITTED" | "APPROVED" | "REJECTED", actorUid, actorRole: Role, comment?, occurredAt }`
  — **no existe una entidad `Approval` separada**: este es el único modelo de trazabilidad. Cada
  transición de estado (enviar/aprobar/rechazar) es un registro append-only en la subcolección
  `history` de la campaña; una decisión de aprobación/rechazo es simplemente otra entrada en el
  mismo log cronológico que el envío del analista.

### `firestore.ts`

- `FIRESTORE_COLLECTIONS = { campaigns, brands, products, suppliers, mediaCosts } as const` —
  nombres de colecciones, leídos tanto por el backend (Admin SDK, scripts de seed) como por el
  frontend (client SDK, para lecturas directas de datos de referencia), centralizados para que un
  rename no pueda divergir silenciosamente entre ambos lados.
- `CAMPAIGN_HISTORY_SUBCOLLECTION = "history"` — subcolección de `campaigns/{id}` con el log de
  historial append-only.

## Esquemas zod exportados (`schemas.ts`)

Estos esquemas "mirroran" `NewCampaignInput` y se mantienen aquí para que backend (validación de
requests) y frontend (validación de formularios) corran exactamente las mismas reglas, con los
mismos mensajes de error en español, en vez de dos copias mantenidas a mano.

- **`newCampaignInputSchema`** — `z.discriminatedUnion("channel", [...])` sobre los 4 esquemas de
  canal (`PETALO`/`PARRILLERA`/`SMS`/`TIKTOK`), cada uno con los campos comunes
  (`name`, `brandIds`, `productSkus`, `supplierId`, `startDate`, `endDate`, `campaignDate`, todos
  obligatorios con mensajes como "El nombre de la campaña es obligatorio") más sus campos
  específicos validados (p. ej. `quantity` entero positivo, `stores` mínimo 1 elemento,
  `dailyBudgetUsd` número positivo, `creatives` mínimo 1 elemento). Es el validador principal del
  payload de creación/edición de campaña — usado por
  `apps/backend/.../campaigns.controller.ts` para validar el body de las requests, y por
  `apps/frontend/.../useCampaignForm.ts` para validar el formulario antes de enviarlo.
- **`rejectCampaignSchema`** — `{ comment: string, trim, min 1 }` ("El comentario de rechazo es
  obligatorio"). Usado por el endpoint `POST /campaigns/:id/reject` del backend.
- **`campaignStatusSchema`** — `z.enum(CAMPAIGN_STATUSES)`. Usado dentro de
  `campaignListFiltersSchema` y también de forma suelta en el DTO de listado del backend
  (`list-campaigns.query.ts`).
- **`campaignListFiltersSchema`** — `{ status?: CampaignStatus[], dateFrom?, dateTo?, createdBy?, pageSize?: entero positivo máx. 100, cursor? }`.
  Modela la validación completa de los filtros de listado; el controller de listado del backend
  actualmente usa su propio parser manual en vez de este esquema (ver
  [apps/backend/README.md](../../apps/backend/README.md)), por lo que hoy el tope de `pageSize` no
  se aplica en ese endpoint aunque el esquema sí lo define.

## Utilidad de tipos (`utils.ts`)

- `DistributiveOmit<T, K> = T extends unknown ? Omit<T, K> : never` — un `Omit` nativo de
  TypeScript colapsa una unión discriminada a la intersección de sus claves (porque `keyof` de una
  unión es la intersección de las claves de cada miembro), perdiendo los campos específicos de cada
  canal. Esta versión distribuye el `Omit` sobre cada miembro de la unión, así campos como
  `stores`, `zone`, `segment` o `creatives` sobreviven. Se usa exclusivamente para definir
  `NewCampaignInput`.

**Importante**: este paquete **no contiene lógica de negocio** — ni cálculo de costos, ni la
máquina de estados de campaña, ni helpers de formateo/fecha. `calculateTotalCost` (que busca el
`MediaCost` correspondiente y aplica `PER_UNIT`/`FLAT`) vive deliberadamente en
`apps/backend/src/campaigns/domain/cost-calculator.ts`, que solo importa los *tipos* `ChannelType`
y `MediaCost` de aquí. `packages/types` se limita a tipos, constantes y esquemas de validación
puramente estructurales: es una capa de **contrato compartido**, no de dominio.

## Por qué existe este paquete

- Una sola fuente de verdad del modelo de dominio (`Campaign` y sus 4 variantes, `CampaignStatus`,
  `Role`, `HistoryEntry`, nombres de colecciones) entre NestJS y Next.js.
- Evita que las reglas de validación diverjan: los mismos esquemas zod validan tanto las requests
  HTTP del backend como los formularios del frontend.
- Evita definir dos veces qué estados son válidos o editables (`CAMPAIGN_STATUSES`,
  `EDITABLE_CAMPAIGN_STATUSES`), consumidos por filtros de UI, parsing de query params y guards de
  edición.
- Evita escribir a mano los nombres de colecciones de Firestore en dos lugares (Admin SDK del
  backend vs. client SDK del frontend), reduciendo el riesgo de que un rename rompa un lado sin el
  otro.
- Modela la trazabilidad de aprobación como parte del mismo log que el envío
  (`HistoryEntry.action`), evitando una entidad `Approval` redundante.
- Separa explícitamente qué campos puede enviar el cliente vs. qué asigna el servidor
  (`NewCampaignInput` vía `DistributiveOmit`), para que el frontend nunca intente enviar (ni el
  backend confíe en) `status`, `totalCostUsd`, `id`, timestamps o `createdBy` desde el cliente.
