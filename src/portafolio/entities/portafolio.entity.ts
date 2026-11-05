import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DetallePortafolio } from '../../detalle_portafolio/detalle_portafolio/entities/detalle-portafolio.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum EstadoPortafolio {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
}

@Entity('portafolio_de_servicios')
export class Portafolio {
  @ApiProperty({ example: 2 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Plomería' })
  @Column({ name: 'nombre_oficio', type: 'varchar', length: 30 })
  nombreOficio: string;

  @ApiProperty({ example: 'Mantenimiento del hogar' })
  @Column({ type: 'varchar', length: 50 })
  categoria: string;

  @ApiProperty({ example: '2026-11-04', format: 'date' })
  @Column({ name: 'fecha_hora', type: 'date' })
  fechaHora: string;

  @ApiProperty({ enum: EstadoPortafolio, example: EstadoPortafolio.ACTIVO })
  @Column({ type: 'enum', enum: EstadoPortafolio, default: EstadoPortafolio.ACTIVO })
  estado: EstadoPortafolio;

  @ApiProperty({ example: 'Instalación y reparación de tuberías domésticas' })
  @Column({ type: 'varchar', length: 200 })
  descripcion: string;

  @OneToMany(() => DetallePortafolio, (detalle) => detalle.portafolio)
  detalles: DetallePortafolio[];
}