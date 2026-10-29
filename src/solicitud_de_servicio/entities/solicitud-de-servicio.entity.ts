import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  // Se agrega OneToOne para la relación con Calificación
  OneToOne,
  JoinColumn,
} from 'typeorm';
// Importamos la entidad User para establecer la relación ManyToOne.
import { User } from '../../user/entities/user.entity';
import { Trabajador } from '../../trabajador/entities/trabajador.entity';
import { Calificacion } from '../../calificacion/entities/calificacion.entity'; // Entidad de calificación relacionada 1‑1

// Tabla "solicitud_de_servicio" representa una petición de servicio que
// hace un usuario. Cada solicitud pertenece a un único usuario (FK id_usuario).
@Entity('solicitud_de_servicio') // Definimos el nombre de la tabla en la base de datos.
export class SolicitudDeServicio {
  @PrimaryGeneratedColumn() // Columna auto‑incremental que actúa como primary key.
  id: number;

  // Texto descriptivo de la solicitud de servicio.
  @Column({ type: 'text' })
  descripcion: string;

  // Fecha de creación generada automáticamente por TypeORM.
  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  // Relación opcional 1‑1 con Calificación.
  // La FK se almacena en la tabla `calificacion` (columna `id_solicitud`).
  // Aquí definimos la parte inversa sin `@JoinColumn` para evitar crear
  // una segunda columna `id_calificacion` que produciría conflicto.
  @OneToOne(() => Calificacion, (calif) => calif.solicitud, {
    cascade: true, // persiste calificación al guardar solicitud
    eager: true,
  })
  calificacion?: Calificacion;

  // Cada solicitud pertenece a un usuario. La relación es ManyToOne porque
  // muchos registros de solicitud pueden referenciar al mismo usuario.
  // No especificamos la propiedad inversa para evitar la dependencia circular.
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'id_usuario' }) // Nombre de la columna FK en la tabla.
  usuario: User;

  // Relación opcional al trabajador que ejecuta la solicitud.
  @ManyToOne(() => Trabajador, { nullable: true, eager: true })
  @JoinColumn({ name: 'id_trabajador' })
  trabajador?: Trabajador;
}