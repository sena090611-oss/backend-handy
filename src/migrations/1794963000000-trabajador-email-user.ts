import { MigrationInterface, QueryRunner } from 'typeorm';

export class TrabajadorEmailUser1794963000000 implements MigrationInterface {
  name = 'TrabajadorEmailUser1794963000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `trabajador` DROP INDEX `IDX_5463255a6f0c3260e05e68a607`',
    );
    await queryRunner.query(
      'ALTER TABLE `trabajador` DROP COLUMN `email`',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `trabajador` ADD `email` varchar(255) NULL',
    );
    await queryRunner.query(
      'UPDATE `trabajador` trabajador INNER JOIN `usuarios` usuario ON usuario.`id` = trabajador.`id_usuario` SET trabajador.`email` = usuario.`email`',
    );
    await queryRunner.query(
      'ALTER TABLE `trabajador` MODIFY `email` varchar(255) NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `trabajador` ADD UNIQUE INDEX `IDX_5463255a6f0c3260e05e68a607` (`email`)',
    );
  }
}
