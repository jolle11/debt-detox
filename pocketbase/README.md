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
- Healthcheck: `http://127.0.0.1:8090/api/health`

La primera ejecución imprime en los logs un enlace de instalación para crear el primer superusuario. También puede crearse desde el contenedor:

```bash
docker compose exec pocketbase ./pocketbase superuser create correo@example.com 'contraseña-larga'
```

Detener el servicio no elimina los datos:

```bash
pnpm pb:down
```

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
