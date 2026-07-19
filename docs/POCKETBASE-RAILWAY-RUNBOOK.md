# Runbook: PocketBase propio en Railway

Este documento separa los pasos ya automatizados en el repositorio de las operaciones manuales que requieren acceso a Railway, al dashboard de PocketBase o a los datos de producción.

## Lo que ya está automatizado

- PocketBase 0.39.1 fijado en `pocketbase/Dockerfile`, igual que la instancia de origen.
- Build multi-arquitectura para amd64 y arm64.
- Esquema inicial de `users`, `debts`, `payments`, `shared_debts` y `shared_profiles`.
- Adopción no destructiva de las colecciones existentes.
- Migraciones automáticas al arrancar.
- Reglas por propietario para todas las escrituras.
- Acceso compartido condicionado al header y token exactos.
- Hooks que derivan `user_id` de la sesión autenticada.
- Healthcheck propio en `/api/debt-detox/health`, que confirma también la carga de hooks.
- Reinicio ante fallo y configuración Railway as code.
- Entorno local con Docker Compose.

## Fase 0: inventario obligatorio

Estas acciones son manuales porque requieren acceso a la instancia actual:

- [ ] En el dashboard actual, anota la versión exacta de PocketBase.
- [ ] Exporta la definición de colecciones como referencia.
- [ ] Comprueba que existen las cinco colecciones esperadas y que las relaciones se llaman exactamente `user_id` y `debt_id`.
- [ ] Comprueba si existen campos adicionales no documentados.
- [ ] Anota la configuración de email, OAuth, almacenamiento S3, límites, CORS y proxy.
- [ ] Cuenta registros por colección y guarda los totales.
- [ ] Comprueba cuántos archivos hay subidos y el tamaño aproximado de `pb_data`.

La versión de origen confirmada es PocketBase 0.39.1 y el repositorio usa exactamente la misma. No actualices PocketBase durante el corte; la actualización debe hacerse y probarse en un despliegue posterior.

## Fase 1: backup y ensayo local

- [ ] Activa mantenimiento o evita escrituras mientras creas el backup.
- [ ] En PocketBase: Settings > Backups > crea un backup completo.
- [ ] Descarga el ZIP a un lugar privado fuera del repositorio.
- [ ] En Railway, crea también un backup manual del volumen actual.
- [ ] Levanta el nuevo servicio local con `pnpm pb:up`.
- [ ] Abre `http://127.0.0.1:8090/_/` y restaura el ZIP en local.
- [ ] Reinicia el contenedor con `docker compose restart pocketbase`.
- [ ] Repite el recuento de registros y compáralo con producción.
- [ ] Prueba registro, login, perfil, CRUD de deuda, pagos, borrado lógico y ambos tipos de enlace compartido.

No subas el ZIP ni ninguna copia de `pb_data` a Git.

## Fase 2: crear el servicio nuevo en Railway

Acciones manuales en Railway:

1. Crea un servicio nuevo desde el mismo repositorio de GitHub.
2. Configura `Root Directory` como `/pocketbase`.
3. Confirma en los logs de build que Railway usa `pocketbase/Dockerfile`.
4. Añade la variable `PORT=8080`.
5. Añade `PB_ALLOWED_ORIGINS` con los orígenes del frontend separados por comas, por ejemplo `https://debtdetox.app,https://www.debtdetox.app`.
6. Añade un Railway Volume con mount path exacto `/pb/pb_data`.
7. Genera un dominio temporal de Railway.
8. Confirma que `https://DOMINIO/api/debt-detox/health` devuelve HTTP 200 y el identificador `debt-detox-pocketbase`.
9. Crea el primer superusuario desde el enlace de instalación de los logs o con Railway Shell.
10. Configura un healthcheck en `/api/debt-detox/health` si Railway no ha importado `railway.json`.

No montes el volumen en `/pb`: ocultaría el binario, hooks y migraciones copiados en la imagen.

## Fase 3: configuración del nuevo PocketBase

En el dashboard del servicio nuevo:

