import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Amplía `solicitud_de_servicio` con el ciclo de vida y los datos del
 * servicio:
 * - `estado`: enum del ciclo de vida, NOT NULL con default 'pendiente'
 *   (los registros previos quedan en pendiente).
 * - `direccion_servicio` (varchar 200), `fecha_servicio` (datetime) e
 *   `id_portafolio` (FK al oficio solicitado): obligatorios al crear según
 *   la API; en la BD quedan nullable para no romper los registros previos,
 *   que no pueden rellenarse con valores inventados.
 */
export class SolicitudEstadoDatos1794961786720 implements MigrationInterface {
  name = 'SolicitudEstadoDatos1794961786720';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`solicitud_de_servicio\` ADD \`estado\` enum ('pendiente', 'aceptada', 'en_curso', 'completada', 'cancelada', 'rechazada') NOT NULL DEFAULT 'pendiente'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`solicitud_de_servicio\` ADD \`direccion_servicio\` varchar(200) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`solicitud_de_servicio\` ADD \`fecha_servicio\` datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`solicitud_de_servicio\` ADD \`id_portafolio\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`solicitud_de_servicio\` ADD CONSTRAINT \`FK_bca4f3a9c1f07dcf58e0eba3a9c\` FOREIGN KEY (\`id_portafolio\`) REFERENCES \`portafolio_de_servicios\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`solicitud_de_servicio\` DROP FOREIGN KEY \`FK_bca4f3a9c1f07dcf58e0eba3a9c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`solicitud_de_servicio\` DROP COLUMN \`id_portafolio\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`solicitud_de_servicio\` DROP COLUMN \`fecha_servicio\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`solicitud_de_servicio\` DROP COLUMN \`direccion_servicio\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`solicitud_de_servicio\` DROP COLUMN \`estado\``,
    );
  }
}
