import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum EstadoPortafolio {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
}

@Entity('portafolio_de_servicios')
export class Portafolio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombre_oficio', type: 'varchar', length: 30 })
  nombreOficio: string;

  @Column({ type: 'varchar', length: 50 })
  categoria: string;

  @Column({ name: 'fecha_hora', type: 'date' })
  fechaHora: string;

  @Column({ type: 'enum', enum: EstadoPortafolio, default: EstadoPortafolio.ACTIVO })
  estado: EstadoPortafolio;

  @Column({ type: 'varchar', length: 200 })
  descripcion: string;
}