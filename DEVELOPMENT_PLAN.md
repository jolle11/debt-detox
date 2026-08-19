# Plan de Desarrollo - Debt Detox App

## Fase 1: Configuración Inicial del Proyecto

### 1.1 Configuración de Dependencias

- [x] Instalar y configurar PocketBase
- [ ] Configurar UploadThing para manejo de archivos
- [ ] Instalar Origin UI y configurar componentes
- [ ] Instalar Sonner para notificaciones
- [ ] Instalar Phosphor Icons
- [ ] Instalar date-fns para manejo de fechas
- [ ] Instalar recharts para gráficos
- [ ] Instalar React Query + Axios para peticiones
- [x] Configurar Biome (reemplazar ESLint)
- [x] Configurar Husky + Commitlint para git hooks
- [x] Configurar variables de entorno

### 1.2 Estructura de Base de Datos (PocketBase)

- [x] Crear colección `debts` con campos:
    - `id` (auto)
    - `name` (texto) - Nombre de la deuda
    - `entity` (texto) - Entidad contratante
    - `start_date` (fecha)
    - `end_date` (fecha)
    - `initial_amount` (número, opcional)
    - `final_amount` (número)
    - `tin` (número, opcional) - Tipo de Interés Nominal
    - `tae` (número, opcional) - Tasa Anual Equivalente
    - `product_image` (archivo, opcional)
    - `created` (fecha auto)
    - `updated` (fecha auto)

- [x] Crear colección `payments` con campos:
    - `id` (auto)
    - `debt_id` (relación con debts)
    - `month` (número) - Mes del pago (1-12)
    - `year` (número)
    - `planned_amount` (número) - Cantidad planificada
    - `actual_amount` (número, opcional) - Cantidad real pagada
    - `paid` (booleano) - Si está pagado o no
    - `paid_date` (fecha, opcional)
    - `created` (fecha auto)

## Fase 2: Hooks y Lógica Base

### 2.1 API Layer con React Query + Axios

- [ ] Configurar Axios client con interceptors
- [ ] Configurar React Query provider y client
- [ ] `useDebtsQuery()` - Query para obtener deudas
- [ ] `useDebtMutation()` - Mutations para CRUD de deudas
- [ ] `usePaymentsQuery()` - Query para obtener pagos
- [ ] `usePaymentMutation()` - Mutations para CRUD de pagos
- [ ] `useFileUploadMutation()` - Mutation para subir archivos

### 2.2 Custom Hooks de Lógica

- [ ] `useCalculations()` - Hook para cálculos financieros
- [ ] `useLocalStorage()` - Hook para persistencia local
- [ ] `useDateRange()` - Hook para manejo de rangos de fechas
- [ ] `useNotifications()` - Hook para sonner notifications

### 2.3 Componentes Pequeños y Enfocados

- [ ] `DebtCard` - Tarjeta individual de deuda
- [ ] `ProgressBar` - Barra de progreso simple
- [ ] `AmountDisplay` - Mostrar cantidades formateadas
- [ ] `DateDisplay` - Mostrar fechas formateadas
- [ ] `PaymentStatus` - Indicador de estado de pago
- [ ] `FileUploader` - Componente de subida de archivos
- [ ] `Calculator` - Calculadora básica

## Fase 3: Funcionalidades Core

### 3.1 Gestión de Deudas

- [ ] Página `DebtsList` usando `useDebtsQuery()`
- [ ] Formulario `NewDebtForm` con `useDebtMutation()`
- [ ] Formulario `EditDebtForm` reutilizando mutations
- [ ] Hook `useDebtForm()` para lógica compartida
- [ ] Componente `DeleteDebt` con mutation optimista

### 3.2 Sistema de Cálculos con Hooks

- [ ] `useProgressCalculation()` - Calcular porcentajes
- [ ] `useSavingsCalculator()` - Calcular ahorros necesarios
- [ ] `useAmountCalculations()` - Cálculos de importes
- [ ] `usePaymentProjections()` - Proyecciones de pagos

### 3.3 Gestión de Pagos

- [ ] Hook `usePaymentCalendar()` - Usando React Query
- [ ] Componente `PaymentItem` - Item individual de pago
- [ ] Hook `usePaymentForm()` - Con mutations optimistas
- [ ] Componente `MonthlyProgress` - Progreso mensual

## Fase 4: Funcionalidades Avanzadas

### 4.1 Dashboard y Analytics

- [ ] Hook `useDashboardData()` - Múltiples queries paralelas
- [ ] Componente `StatsCard` - Tarjetas de estadísticas
- [ ] Hook `useChartData()` - Datos para gráficos Recharts
- [ ] Componente `ProgressChart` - Gráfico de progreso
- [ ] Queries con staleTime para optimización

