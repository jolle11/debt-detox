# PocketBase de Debt Detox

Esta carpeta es la fuente de verdad del backend. La imagen fija PocketBase 0.39.1, igual que la instancia de producción durante la migración, y despliega las migraciones y hooks incluidos en Git. `pb_data` es estado de ejecución y nunca debe versionarse.

## Desarrollo local

Requiere Docker Desktop:

```bash
pnpm pb:up
pnpm pb:logs
```

- API: `http://127.0.0.1:8090/api/`
- Dashboard: `http://127.0.0.1:8090/_/`
- Healthcheck propio: `http://127.0.0.1:8090/api/debt-detox/health`

La primera ejecución imprime en los logs un enlace de instalación para crear el primer superusuario. También puede crearse desde el contenedor:

```bash
docker compose exec pocketbase ./pocketbase superuser create correo@example.com 'contraseña-larga'
```

Detener el servicio no elimina los datos:

```bash
pnpm pb:down
```

Para cambiar la contraseña de un registro de `users` cuando el dashboard no muestra los campos protegidos, ejecuta la utilidad interactiva desde la raíz del proyecto:

```bash
pnpm pb:reset-user-password
```

La utilidad solicita las credenciales de superusuario y la nueva contraseña sin mostrarlas ni guardarlas en archivos o argumentos del proceso.

## Pruebas de integración

La suite construye una imagen PocketBase desechable, aplica todas las migraciones y prueba rutas y permisos mediante la API pública real:

```bash
pnpm test:pb
```

Requiere Docker y no utiliza ni modifica la base local o de producción.

## Rutas de dominio

- `POST /api/debt-detox/debts`: crea una deuda, fija sus valores originales y calcula su calendario en el servidor.
- `PATCH /api/debt-detox/debts/{id}`: edita una deuda y reconcilia sus cuotas futuras sin alterar pagos realizados ni aportaciones extra.
- `POST /api/debt-detox/debts/{id}/historical-payments`: confirma todas las cuotas históricas en una única transacción idempotente.
- `POST /api/debt-detox/debts/{id}/extra-payment`: registra un pago extra y recalcula la deuda dentro de una única transacción.
- `POST /api/debt-detox/debts/{id}/complete`: completa la deuda y todos sus pagos ordinarios dentro de una única transacción idempotente.

Para empezar de cero, elimina manualmente `pocketbase/pb_data` únicamente después de comprobar que no contiene datos necesarios.

## Flujo de cambios

1. Arranca PocketBase localmente.
2. Cambia el esquema desde el dashboard local o crea una migración manual.
3. Revisa el nuevo archivo de `pb_migrations`.
4. Prueba la aplicación.
5. Comprueba la migración sobre una copia restaurada de producción.
6. Haz commit de hooks y migraciones juntos.

El binario tiene `automigrate` habilitado: los cambios de colecciones hechos en el dashboard local generan migraciones automáticamente. El dashboard de producción no debe utilizarse para cambios ordinarios de esquema.

## Directorios

- `pb_migrations`: esquema, reglas e índices versionados.
- `pb_hooks`: lógica ejecutada dentro de PocketBase.
- `pb_data`: SQLite, uploads, configuración, secretos y backups locales; ignorado por Git.

La migración inicial funciona tanto sobre una base vacía como sobre la estructura existente documentada de Debt Detox. En adopción conserva registros e IDs y endurece las reglas de acceso.

## Actualizar PocketBase

1. Lee completo el changelog entre la versión actual y la nueva.
2. Crea y descarga un backup de producción.
3. Cambia `PB_VERSION` en `Dockerfile` y `docker-compose.yml`.
4. Construye y prueba una base vacía.
5. Restaura una copia de producción y vuelve a probar.
6. Despliega primero en un entorno de staging.

Nunca uses una versión flotante como `latest`.
