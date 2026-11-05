import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Portafolio } from '../../../portafolio/entities/portafolio.entity';
import { Trabajador } from '../../../trabajador/entities/trabajador.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('detalle_portafolio')
@Unique('UQ_detalle_portafolio_trabajador_portafolio', [
  'trabajador',
  'portafolio',
])
export class DetallePortafolio {
  @ApiProperty({ example: 4 })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Portafolio, (portafolio) => portafolio.detalles, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_portafolio' })
  portafolio: Portafolio;

  @ManyToOne(() => Trabajador, (trabajador) => trabajador.detallesPortafolio, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_trabajador' })
  trabajador: Trabajador;

  @ApiProperty({ example: 5, minimum: 0, maximum: 60 })
  @Column({ name: 'años_experiencia', type: 'tinyint' })
  aniosExperiencia: number;

  @ApiProperty({ example: 'Instalación de griferías y reparación de tuberías.' })
  @Column({ name: 'descripcion_trabajos', type: 'varchar', length: 200 })
  descripcionTrabajos: string;
}
