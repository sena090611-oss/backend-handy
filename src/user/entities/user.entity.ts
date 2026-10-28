import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
// Importamos la entidad Municipio para crear la relación FK "id_municipio"
import { Municipio } from '../../municipio/entities/municipio.entity';

export enum UserRole {
  ADMIN = 'admin',
  CLIENTE = 'cliente',
  TRABAJADOR = 'trabajador',
}

export enum UserStatus {
  PENDIENTE = 'pendiente',
  ACTIVO = 'activo',
  SUSPENDIDO = 'suspendido',
}

// Decorador @Entity define que esta clase es una entidad de base de datos
@Entity('usuarios')
export class User {
  // Clave primaria auto-incremental
  @PrimaryGeneratedColumn()
  id: number;

  // Columna de email única y no nula
  @Column({ unique: true, nullable: false })
  email: string;

  // Columna de contraseña (se guardará encriptada)
  // select: false evita que se lea por defecto en las consultas
  // @Exclude() evita que se envíe en las respuestas HTTP (ver sección 5)
  @Exclude()
  @Column({ nullable: false, select: false })
  password: string;

  // Nombre completo del usuario
  @Column({ nullable: false })
  fullName: string; // alias: nombre

  // Estado del usuario
  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDIENTE })
  isActive: UserStatus;

  // Rol del usuario
  @Column({ type: 'enum', enum: UserRole, default: UserRole.CLIENTE })
  role: UserRole;

  // Fecha de creación automática
  @CreateDateColumn()
  createdAt: Date;

  // Fecha de actualización automática
  @UpdateDateColumn()
  updatedAt: Date;

  // ---------------------------------------------------------------
  // Relación con la entidad Municipio
  // ---------------------------------------------------------------
  // * Cada usuario pertenece a un municipio.
  // * La columna en la tabla "usuarios" se llama "id_municipio" y actúa como
  //   clave foránea a la tabla "municipios".
  // * "eager: true" permite que, al cargar un usuario, TypeORM incluya
  //   automáticamente el municipio asociado (útil para los DTOs y respuestas).
  @ManyToOne(() => Municipio, { eager: true })
  @JoinColumn({ name: 'id_municipio' })
  municipio: Municipio;
}
