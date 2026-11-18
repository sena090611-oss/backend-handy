import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Convierte la FK reporte_incidente.id_solicitud en ON DELETE CASCADE, igual
 * que la de calificacion: al eliminar una solicitud de servicio se eliminan
 * automáticamente sus reportes de incidente (antes daba error de FK).
 */
export class ReporteIncidenteCascade1794961000000
  implements MigrationInterface
{
  name = 'ReporteIncidenteCascade1794961000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`reporte_incidente\` DROP FOREIGN KEY \`FK_fa9de1bd51064119d22e126d0f9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`reporte_incidente\` ADD CONSTRAINT \`FK_fa9de1bd51064119d22e126d0f9\` FOREIGN KEY (\`id_solicitud\`) REFERENCES \`solicitud_de_servicio\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`reporte_incidente\` DROP FOREIGN KEY \`FK_fa9de1bd51064119d22e126d0f9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`reporte_incidente\` ADD CONSTRAINT \`FK_fa9de1bd51064119d22e126d0f9\` FOREIGN KEY (\`id_solicitud\`) REFERENCES \`solicitud_de_servicio\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
