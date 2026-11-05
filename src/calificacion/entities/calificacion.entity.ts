import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { SolicitudDeServicio } from '../../solicitud_de_servicio/entities/solicitud-de-servicio.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Entidad que representa la calificación dada a una solicitud de servicio.
 * Cada solicitud puede tener **una** calificación (relación 1‑1).
 */
@Entity({ name: 'calificacion' })
export class Calificacion {
  @ApiProperty({ example: 9 })
  @PrimaryGeneratedColumn()
  id: number; // PK auto‑incremental

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @Column({ type: 'int' })
  puntuacion: number; // Valor de la calificación (ej. 1‑5)

  @ApiPropertyOptional({ example: 'El servicio fue puntual y de excelente calidad.' })
  @Column({ type: 'text', nullable: true })
  comentario?: string; // Comentario opcional del cliente

  @ApiProperty({ example: '2026-11-04T14:30:00.000Z', format: 'date-time' })
  @CreateDateColumn({ type: 'timestamp' })
  fecha: Date; // Fecha automática de creación

  // Relación 1‑1 con la SolicitudDeServicio; la FK se guarda en esta tabla
  @OneToOne(() => SolicitudDeServicio, (solicitud) => solicitud.calificacion, {
    onDelete: 'CASCADE', // elimina la calificación si se borra la solicitud
  })
  @JoinColumn({ name: 'id_solicitud' }) // columna FK
  solicitud: SolicitudDeServicio;
}