- [ ] Settings > Application: configura nombre y URL pública definitiva.
- [ ] Settings > Mail: reproduce SMTP y prueba un correo real.
- [ ] Confirma que `PB_ALLOWED_ORIGINS` incluye producción y staging; CORS se configura mediante el flag de arranque, no desde el dashboard.
- [ ] Configura trusted proxy con `X-Forwarded-For` para Railway.
- [ ] Reproduce OAuth/S3 si se utilizaban; no copies secretos al repositorio.
- [ ] Revisa los límites de subida y el tamaño máximo de `product_image` (actualmente 5 MiB).
- [ ] Revisa las plantillas de verificación, recuperación y cambio de email.
- [ ] Activa rate limiting después de medir el tráfico normal.
- [ ] Crea un segundo superusuario de recuperación y almacénalo en el gestor de contraseñas.

## Fase 4: restauración y corte

Ventana recomendada con escrituras desactivadas:

1. Crea un último backup completo de la instancia antigua.
2. Descárgalo y conserva también el backup anterior.
3. Restaura el backup final en el nuevo PocketBase.
4. Reinicia el servicio nuevo para cargar hooks y aplicar migraciones pendientes.
5. Revisa los logs: no debe haber errores de migración ni panic.
6. Compara los totales por colección y verifica varios registros manualmente.
7. Ejecuta el checklist funcional de la fase 1 contra el dominio temporal.
8. Configura el dominio definitivo, por ejemplo `api.debtdetox.app`.
9. Cambia `NEXT_PUBLIC_POCKETBASE_URL` en el servicio del frontend.
10. Redespliega Next.js. Es una variable pública incorporada durante el build; cambiarla sin redesplegar no basta.
11. Comprueba desde una ventana privada que registro, login y enlaces compartidos apuntan al backend nuevo.
12. Mantén el backend antiguo en modo solo lectura o detenido, pero no lo borres durante al menos una semana.

Rollback: vuelve a poner el valor anterior de `NEXT_PUBLIC_POCKETBASE_URL`, redespliega el frontend y reactiva el servicio antiguo. No permitas escrituras simultáneas en ambos backends.

## Fase 5: backups y operación

Acciones manuales:

- [ ] Railway > Volume > Backups: activa diario, semanal y mensual según el plan.
- [ ] Configura también backups nativos de PocketBase hacia almacenamiento S3-compatible externo.
- [ ] Guarda al menos una copia fuera del proyecto y la cuenta de Railway.
- [ ] Programa una restauración de prueba mensual en staging.
- [ ] Añade monitorización externa para `/api/debt-detox/health`; el healthcheck de despliegue de Railway no es monitorización continua.
- [ ] Configura alertas de capacidad del volumen y errores HTTP.
- [ ] Documenta quién tiene acceso de superusuario y rota credenciales periódicamente.

Railway solo permite una réplica cuando hay un volumen conectado y puede haber un breve corte durante cada redeploy. No escales PocketBase horizontalmente compartiendo el archivo SQLite.

## Checklist de aceptación

- [ ] La migración aparece aplicada en Settings > Migrations.
- [ ] Un usuario no puede leer ni modificar la deuda de otro usuario.
- [ ] Enviar otro `user_id` al crear no cambia el propietario real.
- [ ] Sin `X-Share-Token` no se pueden enumerar enlaces activos.
- [ ] Un token solo permite leer la deuda o perfil que le corresponde.
- [ ] Un token revocado o expirado deja de funcionar.
- [ ] Los archivos existentes se visualizan correctamente.
- [ ] Los correos de recuperación y verificación llegan.
- [ ] Hay un backup descargado y una restauración probada.
- [ ] El backend antiguo sigue disponible para rollback, sin aceptar nuevas escrituras.

## Cambios futuros

Para aprovechar PocketBase progresivamente, los siguientes casos deberían convertirse en rutas transaccionales dentro de `pb_hooks`:

1. Registrar un pago extra y recalcular la deuda en una sola transacción.
2. Completar una deuda y crear/actualizar todos sus pagos atómicamente.
3. Crear enlaces compartidos generando el token exclusivamente en servidor.
4. Eliminar una cuenta y limpiar sus relaciones de forma controlada.
5. Cron para revocar o purgar enlaces antiguos y mantener backups.

No conviene moverlos durante el cambio de infraestructura: primero hay que completar y observar la migración sin alterar el comportamiento funcional.
