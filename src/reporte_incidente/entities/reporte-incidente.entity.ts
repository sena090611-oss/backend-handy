import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SolicitudDeServicio } from '../../solicitud_de_servicio/entities/solicitud-de-servicio.entity';
import { User } from '../../user/entities/user.entity';
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
  // CASCADE: si se elimina la solicitud, se eliminan también sus reportes.
  @ManyToOne(
    () => SolicitudDeServicio,
    (solicitud) => solicitud.reportes,
    { eager: true, onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'id_solicitud' })
  solicitud: SolicitudDeServicio;

  // Usuario que reportó el incidente. Se deriva del token JWT y no se acepta
  // desde el cuerpo de la petición.
  @ApiPropertyOptional({ type: () => User, nullable: true })
  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'id_usuario_reporta' })
  reportadoPor?: User;
}
