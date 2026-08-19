# Features Futuras - Debt Detox

Listado de mejoras y funcionalidades sugeridas para implementar en el futuro, ordenadas por prioridad.

---

## Alta Prioridad

### 1. Notificaciones con Sonner
**Esfuerzo**: S
**Descripción**: Reemplazar las alertas inline de los modales por toasts no intrusivos que aparecen y desaparecen automáticamente.
**Afecta a**: Crear deuda, editar, eliminar, completar, marcar pagos, cambios de perfil.
**Dependencias**: `sonner`
**Notas**: Instalar `sonner`, añadir `<Toaster />` en `ClientLayout`, y reemplazar los `alert alert-error/success` dentro de los modales.

---

### 2. Resumen de próximos pagos
**Esfuerzo**: S
**Descripción**: Sección en el dashboard que muestre los pagos que vencen en los próximos 30-60 días, ordenados por fecha. Permite saber de un vistazo qué deudas hay que pagar próximamente.
**Afecta a**: `components/dashboard/`, posiblemente un nuevo componente `UpcomingPayments.tsx`.
**Dependencias**: Ninguna nueva — usa datos ya disponibles en `usePayments` y `useDebts`.

---

### 3. Subida de imagen del producto
**Esfuerzo**: M
**Descripción**: El schema de PocketBase ya tiene el campo `product_image` y existe `DebtProductImage.tsx` que lo consume, pero no hay UI para subir imágenes. PocketBase gestiona ficheros de forma nativa, no hace falta UploadThing.
**Afecta a**: `components/debt/CreateDebtForm.tsx`, `components/debt/EditDebtForm.tsx`, `components/debt/detail/DebtProductImage.tsx`.
**Dependencias**: Ninguna nueva — PocketBase SDK soporta `FormData` para ficheros.
**Notas**: Usar `pb.collection("debts").update(id, formData)` donde `formData` incluye el fichero como `File`.

---

## Media Prioridad

### 4. Gráfico de evolución de deuda
**Esfuerzo**: M
**Descripción**: Gráfico de línea en la página de detalle de deuda que muestre cómo evoluciona el saldo pendiente mes a mes. Muy útil visualmente para ver el progreso real a lo largo del tiempo.
**Afecta a**: `app/[locale]/debt/[id]/page.tsx`, nuevo componente `components/debt/detail/DebtEvolutionChart.tsx`.
**Dependencias**: `recharts`
**Datos necesarios**: Combinar `first_payment_date`, `monthly_amount`, `number_of_payments` y pagos registrados para construir la serie temporal.

---

### 5. Exportar a PDF / CSV
**Esfuerzo**: M
**Descripción**: Exportar el listado de pagos de una deuda o el resumen del dashboard. Útil para llevar un registro fuera de la app o compartirlo con un asesor financiero.
**Afecta a**: `components/debt/detail/` (export por deuda), `components/dashboard/` (export global).
**Dependencias**: `jspdf` + `jspdf-autotable` para PDF, o simplemente generar CSV sin dependencias.
**Notas**: Empezar por CSV que no requiere dependencias. El PDF puede añadirse después.

---

### 6. Validación de formularios con Zod
**Esfuerzo**: M
**Descripción**: Los formularios actuales usan `useState` manual sin validación real más allá del atributo `required` de HTML. Añadir validación que impida: importes negativos, número de cuotas 0 o negativo, fecha de última cuota anterior a la primera, etc.
**Afecta a**: `components/debt/CreateDebtForm.tsx`, `components/debt/EditDebtForm.tsx`.
**Dependencias**: `zod`, `react-hook-form`, `@hookform/resolvers`
**Notas**: Crear schema compartido en `lib/schemas/debt.ts` reutilizable en ambos formularios.

---

### 7. Calculadora de ahorros
**Esfuerzo**: M
**Descripción**: Herramienta que permite simular cuánto se tardaría en saldar una deuda si se hacen pagos extra periódicos, o cuánto hay que ahorrar al mes para llegar a un objetivo en una fecha concreta.
**Afecta a**: Nueva página `app/[locale]/calculator/page.tsx` o modal accesible desde el detalle de deuda.
**Dependencias**: Ninguna — lógica puramente matemática en cliente.

---

## Baja Prioridad

### 8. Tests unitarios
**Esfuerzo**: L
**Descripción**: Las funciones de cálculo en `lib/format.ts` y `utils/debtCalculations.ts` son las más críticas y las más fáciles de testear al ser funciones puras. Empezar por ahí antes de añadir tests de integración.
**Dependencias**: `vitest`, `@testing-library/react`
**Primeros targets**:
- `calculateElapsedPayments` — casos edge: mismo día, día anterior, día posterior, año bisiesto
- `calculateTotalAmount`
- `calculatePaidAmountWithPayments`
- `calculatePaymentStats`

---

### 9. Rate limiting en login
**Esfuerzo**: S
**Descripción**: Añadir backoff exponencial en el cliente tras varios intentos fallidos de login. Deshabilitar el botón de submit por 2^n segundos tras n fallos consecutivos.
**Afecta a**: `components/auth/LoginForm.tsx`
**Dependencias**: Ninguna.

---

### 10. Modo offline / PWA
**Esfuerzo**: L
**Descripción**: Convertir la app en una PWA instalable con soporte offline básico (ver deudas cacheadas sin conexión). Next.js tiene soporte nativo para esto con `next-pwa`.
**Dependencias**: `next-pwa`
**Notas**: Requiere estrategia de caché cuidadosa para no mostrar datos desactualizados.

---

### 11. Notificaciones push / recordatorios
**Esfuerzo**: L
**Descripción**: Enviar una notificación (push o email) cuando se acerca la fecha de un pago mensual. Requiere infraestructura de notificaciones en PocketBase o un servicio externo.
**Dependencias**: Web Push API + service worker, o integración con servicio de email en PocketBase.

---

## Mejoras Técnicas Pendientes

### Tests de integración para hooks
Testear `usePayments`, `useDebts` y `useCreateDebt` con un mock de PocketBase.

### Auditoría RSC
Revisar componentes de la landing (`components/landing/*`) para eliminar `"use client"` innecesario y aprovechar el renderizado en servidor de Next.js.

### Optimistic updates
Implementar actualizaciones optimistas en React Query para que las acciones (marcar pago, editar deuda) se reflejen instantáneamente en la UI sin esperar la respuesta de PocketBase.
