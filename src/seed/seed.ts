/**
 * Seed de datos iniciales del backend Handy.
 *
 * Uso: `npm run seed` (o `node dist/seed/seed.js` tras compilar).
 *
 * Qué hace:
 * 1. Crea el usuario administrador inicial leyendo ADMIN_EMAIL,
 *    ADMIN_PASSWORD y ADMIN_NOMBRE del .env. Solo lo crea si no existe
 *    (idempotente: ejecutarlo varias veces no duplica nada).
 *    NUNCA usa credenciales por defecto: si falta o es inválida alguna
 *    variable, aborta con error.
 * 2. Carga los municipios base desde src/seed/municipios.json. Ese archivo
 *    debe contener la lista oficial de municipios del departamento de
 *    Córdoba (Colombia). Si el archivo está marcado como EJEMPLO
 *    ("_ejemplo": true), NO inserta nada y muestra una advertencia.
 *
 * Seguridad: las credenciales del admin solo provienen del .env; jamás se
 * escriben en el código ni en el repositorio.
 */
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { User, UserRole, UserStatus } from '../user/entities/user.entity';
import { Municipio } from '../municipio/entities/municipio.entity';
// Zona se registra por la relación inversa Municipio#zonas.
import { Zona } from '../zona/entities/zona.entity';
import { cumplePoliticaPassword } from '../user/password-policy';

/** Formas aceptadas en municipios.json: "Nombre" o { "nombre": "Nombre" }. */
type MunicipioJson = string | { nombre?: string } | null | undefined;

interface ContenidoMunicipiosJson {
  _ejemplo?: boolean;
  municipios?: MunicipioJson[];
}

/** Localiza municipios.json (funciona tanto en src como en dist). */
function rutaMunicipios(): string {
  const candidatos: string[] = [
    // Compilado: dist/seed/municipios.json (copiado por nest-cli assets)
    path.join(__dirname, 'municipios.json'),
    // Ejecución con ts-node desde la raíz del proyecto
    path.join(process.cwd(), 'src', 'seed', 'municipios.json'),
  ];
  const existente = candidatos.find((ruta) => fs.existsSync(ruta));
  if (!existente) {
    throw new Error(
      `No se encontró municipios.json. Rutas buscadas: ${candidatos.join(', ')}`,
    );
  }
  return existente;
}

/** Lee y normaliza la lista de municipios del JSON. */
function leerMunicipios(): { nombres: string[]; esEjemplo: boolean } {
  const ruta = rutaMunicipios();
  // Se quita el BOM (EF BB BF) que editores como el Bloc de notas de Windows
  // agregan al inicio del archivo: JSON.parse no lo tolera.
  const texto = fs
    .readFileSync(ruta, 'utf8')
    .replace(/^\uFEFF/, '')
    .trim();
  const contenido: ContenidoMunicipiosJson | MunicipioJson[] =
    JSON.parse(texto);

  const lista: MunicipioJson[] = Array.isArray(contenido)
    ? contenido
    : (contenido.municipios ?? []);
  const esEjemplo: boolean =
    !Array.isArray(contenido) && contenido?._ejemplo === true;

  const nombres: string[] = lista
    .map((m) =>
      typeof m === 'string' ? m.trim() : (m?.nombre ?? '').toString().trim(),
    )
    .filter((nombre) => nombre.length > 0);

  if (nombres.length === 0 && !esEjemplo) {
    throw new Error(
      `El archivo ${ruta} no contiene municipios válidos. Usa el formato ` +
        `["Montería", ...] o [{"nombre": "Montería"}, ...].`,
    );
  }
  return { nombres, esEjemplo };
}

/** Crea el admin inicial si no existe. Devuelve true si lo creó. */
async function crearAdmin(ds: DataSource): Promise<boolean> {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  const nombre = process.env.ADMIN_NOMBRE?.trim();

  // Sin valores por defecto: si falta algo, se aborta el seed.
  if (!email || !password || !nombre) {
    throw new Error(
      'Faltan variables para el admin. Define ADMIN_EMAIL, ADMIN_PASSWORD ' +
        'y ADMIN_NOMBRE en el .env (no se crean credenciales por defecto).',
    );
  }
  if (!cumplePoliticaPassword(password)) {
    throw new Error(
      'ADMIN_PASSWORD debe tener al menos 8 caracteres, una letra y un número.',
    );
  }

  const usuarios = ds.getRepository(User);
  const existente = await usuarios.findOneBy({ email });
  if (existente) {
    if (existente.role === UserRole.ADMIN) {
      console.log(`✔ Admin ya existe (${email}); no se duplica.`);
    } else {
      console.warn(
        `⚠ Ya existe un usuario con el email ${email} con rol ` +
          `'${existente.role}'. No se creó el admin; usa otro ADMIN_EMAIL.`,
      );
    }
    return false;
  }

  const hash = await bcrypt.hash(password, 10);
  await usuarios.insert({
    email,
    password: hash,
    fullName: nombre,
    role: UserRole.ADMIN,
    isActive: UserStatus.ACTIVO,
  });
  console.log(`✔ Admin creado: ${email} (rol admin, cuenta activa).`);
  return true;
}

/** Carga los municipios base si aún no existen. Devuelve cuántos insertó. */
async function cargarMunicipios(ds: DataSource): Promise<number> {
  const { nombres, esEjemplo } = leerMunicipios();

  if (esEjemplo) {
    console.warn(
      '⚠ municipios.json es el ARCHIVO DE EJEMPLO: no se insertó ningún ' +
        'municipio. Reemplaza el archivo con la lista oficial de ' +
        'municipios de Córdoba (Colombia) y vuelve a ejecutar el seed.',
    );
    return 0;
  }

  const municipios = ds.getRepository(Municipio);
  const existentes = await municipios.find();
  const nombresExistentes = new Set(
    existentes.map((m) => m.nombre.trim().toLowerCase()),
  );
  const faltantes = nombres.filter(
    (nombre) => !nombresExistentes.has(nombre.toLowerCase()),
  );

  if (faltantes.length === 0) {
    console.log('✔ Municipios ya cargados; no se duplica nada.');
    return 0;
  }

  await municipios.insert(faltantes.map((nombre) => ({ nombre })));
  console.log(`✔ Municipios insertados: ${faltantes.length}.`);
  return faltantes.length;
}

async function main(): Promise<void> {
  const ds = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_DATABASE,
    entities: [User, Municipio, Zona],
    synchronize: false,
    logging: false,
  });
  await ds.initialize();
  try {
    await crearAdmin(ds);
    await cargarMunicipios(ds);
    console.log('Seed finalizado.');
  } finally {
    await ds.destroy();
  }
}

main().catch((error: unknown) => {
  console.error(`✖ Seed abortado: ${(error as Error).message}`);
  process.exit(1);
});
