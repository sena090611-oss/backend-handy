import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { SolicitudDeServicio } from '../../solicitud_de_servicio/entities/solicitud-de-servicio.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CalificacionTipo {
  CLIENTE_A_TRABAJADOR = 'cliente_a_trabajador',
  TRABAJADOR_A_CLIENTE = 'trabajador_a_cliente',
}

/**
 * Entidad que representa la calificación dada a una solicitud de servicio.
 * Cada solicitud puede tener una calificación de cada tipo.
 */
@Entity({ name: 'calificacion' })
@Unique(['solicitud', 'tipo'])
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

  @ApiProperty({ enum: CalificacionTipo })
  @Column({
    type: 'enum',
    enum: CalificacionTipo,
    default: CalificacionTipo.CLIENTE_A_TRABAJADOR,
  })
  tipo: CalificacionTipo;

  @ApiProperty({ example: '2026-11-04T14:30:00.000Z', format: 'date-time' })
  @CreateDateColumn({ type: 'timestamp' })
  fecha: Date; // Fecha automática de creación

  // La FK se guarda en esta tabla; el tipo permite una calificación por participante.
  @ManyToOne(() => SolicitudDeServicio, (solicitud) => solicitud.calificaciones, {
    onDelete: 'CASCADE', // elimina la calificación si se borra la solicitud
  })
  @JoinColumn({ name: 'id_solicitud' }) // columna FK
  solicitud: SolicitudDeServicio;
}