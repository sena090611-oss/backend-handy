import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SolicitudDeServicio } from '../../solicitud_de_servicio/entities/solicitud-de-servicio.entity';
import { EstadoReporte } from '../enums/estado-reporte.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Entidad que representa un reporte de incidente asociado a una solicitud de servicio.
 */
@Entity('reporte_incidente')
export class ReporteIncidente {
  @ApiProperty({ example: 3 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'El trabajador no se presentó en el horario acordado.' })
  @Column({ type: 'text' })
  descripcion: string;

  @ApiProperty({ example: '2026-11-04T14:30:00.000Z', format: 'date-time' })
  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @ApiProperty({ enum: EstadoReporte, example: EstadoReporte.ABIERTO })
  @Column({ type: 'enum', enum: EstadoReporte, default: EstadoReporte.ABIERTO })
  estado: EstadoReporte;

  // Relación con la solicitud de servicio a la que pertenece el reporte.
  @ManyToOne(() => SolicitudDeServicio, (solicitud) => solicitud.reportes, { eager: true })
  @JoinColumn({ name: 'id_solicitud' })
  solicitud: SolicitudDeServicio;

  // Campo opcional que indica quién reportó el incidente.
  @ApiPropertyOptional({ example: 'María Pérez', nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  reportadoPor?: string;
}
