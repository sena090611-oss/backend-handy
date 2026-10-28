import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Municipio } from '../../municipio/entities/municipio.entity';
import { User } from '../../user/entities/user.entity';
import { Zona } from '../../zona/entities/zona.entity';

export enum EstadoTrabajador {
  PENDIENTE = 'PENDIENTE',
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
}

export enum TipoDocumento {
  CC = 'CC',
  CE = 'CE',
  TI = 'TI',
  PEP = 'PEP',
  PASAPORTE = 'PASAPORTE',
}

export enum NivelFormacion {
  NINGUNO = 'NINGUNO',
  BACHILLER = 'BACHILLER',
  TECNICO = 'TECNICO',
  TECNOLOGO = 'TECNOLOGO',
  PROFESIONAL = 'PROFESIONAL',
}

@Entity('trabajador')
export class Trabajador {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'id_usuario' })
  usuario: User;

  @ManyToOne(() => Zona, { nullable: false })
  @JoinColumn({ name: 'id_zona' })
  zona: Zona;

  @ManyToOne(() => Municipio, { nullable: false })
  @JoinColumn({ name: 'id_municipio' })
  municipio: Municipio;

  @Column({ name: 'tipo_doc', type: 'enum', enum: TipoDocumento })
  tipoDoc: TipoDocumento;

  @Column({ name: 'num_doc', unique: true })
  numDoc: string;

  @Column({ name: 'nombres' })
  nombres: string;

  @Column({ name: 'apellidos' })
  apellidos: string;

  @Column({ name: 'direccion' })
  direccion: string;

  @Column({ name: 'email', unique: true })
  email: string;

  @Column({ name: 'telefono', type: 'varchar', length: 10 })
  telefono: string;

  @Column({
    name: 'estado',
    type: 'enum',
    enum: EstadoTrabajador,
    default: EstadoTrabajador.PENDIENTE,
  })
  estado: EstadoTrabajador;

  @Column({ name: 'foto', type: 'varchar', nullable: true })
  foto: string | null;

  @Column({
    name: 'nivel_formación',
    type: 'enum',
    enum: NivelFormacion,
  })
  nivelFormacion: NivelFormacion;

  @Column({ name: 'recomendaciones', type: 'text', nullable: true })
  recomendaciones: string | null;
}
