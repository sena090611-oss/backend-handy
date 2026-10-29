import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { SolicitudDeServicio } from '../../solicitud_de_servicio/entities/solicitud-de-servicio.entity';

/**
 * Entidad que representa la calificación dada a una solicitud de servicio.
 * Cada solicitud puede tener **una** calificación (relación 1‑1).
 */
@Entity({ name: 'calificacion' })
export class Calificacion {
  @PrimaryGeneratedColumn()
  id: number; // PK auto‑incremental

  @Column({ type: 'int' })
  puntuacion: number; // Valor de la calificación (ej. 1‑5)

  @Column({ type: 'text', nullable: true })
  comentario?: string; // Comentario opcional del cliente

  @CreateDateColumn({ type: 'timestamp' })
  fecha: Date; // Fecha automática de creación

  // Relación 1‑1 con la SolicitudDeServicio; la FK se guarda en esta tabla
  @OneToOne(() => SolicitudDeServicio, (solicitud) => solicitud.calificacion, {
    onDelete: 'CASCADE', // elimina la calificación si se borra la solicitud
  })
  @JoinColumn({ name: 'id_solicitud' }) // columna FK
  solicitud: SolicitudDeServicio;
}
