# Debt Detox

Debt Detox es una aplicación web para controlar deudas, préstamos y financiaciones desde un único sitio. Permite registrar cuotas, visualizar el progreso real de amortización, gestionar pagos extra y compartir vistas privadas cuando necesitas enseñar tu situación sin dar acceso a tu cuenta.

La app está construida con Next.js App Router y usa PocketBase como backend ligero para autenticación, persistencia y enlaces compartidos.

## Qué resuelve

Cuando llevas varias financiaciones a la vez, lo normal es terminar con hojas sueltas, apps bancarias distintas y poco contexto sobre cuánto queda realmente por pagar. Debt Detox centraliza ese seguimiento:

- Registra cada financiación con importes, fechas y entidad.
- Calcula importe total, pagado, restante y porcentaje de progreso.
- Permite marcar cuotas mensuales y añadir pagos extra.
- Recalcula el plan cuando haces amortizaciones anticipadas.
- Genera enlaces privados para compartir una deuda o un perfil resumido.

## Funcionalidades actuales

- Dashboard con resumen de deuda total, cuota mensual agregada, progreso medio y financiaciones activas/completadas.
- Alta, edición, eliminación lógica y cierre manual de financiaciones.
- Registro de cuotas mensuales y gestión de pagos históricos al crear una deuda que ya empezó en el pasado.
- Pagos extra con distintas estrategias:
  - Solo registrar el pago.
  - Mantener importe mensual y reducir número de cuotas.
  - Mantener duración y reducir importe mensual.
- Página de detalle por deuda con fechas, estructura, pagos y métricas rápidas.
- Perfil de usuario con cambio de nombre, email, contraseña y moneda preferida.
- Compartición privada mediante enlaces temporales para:
  - Una deuda individual.
  - Un perfil resumido con opciones de privacidad.
- Internacionalizacion con `es`, `en`, `fr`, `de`, `pt` y `nl`.
- Metadata SEO, Open Graph, sitemap y `robots`.
- Manifest PWA y caché básica de app shell en producción.

## Stack

- `Next.js 16` + `React 19` + `TypeScript`
- `Tailwind CSS v4` + `DaisyUI`
- `TanStack Query` para caché y sincronización cliente
- `PocketBase` como backend y auth
- `next-intl` para localización
- `react-hook-form` + `zod` para formularios y validación
- `sonner` para notificaciones

## Arquitectura

```text
app/                Rutas App Router, layouts, metadata, share pages
components/         UI por dominio (auth, dashboard, debt, profile, landing, share)
contexts/           Estado global de autenticación y deudas
hooks/              Casos de uso contra PocketBase y lógica de cliente
lib/                Tipos, schemas, SEO, formatos, cliente PocketBase
messages/           Traducciones por idioma
data/               Datos de landing/demo
public/             Iconos PWA, imágenes y service worker
utils/              Cálculos puros de deuda y cuotas
```

## Flujo técnico

- El frontend habla directamente con PocketBase desde el cliente a través de `lib/pocketbase.ts`.
- La sesión se gestiona con `pb.authStore` dentro de [`contexts/AuthContext.tsx`](/Users/jordiolleballeste/Desktop/debt-detox/contexts/AuthContext.tsx).
- Las deudas, pagos y enlaces compartidos se consumen mediante hooks basados en React Query.
- El contenido público compartido se resuelve mediante las rutas [`app/share/[token]/page.tsx`](/Users/jordiolleballeste/Desktop/debt-detox/app/share/[token]/page.tsx) y [`app/share/profile/[token]/page.tsx`](/Users/jordiolleballeste/Desktop/debt-detox/app/share/profile/[token]/page.tsx).

## Requisitos

- `Node.js 20+`
- `pnpm` recomendado
- Una instancia de PocketBase accesible desde el navegador

## Puesta en marcha

1. Instala dependencias:

```bash
pnpm install
```

2. Crea un `.env.local` con las variables necesarias:

```bash
NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. Arranca PocketBase y configura las colecciones necesarias.

La opción recomendada ya incluida en el repositorio es:

```bash
pnpm pb:up
```

Esto construye la versión fijada de PocketBase, aplica las migraciones y conserva los datos locales en `pocketbase/pb_data`.

4. Inicia la aplicación:

```bash
pnpm dev
```

5. Abre `http://localhost:3000`.

## Variables de entorno

