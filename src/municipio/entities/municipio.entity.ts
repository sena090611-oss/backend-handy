import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Zona } from '../../zona/entities/zona.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('municipios')
export class Municipio {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Montería' })
  @Column({ nullable: false })
  nombre: string;

  @OneToMany(() => User, (user) => user.municipio)
  usuarios: User[];

  @OneToMany(() => Zona, (zona) => zona.municipio)
  zonas: Zona[];
}