### 4.2 Calculadora de Ahorros

- [ ] Hook `useSavingsSimulator()` - Simulaciones en tiempo real
- [ ] Componente `ScenarioCalculator` - Calculadora de escenarios
- [ ] Hook `useGoalProjection()` - Proyecciones de objetivos

### 4.3 Gestión de Archivos

- [ ] Hook `useImageGallery()` - Query + mutation para imágenes
- [ ] Componente `ImagePreview` - Preview de imagen
- [ ] Hook `useFileManager()` - Con React Query cache

## Fase 5: Optimización y Pulido

### 5.1 Performance y UX

- [ ] Configurar React Query cache strategies
- [ ] Implementar optimistic updates
- [ ] Background refetching para datos críticos
- [ ] Error boundaries y retry logic
- [ ] Componente `LoadingState` - Estados de carga
- [ ] Hook `useResponsive()` - Lógica responsive

### 5.2 Funcionalidades Extra

- [ ] Hook `useExportData()` - Exportación con queries
- [ ] Hook `useBackup()` - Backup y restauración
- [ ] Hook `useUserSettings()` - Configuraciones con cache

## Estructura de Archivos

```
app/
├── (dashboard)/
│   ├── page.tsx                 # Dashboard usando múltiples queries
│   ├── debts/
│   │   ├── page.tsx            # Lista usando useDebtsQuery()
│   │   ├── [id]/page.tsx       # Detalle usando useDebtQuery()
│   │   └── new/page.tsx        # Nuevo usando mutations
├── components/
│   ├── ui/                     # Componentes pequeños de Origin UI
│   ├── debt/                   # Componentes específicos pequeños
│   ├── payment/                # Componentes de pago pequeños
│   └── charts/                 # Componentes de gráficos pequeños
├── hooks/
│   ├── queries/                # React Query hooks
│   │   ├── use-debts.ts        # Queries y mutations de deudas
│   │   ├── use-payments.ts     # Queries y mutations de pagos
│   │   └── use-files.ts        # Queries y mutations de archivos
│   ├── use-calculations.ts     # Hook de cálculos
│   ├── use-local-storage.ts    # Hook de localStorage
│   └── use-notifications.ts    # Hook de sonner
├── lib/
│   ├── axios.ts               # Configuración de Axios
│   ├── query-client.ts        # Configuración de React Query
│   ├── pocketbase.ts          # Configuración PocketBase
│   ├── calculations.ts        # Funciones puras de cálculo
│   ├── date-utils.ts          # Utilidades de fecha
│   └── types.ts               # Tipos TypeScript
├── biome.json                 # Configuración de Biome
├── .husky/                    # Git hooks con Husky
│   ├── pre-commit            # Hook pre-commit (Biome check)
│   └── commit-msg            # Hook commit-msg (Commitlint)
├── commitlint.config.js      # Configuración de Commitlint
```

## Principios de Arquitectura

### Componentes Pequeños

- Cada componente tiene una responsabilidad única
- Máximo 50-100 líneas por componente
- Props tipadas y bien definidas
- Reutilización mediante composición

### React Query + Axios

- Server state management con React Query
- Cliente HTTP con Axios + interceptors
- Optimistic updates para mejor UX
- Cache inteligente y invalidación
- Background refetching automático

### Hooks Primero

- Lógica de estado en custom hooks
- Queries y mutations encapsuladas
- Separación clara entre lógica y presentación
- Testing más fácil de hooks aislados

## Stack de Tecnologías

- **Framework**: Next.js 15 + React 19 + TypeScript
- **Base de Datos**: PocketBase
- **HTTP Client**: Axios + React Query
- **Linter/Formatter**: Biome (no ESLint)
- **Git Hooks**: Husky + Commitlint
- **Estilos**: Tailwind CSS v4 + Origin UI
- **Subida de Archivos**: UploadThing
- **Fechas**: date-fns
- **Gráficos**: Recharts
- **Iconos**: @phosphor-icons/react
- **Notificaciones**: sonner
- **Forms**: react-hook-form + zod
- **Patrón**: Hooks + Componentes pequeños + React Query

## Comandos de Desarrollo

- `pnpm dev` - Desarrollo con Turbopack
- `pnpm build` - Build de producción
- `pnpm start` - Servidor de producción
- `pnpm check` - Biome check (lint + format)
- `pnpm format` - Biome format
- `pnpm lint` - Biome lint

## Estimación de Tiempo

- **Fase 1**: 1-2 días (incluye configuración Biome + React Query)
- **Fase 2**: 2-3 días (setup queries y hooks base)
- **Fase 3**: 4-5 días
- **Fase 4**: 3-4 días
- **Fase 5**: 2-3 días

**Total estimado**: 12-17 días de desarrollo