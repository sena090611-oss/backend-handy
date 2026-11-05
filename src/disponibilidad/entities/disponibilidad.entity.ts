import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Trabajador } from '../../trabajador/entities/trabajador.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum Jornada {
  MANANA = 'MAÑANA',
  TARDE = 'TARDE',
  NOCHE = 'NOCHE',
}

@Entity('disponibilidad')
@Unique('UQ_disponibilidad_trabajador_jornada', ['trabajador', 'jornada'])
export class Disponibilidad {
  @ApiProperty({ example: 7 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ enum: Jornada, example: Jornada.MANANA })
  @Column({ type: 'enum', enum: Jornada })
  jornada: Jornada;

  @ManyToOne(() => Trabajador, (trabajador) => trabajador.disponibilidades, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_trabajador' })
  trabajador: Trabajador;
}