| Variable | Requerida | Descripción |
| --- | --- | --- |
| `NEXT_PUBLIC_POCKETBASE_URL` | Si | URL base de PocketBase usada por el SDK del frontend. |
| `NEXT_PUBLIC_SITE_URL` | No | URL canónica del sitio para SEO, Open Graph y sitemap. Si no existe, se usa `https://debtdetox.vercel.app`. |

## Configuración de PocketBase

El archivo [`POCKETBASE-SCHEMA.md`](/Users/jordiolleballeste/Desktop/debt-detox/POCKETBASE-SCHEMA.md) sirve como punto de partida, pero el código actual usa algunos campos adicionales. Si quieres levantar el proyecto sin errores, configura esto:

### Colección auth `users`

Usa la colección de autenticación de PocketBase y añade estos campos opcionales:

- `name` - `text`
- `currency` - `text` con valor por defecto recomendado `EUR`

### Colección `debts`

Campos mínimos:

- `user_id` - relation a `users`
- `name` - text
- `entity` - text
- `down_payment` - number
- `first_payment_date` - date
- `monthly_amount` - number
- `number_of_payments` - number
- `original_monthly_amount` - number
- `original_number_of_payments` - number
- `final_payment` - number
- `final_payment_date` - date
- `product_image` - file
- `deleted` - date

### Colección `payments`

- `debt_id` - relation a `debts`
- `month` - number
- `year` - number
- `planned_amount` - number
- `actual_amount` - number
- `paid` - bool
- `paid_date` - date
- `is_extra_payment` - bool
- `deleted` - date

### Colección `shared_debts`

- `token` - text, único
- `debt_id` - relation a `debts`
- `user_id` - relation a `users`
- `expires_at` - date
- `show_amounts` - bool
- `show_entity` - bool
- `show_dates` - bool
- `deleted` - date

### Colección `shared_profiles`

- `token` - text, único
- `user_id` - relation a `users`
- `expires_at` - date
- `show_amounts` - bool
- `show_debt_list` - bool
- `show_completed` - bool
- `deleted` - date

### Reglas de acceso recomendadas

El archivo [`POCKETBASE-SCHEMA.md`](/Users/jordiolleballeste/Desktop/debt-detox/POCKETBASE-SCHEMA.md) incluye reglas base para que cada usuario vea solo sus datos y para que los enlaces compartidos solo funcionen mientras no hayan expirado ni sido revocados. Úsalo como referencia directa al configurar PocketBase.

## Scripts útiles

```bash
pnpm dev      # Desarrollo con Turbopack
pnpm build    # Build de producción
pnpm start    # Servir la build
pnpm lint     # Lint del proyecto
```

## Rutas principales

- `/` o `/<locale>`: landing pública
- `/<locale>/dashboard`: resumen de financiaciones
- `/<locale>/debt/[id]`: detalle de una deuda
- `/<locale>/profile`: ajustes de usuario
- `/share/[token]`: vista compartida de una deuda
- `/share/profile/[token]`: vista compartida de un perfil

## Notas de producto

- El service worker solo se registra en `production`.
- La PWA ofrece instalación y caché básica de navegación/activos, pero no un modo offline completo para datos de PocketBase.
- La subida de imagen de producto está contemplada a nivel de esquema y visualización, aunque la UI de carga todavía no está terminada.
- No hay suite de tests automatizados en este momento.

## Documentación auxiliar del repo

- [`POCKETBASE-SCHEMA.md`](/Users/jordiolleballeste/Desktop/debt-detox/POCKETBASE-SCHEMA.md): esquema y reglas para PocketBase
- [`FEATURES.md`](/Users/jordiolleballeste/Desktop/debt-detox/FEATURES.md): backlog de mejoras futuras
- [`DEVELOPMENT_PLAN.md`](/Users/jordiolleballeste/Desktop/debt-detox/DEVELOPMENT_PLAN.md): notas de planificación
- [`pocketbase/README.md`](/Users/jordiolleballeste/Desktop/debt-detox/pocketbase/README.md): desarrollo y mantenimiento del backend versionado
- [`docs/POCKETBASE-RAILWAY-RUNBOOK.md`](/Users/jordiolleballeste/Desktop/debt-detox/docs/POCKETBASE-RAILWAY-RUNBOOK.md): migración, despliegue, rollback y tareas manuales de Railway

## Estado

El proyecto está orientado a uso real en cliente y depende de una configuración correcta de PocketBase. Si vas a desplegarlo, conviene revisar especialmente:

- reglas de acceso de las colecciones
- `NEXT_PUBLIC_SITE_URL`
- expiración y revocación de enlaces compartidos
- estrategia de backup de PocketBase
