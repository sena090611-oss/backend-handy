import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Municipio } from '../../municipio/entities/municipio.entity';
import { User } from '../../user/entities/user.entity';
import { Zona } from '../../zona/entities/zona.entity';
import { Disponibilidad } from '../../disponibilidad/entities/disponibilidad.entity';
import { DetallePortafolio } from '../../detalle_portafolio/detalle_portafolio/entities/detalle-portafolio.entity';
import { ApiProperty } from '@nestjs/swagger';

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
  @ApiProperty({ example: 3 })
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

  @ApiProperty({ enum: TipoDocumento, example: TipoDocumento.CC })
  @Column({ name: 'tipo_doc', type: 'enum', enum: TipoDocumento })
  tipoDoc: TipoDocumento;

  @ApiProperty({ example: '1234567890' })
  @Column({ name: 'num_doc', unique: true })
  numDoc: string;

  @ApiProperty({ example: 'Juan' })
  @Column({ name: 'nombres' })
  nombres: string;

  @ApiProperty({ example: 'Gómez' })
  @Column({ name: 'apellidos' })
  apellidos: string;

  @ApiProperty({ example: 'Calle 10 # 5-20' })
  @Column({ name: 'direccion' })
  direccion: string;

  @ApiProperty({ example: 'juan.gomez@handy.com' })
  @Column({ name: 'email', unique: true })
  email: string;

  @ApiProperty({ example: '3001234567' })
  @Column({ name: 'telefono', type: 'varchar', length: 10 })
  telefono: string;

  @ApiProperty({ enum: EstadoTrabajador, example: EstadoTrabajador.ACTIVO })
  @Column({
    name: 'estado',
    type: 'enum',
    enum: EstadoTrabajador,
    default: EstadoTrabajador.PENDIENTE,
  })
  estado: EstadoTrabajador;

  @ApiProperty({ example: null, nullable: true })
  @Column({ name: 'foto', type: 'varchar', nullable: true })
  foto: string | null;

  @ApiProperty({ enum: NivelFormacion, example: NivelFormacion.TECNICO })
  @Column({
    name: 'nivel_formación',
    type: 'enum',
    enum: NivelFormacion,
  })
  nivelFormacion: NivelFormacion;

  @ApiProperty({ example: null, nullable: true })
  @Column({ name: 'recomendaciones', type: 'text', nullable: true })
  recomendaciones: string | null;

  @OneToMany(
    () => Disponibilidad,
    (disponibilidad) => disponibilidad.trabajador,
  )
  disponibilidades: Disponibilidad[];

  @OneToMany(
    () => DetallePortafolio,
    (detallePortafolio) => detallePortafolio.trabajador,
  )
  detallesPortafolio: DetallePortafolio[];
}
