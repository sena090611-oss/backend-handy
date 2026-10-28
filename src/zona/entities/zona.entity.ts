import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Municipio } from '../../municipio/entities/municipio.entity';

@Entity('zona')
export class Zona {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombre', length: 45 })
  nombre: string;

  @ManyToOne(() => Municipio, (municipio) => municipio.zonas, {
    nullable: false,
  })
  @JoinColumn({ name: 'municipios_id' })
  municipio: Municipio;
}
