# Seed de datos iniciales

Se ejecuta con:

```bash
npm run seed          # desarrollo (ts-node)
npm run seed:prod     # compilado (nest build + node dist/seed/seed.js)
```

El script es **idempotente**: ejecutarlo varias veces no duplica usuarios ni
municipios.

## 1. Administrador inicial

Lee del `.env`:

| Variable         | Descripción                                              |
| ---------------- | -------------------------------------------------------- |
| `ADMIN_EMAIL`    | Email del admin (también se usa para iniciar sesión).     |
| `ADMIN_PASSWORD` | Contraseña; mínimo 8 caracteres. Se guarda hasheada (bcrypt). |
| `ADMIN_NOMBRE`   | Nombre completo del admin.                                |

Reglas de seguridad:

- **No hay credenciales por defecto**: si falta o es inválida alguna variable,
  el seed aborta con error.
- La contraseña debe tener al menos 8 caracteres, una letra y un número.
- El admin se crea solo si el email no existe, con rol `admin` y estado
  `activo`. Si el email ya existe con otro rol, avisa y no lo modifica.

## 2. Municipios base (`municipios.json`)

El archivo `src/seed/municipios.json` contiene los 30 municipios del
**departamento de Córdoba (Colombia)**. El seed inserta sus nombres y no
mantiene una lista paralela en el código:

```json
["Montería", "Lorica", ...]
```

```json
[{ "nombre": "Montería" }, { "nombre": "Lorica" }]
```

```json
{ "municipios": ["Montería", "Lorica"] }
```

La carga es idempotente y omite municipios que ya existan, comparando los
nombres sin distinguir mayúsculas/minúsculas.
