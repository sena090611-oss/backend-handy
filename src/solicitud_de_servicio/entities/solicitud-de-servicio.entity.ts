import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
// Importamos la entidad User para establecer la relación ManyToOne.
import { User } from '../../user/entities/user.entity';

// Tabla "solicitud_de_servicio" representa una petición de servicio que
// hace un usuario. Cada solicitud pertenece a un único usuario (FK id_usuario).
@Entity('solicitud_de_servicio') // Definimos el nombre de la tabla en la base de datos.
export class SolicitudDeServicio {
  @PrimaryGeneratedColumn() // Columna auto‑incremental que actúa como primary key.
  id: number;

  // Texto descriptivo de la solicitud de servicio.
  @Column({ type: 'text' })
  descripcion: string;

  // Fecha de creación generada automáticamente por TypeORM.
  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  // Cada solicitud pertenece a un usuario. La relación es ManyToOne porque
  // muchos registros de solicitud pueden referenciar al mismo usuario.
  // No especificamos la propiedad inversa para evitar la dependencia circular.
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'id_usuario' }) // Nombre de la columna FK en la tabla.
  usuario: User;
}