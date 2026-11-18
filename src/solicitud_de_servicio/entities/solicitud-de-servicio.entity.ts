import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
// Importamos la entidad User para establecer la relación ManyToOne.
import { User } from '../../user/entities/user.entity';
import { Trabajador } from '../../trabajador/entities/trabajador.entity';
import { Calificacion } from '../../calificacion/entities/calificacion.entity';
import { ReporteIncidente } from '../../reporte_incidente/entities/reporte-incidente.entity';
import { Portafolio } from '../../portafolio/entities/portafolio.entity';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Ciclo de vida de una solicitud de servicio.
 * - pendiente: recién creada, sin trabajador asignado.
 * - aceptada: un trabajador tomó la solicitud.
 * - en_curso: el servicio está en ejecución.
 * - completada: el servicio terminó.
 * - cancelada: la canceló el cliente o el admin.
 * - rechazada: el trabajador o el admin la rechazó.
 */
export enum EstadoSolicitud {
  PENDIENTE = 'pendiente',
  ACEPTADA = 'aceptada',
  EN_CURSO = 'en_curso',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
  RECHAZADA = 'rechazada',
}

// Tabla "solicitud_de_servicio" representa una petición de servicio que
// hace un usuario. Cada solicitud pertenece a un único usuario (FK id_usuario).
@Entity('solicitud_de_servicio') // Definimos el nombre de la tabla en la base de datos.
export class SolicitudDeServicio {
  @ApiProperty({ example: 12 })
  @PrimaryGeneratedColumn() // Columna auto‑incremental que actúa como primary key.
  id: number;

  // Texto descriptivo de la solicitud de servicio.
  @ApiProperty({ example: 'Necesito reparar una fuga en la cocina.' })
  @Column({ type: 'text' })
  descripcion: string;

  // Estado del ciclo de vida de la solicitud (siempre inicia pendiente).
  @ApiProperty({ enum: EstadoSolicitud, example: EstadoSolicitud.PENDIENTE })
  @Column({
    type: 'enum',
    enum: EstadoSolicitud,
    default: EstadoSolicitud.PENDIENTE,
  })
  estado: EstadoSolicitud;

  // Dirección donde se realizará el servicio. Obligatoria al crear (lo
  // valida el DTO); la columna es nullable en la BD para no romper los
  // registros anteriores a este cambio.
  @ApiProperty({
    example: 'Calle 45 # 23-10, Barrio Centro',
    nullable: true,
  })
  @Column({ name: 'direccion_servicio', type: 'varchar', length: 200, nullable: true })
  direccionServicio: string | null;

  // Fecha y hora en que se realizará el servicio. Obligatoria al crear y
  // no puede ser en el pasado (validado en DTO y servicio); la columna es
  // nullable en la BD para no romper los registros anteriores.
  @ApiProperty({
    example: '2026-11-25T10:00:00.000Z',
    format: 'date-time',
    nullable: true,
  })
  @Column({ name: 'fecha_servicio', type: 'datetime', nullable: true })
  fechaServicio: Date | null;

  // Fecha de creación generada automáticamente por TypeORM.
  @ApiProperty({ example: '2026-11-04T14:30:00.000Z', format: 'date-time' })
  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  // Una solicitud puede tener una calificación de cada participante.
  @OneToMany(() => Calificacion, (calif) => calif.solicitud, {
    cascade: true, // persiste calificación al guardar solicitud
  })
  calificaciones?: Calificacion[];

  // Cada solicitud pertenece a un usuario. La relación es ManyToOne porque
  // muchos registros de solicitud pueden referenciar al mismo usuario.
  // No especificamos la propiedad inversa para evitar la dependencia circular.
  // Sin eager: las relaciones se cargan explícitamente en los servicios y se
  // mapean a DTOs de respuesta para no exponer datos personales.
  @ManyToOne(() => User)
  @JoinColumn({ name: 'id_usuario' }) // Nombre de la columna FK en la tabla.
  usuario: User;

  // Oficio solicitado (portafolio de servicios). Obligatorio al crear
  // (el DTO exige portafolioId); nullable en la BD por los registros previos.
  @ManyToOne(() => Portafolio, { nullable: true })
  @JoinColumn({ name: 'id_portafolio' })
  portafolio: Portafolio | null;

  // Relación opcional al trabajador que ejecuta la solicitud.
  // Empieza en null: se asigna cuando un trabajador acepta la solicitud.
  @ManyToOne(() => Trabajador, { nullable: true })
  @JoinColumn({ name: 'id_trabajador' })
  trabajador: Trabajador | null;

  @OneToMany(() => ReporteIncidente, (reporte) => reporte.solicitud)
  reportes: ReporteIncidente[];
}