import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export const MUNICIPIOS_INICIALES: ReadonlyArray<{
  id: number;
  nombre: string;
}> = [
  { id: 1, nombre: 'Montería' },
  { id: 2, nombre: 'Achí' },
  { id: 3, nombre: 'Ayapel' },
  { id: 4, nombre: 'Buenavista' },
  { id: 5, nombre: 'Cereté' },
  { id: 6, nombre: 'Ciénaga de Oro' },
  { id: 7, nombre: 'Cotorra' },
  { id: 8, nombre: 'El Paso' },
  { id: 9, nombre: 'Lorica' },
  { id: 10, nombre: 'La Apartada' },
  { id: 11, nombre: 'Momil' },
  { id: 12, nombre: 'Moñitos' },
  { id: 13, nombre: 'Mutatá' },
  { id: 14, nombre: 'Palmar de Varela' },
  { id: 15, nombre: 'Planeta Rica' },
  { id: 16, nombre: 'Puerto Escondido' },
  { id: 17, nombre: 'Purísima' },
  { id: 18, nombre: 'Sahagún' },
  { id: 19, nombre: 'San Antero' },
  { id: 20, nombre: 'San Pelayo' },
  { id: 21, nombre: 'Sabaneta' },
  { id: 22, nombre: 'Tierralta' },
  { id: 23, nombre: 'Tuchín' },
  { id: 24, nombre: 'Vaupés' },
  { id: 25, nombre: 'Montalbán' },
  { id: 26, nombre: 'Nueva Esperanza' },
  { id: 27, nombre: 'Chinú' },
  { id: 28, nombre: 'Uré' },
  { id: 29, nombre: 'Chocó' },
  { id: 30, nombre: 'Carrillo' },
];

@Entity('municipios')
export class Municipio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  nombre: string;
}
