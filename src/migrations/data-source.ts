/**
 * Datasource que usa la CLI de TypeORM para generar, ejecutar y revertir
 * migraciones (scripts npm `migration:generate`, `migration:run` y
 * `migration:revert`). Lee las mismas variables de entorno que la aplicación.
 * Importante: `synchronize` siempre false aquí; la CLI solo gestiona
 * migraciones.
 */
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Municipio } from '../municipio/entities/municipio.entity';
import { User } from '../user/entities/user.entity';
import { Zona } from '../zona/entities/zona.entity';
import { Portafolio } from '../portafolio/entities/portafolio.entity';
import { DetallePortafolio } from '../detalle_portafolio/detalle_portafolio/entities/detalle-portafolio.entity';
import { SolicitudDeServicio } from '../solicitud_de_servicio/entities/solicitud-de-servicio.entity';
import { Trabajador } from '../trabajador/entities/trabajador.entity';
import { ReporteIncidente } from '../reporte_incidente/entities/reporte-incidente.entity';
import { Disponibilidad } from '../disponibilidad/entities/disponibilidad.entity';
import { Calificacion } from '../calificacion/entities/calificacion.entity';
import { Migrations1794960401459 } from './1794960401459-migrations';
import { ReporteIncidenteCascade1794961000000 } from './1794961000000-reporte-incidente-cascade';
import { SolicitudEstadoDatos1794961786720 } from './1794961786720-solicitud-estado-datos';
import { TrabajadorEmailUser1794963000000 } from './1794963000000-trabajador-email-user';

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USERNAME,
  // Si el .env no define DB_PASSWORD, usamos cadena vacía para evitar que
  // mysql2 reciba `undefined`.
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_DATABASE,
  // Entidades listadas de forma explícita: los globs fallan cuando la ruta
  // del proyecto contiene caracteres especiales de glob (paréntesis, etc.).
  entities: [
    Municipio,
    User,
    Zona,
    Portafolio,
    DetallePortafolio,
    SolicitudDeServicio,
    Trabajador,
    ReporteIncidente,
    Disponibilidad,
    Calificacion,
  ],
  migrationsTableName: 'migrations',
  // Migraciones importadas de forma explícita (los globs fallan cuando la
  // ruta del proyecto contiene caracteres especiales). Al crear una nueva
  // migración, impórtala aquí y agrégala a la lista.
  migrations: [
    Migrations1794960401459,
    ReporteIncidenteCascade1794961000000,
    SolicitudEstadoDatos1794961786720,
    TrabajadorEmailUser1794963000000,
  ],
  synchronize: false,
  logging: false,
});
