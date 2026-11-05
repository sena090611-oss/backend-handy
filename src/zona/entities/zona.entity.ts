import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Municipio } from '../../municipio/entities/municipio.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('zona')
export class Zona {
  @ApiProperty({ example: 4 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'La Castellana' })
  @Column({ name: 'nombre', length: 45 })
  nombre: string;

  @ManyToOne(() => Municipio, (municipio) => municipio.zonas, {
    nullable: false,
  })
  @JoinColumn({ name: 'municipios_id' })
  municipio: Municipio;
}
