# Handy Backend

API REST del backend de **Handy**, construida con [NestJS](https://nestjs.com), TypeORM y MySQL. Gestiona usuarios (admin, cliente, trabajador), solicitudes de servicio, portafolio de oficios, calificaciones, disponibilidades y reportes de incidentes, con autenticación JWT y control de acceso por roles.

## Requisitos

- Node.js 20 o superior
- MySQL 8 (o compatible)
- npm

## Instalación

```bash
npm install
```

## Configuración

El proyecto se configura con variables de entorno. Copia el archivo de ejemplo y ajusta los valores:

```bash
copy .env.example .env      # Windows (cmd)
# cp .env.example .env      # Linux / macOS
```

| Variable         | Descripción                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------- |
| `NODE_ENV`       | `development` o `production`. En producción se desactivan `synchronize` y Swagger.              |
| `PORT`           | Puerto HTTP de la API (por defecto `3000`).                                                    |
| `DB_HOST`        | Host de MySQL.                                                                                |
| `DB_PORT`        | Puerto de MySQL.                                                                              |
| `DB_USERNAME`    | Usuario de la base de datos.                                                                  |
| `DB_PASSWORD`    | Contraseña (si no existe, se usa cadena vacía).                                               |
| `DB_DATABASE`    | Nombre de la base de datos.                                                                   |
| `JWT_SECRET`     | Clave para firmar los tokens JWT. Debe ser larga y aleatoria en producción.                    |
| `JWT_EXPIRATION` | Duración del token: segundos (`900`) o intervalos (`15m`, `1d`).                               |
| `CORS_ORIGINS`   | Orígenes permitidos separados por comas. Obligatoria en producción; no admite `*`. |
| `THROTTLE_TTL_MS`| Ventana del rate limiting global en ms (por defecto `60000`).                                  |
| `THROTTLE_LIMIT` | Peticiones máximas por ventana por IP (por defecto `100`).                                     |

> Nunca subas el archivo `.env` al repositorio (ya está en `.gitignore`).
> Las contraseñas nuevas deben tener al menos 8 caracteres, una letra y un
> número. Un usuario autenticado puede cambiarlas en `POST /auth/cambiar-password`
> enviando `currentPassword` y `newPassword`.

## Arranque

```bash
# desarrollo (watch)
npm run start:dev

# compilación y producción
npm run build
npm run start:prod
```

Durante el desarrollo, TypeORM sincroniza el esquema automáticamente (`synchronize: true`). En producción (`NODE_ENV=production`) la sincronización automática está **desactivada** y el esquema se gestiona **exclusivamente con migraciones**.

## Migraciones de TypeORM

Las migraciones viven en `src/migrations` y se ejecutan con la CLI de TypeORM usando el datasource `src/migrations/data-source.ts`:

```bash
# Generar una migración a partir del estado actual de las entidades y la BD
npm run migration:generate

# Aplicar migraciones pendientes (uso en producción al desplegar)
npm run migration:run

# Revertir la última migración aplicada
npm run migration:revert
```

Notas:

- `migration:generate` compara las entidades con la base de datos configurada en `.env`; si no hay cambios no genera archivo.
- Al crear una nueva migración, impórtala y agrégala a la lista `migrations` de `src/migrations/data-source.ts` (se hace de forma explícita por compatibilidad con rutas con caracteres especiales).
- Si la base de datos ya tiene el esquema creado (por ejemplo, por haber usado `synchronize` antes), registra la migración inicial como aplicada insertando una fila en la tabla `migrations`:

  ```sql
  INSERT INTO migrations (timestamp, name) VALUES (1794960401459, 'Migrations1794960401459');
  ```

## Datos iniciales (seed)

Para producción se necesita un usuario administrador y los municipios base.
Ambos se cargan con el seed:

```bash
npm run seed
```

- **Admin**: se crea a partir de `ADMIN_EMAIL`, `ADMIN_PASSWORD` y
  `ADMIN_NOMBRE` del `.env` (contraseña hasheada con bcrypt, cuenta activa).
  No hay credenciales por defecto: si falta alguna variable, el seed aborta.
- **Municipios**: se cargan desde `src/seed/municipios.json`, que debe
  contener los 30 municipios de Córdoba (Colombia). El archivo incluido
  contiene esa lista y el seed omite nombres que ya existan.

El seed es idempotente: no duplica usuarios ni municipios. Más detalles en
[`src/seed/README.md`](src/seed/README.md).

## Seguridad

- **Helmet**: cabeceras HTTP de seguridad activadas globalmente.
- **Rate limiting** (`@nestjs/throttler`): límite global configurable por variables de entorno y límite estricto de **5 peticiones por minuto por IP** en `POST /auth/login` y `POST /auth/register`.
- **CORS**: restringido a los orígenes de `CORS_ORIGINS`; en producción la API no inicia si faltan orígenes explícitos.
- **Swagger**: disponible en `http://localhost:PORT/api/docs` solo cuando `NODE_ENV != production`.
- **Migraciones**: en producción el esquema nunca se sincroniza automáticamente.

## Scripts útiles

| Script                  | Descripción                                    |
| ----------------------- | ---------------------------------------------- |
| `npm run build`         | Compila el proyecto a `dist/`.                 |
| `npm run start:dev`     | Arranca en modo desarrollo con watch.          |
| `npm run start:prod`    | Arranca desde `dist/main.js`.                  |
| `npm run lint`          | Ejecuta oxlint.                                |
| `npm run test`          | Ejecuta las pruebas con Jest.                  |
| `npm run migration:*`   | Genera / aplica / revierte migraciones.        |
