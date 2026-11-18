import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1794960401459 implements MigrationInterface {
    name = 'Migrations1794960401459'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`usuarios\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`fullName\` varchar(255) NOT NULL, \`isActive\` enum ('pendiente', 'activo', 'suspendido') NOT NULL DEFAULT 'pendiente', \`role\` enum ('admin', 'cliente', 'trabajador') NOT NULL DEFAULT 'cliente', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id_municipio\` int NULL, UNIQUE INDEX \`IDX_446adfc18b35418aac32ae0b7b\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`zona\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre\` varchar(45) NOT NULL, \`municipios_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`municipios\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`disponibilidad\` (\`id\` int NOT NULL AUTO_INCREMENT, \`jornada\` enum ('MAÑANA', 'TARDE', 'NOCHE') NOT NULL, \`id_trabajador\` int NOT NULL, UNIQUE INDEX \`UQ_disponibilidad_trabajador_jornada\` (\`id_trabajador\`, \`jornada\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`trabajador\` (\`id\` int NOT NULL AUTO_INCREMENT, \`tipo_doc\` enum ('CC', 'CE', 'TI', 'PEP', 'PASAPORTE') NOT NULL, \`num_doc\` varchar(255) NOT NULL, \`nombres\` varchar(255) NOT NULL, \`apellidos\` varchar(255) NOT NULL, \`direccion\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`telefono\` varchar(10) NOT NULL, \`estado\` enum ('PENDIENTE', 'ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'PENDIENTE', \`foto\` varchar(255) NULL, \`nivel_formación\` enum ('NINGUNO', 'BACHILLER', 'TECNICO', 'TECNOLOGO', 'PROFESIONAL') NOT NULL, \`recomendaciones\` text NULL, \`id_usuario\` int NOT NULL, \`id_zona\` int NOT NULL, \`id_municipio\` int NOT NULL, UNIQUE INDEX \`IDX_ebe6e05c2acc52dfbb60a46d4d\` (\`num_doc\`), UNIQUE INDEX \`IDX_5463255a6f0c3260e05e68a607\` (\`email\`), UNIQUE INDEX \`REL_0164cea1377e431a281152ab32\` (\`id_usuario\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`detalle_portafolio\` (\`id\` int NOT NULL AUTO_INCREMENT, \`años_experiencia\` tinyint NOT NULL, \`descripcion_trabajos\` varchar(200) NOT NULL, \`id_portafolio\` int NOT NULL, \`id_trabajador\` int NOT NULL, UNIQUE INDEX \`UQ_detalle_portafolio_trabajador_portafolio\` (\`id_trabajador\`, \`id_portafolio\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`portafolio_de_servicios\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre_oficio\` varchar(30) NOT NULL, \`categoria\` varchar(50) NOT NULL, \`fecha_hora\` date NOT NULL, \`estado\` enum ('activo', 'inactivo') NOT NULL DEFAULT 'activo', \`descripcion\` varchar(200) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`calificacion\` (\`id\` int NOT NULL AUTO_INCREMENT, \`puntuacion\` int NOT NULL, \`comentario\` text NULL, \`tipo\` enum ('cliente_a_trabajador', 'trabajador_a_cliente') NOT NULL DEFAULT 'cliente_a_trabajador', \`fecha\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`id_solicitud\` int NULL, UNIQUE INDEX \`IDX_6a7fe41cca063b1d99aac54e61\` (\`id_solicitud\`, \`tipo\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`reporte_incidente\` (\`id\` int NOT NULL AUTO_INCREMENT, \`descripcion\` text NOT NULL, \`fecha_creacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`estado\` enum ('ABIERTO', 'EN_REVISION', 'CERRADO') NOT NULL DEFAULT 'ABIERTO', \`id_solicitud\` int NULL, \`id_usuario_reporta\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`solicitud_de_servicio\` (\`id\` int NOT NULL AUTO_INCREMENT, \`descripcion\` text NOT NULL, \`fecha_creacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`id_usuario\` int NULL, \`id_trabajador\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`usuarios\` ADD CONSTRAINT \`FK_da7a9d21702c928f0b099f92f0b\` FOREIGN KEY (\`id_municipio\`) REFERENCES \`municipios\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`zona\` ADD CONSTRAINT \`FK_c970fa79bbd3449df6ea4627470\` FOREIGN KEY (\`municipios_id\`) REFERENCES \`municipios\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`disponibilidad\` ADD CONSTRAINT \`FK_bb41baf1974ae833298c50ef4ec\` FOREIGN KEY (\`id_trabajador\`) REFERENCES \`trabajador\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`trabajador\` ADD CONSTRAINT \`FK_0164cea1377e431a281152ab32f\` FOREIGN KEY (\`id_usuario\`) REFERENCES \`usuarios\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`trabajador\` ADD CONSTRAINT \`FK_1918d24d8344b6eed5d3a40516c\` FOREIGN KEY (\`id_zona\`) REFERENCES \`zona\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`trabajador\` ADD CONSTRAINT \`FK_56c60c69fada1af6b1d128a68a2\` FOREIGN KEY (\`id_municipio\`) REFERENCES \`municipios\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`detalle_portafolio\` ADD CONSTRAINT \`FK_861b1a27d43355d8850a8ad1a04\` FOREIGN KEY (\`id_portafolio\`) REFERENCES \`portafolio_de_servicios\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`detalle_portafolio\` ADD CONSTRAINT \`FK_7d549768c99dcd2c27b7008c4fc\` FOREIGN KEY (\`id_trabajador\`) REFERENCES \`trabajador\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`calificacion\` ADD CONSTRAINT \`FK_b2d1397c42d1151fca94c6503ec\` FOREIGN KEY (\`id_solicitud\`) REFERENCES \`solicitud_de_servicio\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reporte_incidente\` ADD CONSTRAINT \`FK_fa9de1bd51064119d22e126d0f9\` FOREIGN KEY (\`id_solicitud\`) REFERENCES \`solicitud_de_servicio\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reporte_incidente\` ADD CONSTRAINT \`FK_9993016e549d4d6daa23cda1eb2\` FOREIGN KEY (\`id_usuario_reporta\`) REFERENCES \`usuarios\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`solicitud_de_servicio\` ADD CONSTRAINT \`FK_fa8a8b20d093aecc71f58a6fdf3\` FOREIGN KEY (\`id_usuario\`) REFERENCES \`usuarios\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`solicitud_de_servicio\` ADD CONSTRAINT \`FK_8b7cb1ca1ec6af3cd11eb3be135\` FOREIGN KEY (\`id_trabajador\`) REFERENCES \`trabajador\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`solicitud_de_servicio\` DROP FOREIGN KEY \`FK_8b7cb1ca1ec6af3cd11eb3be135\``);
        await queryRunner.query(`ALTER TABLE \`solicitud_de_servicio\` DROP FOREIGN KEY \`FK_fa8a8b20d093aecc71f58a6fdf3\``);
        await queryRunner.query(`ALTER TABLE \`reporte_incidente\` DROP FOREIGN KEY \`FK_9993016e549d4d6daa23cda1eb2\``);
        await queryRunner.query(`ALTER TABLE \`reporte_incidente\` DROP FOREIGN KEY \`FK_fa9de1bd51064119d22e126d0f9\``);
        await queryRunner.query(`ALTER TABLE \`calificacion\` DROP FOREIGN KEY \`FK_b2d1397c42d1151fca94c6503ec\``);
        await queryRunner.query(`ALTER TABLE \`detalle_portafolio\` DROP FOREIGN KEY \`FK_7d549768c99dcd2c27b7008c4fc\``);
        await queryRunner.query(`ALTER TABLE \`detalle_portafolio\` DROP FOREIGN KEY \`FK_861b1a27d43355d8850a8ad1a04\``);
        await queryRunner.query(`ALTER TABLE \`trabajador\` DROP FOREIGN KEY \`FK_56c60c69fada1af6b1d128a68a2\``);
        await queryRunner.query(`ALTER TABLE \`trabajador\` DROP FOREIGN KEY \`FK_1918d24d8344b6eed5d3a40516c\``);
        await queryRunner.query(`ALTER TABLE \`trabajador\` DROP FOREIGN KEY \`FK_0164cea1377e431a281152ab32f\``);
        await queryRunner.query(`ALTER TABLE \`disponibilidad\` DROP FOREIGN KEY \`FK_bb41baf1974ae833298c50ef4ec\``);
        await queryRunner.query(`ALTER TABLE \`zona\` DROP FOREIGN KEY \`FK_c970fa79bbd3449df6ea4627470\``);
        await queryRunner.query(`ALTER TABLE \`usuarios\` DROP FOREIGN KEY \`FK_da7a9d21702c928f0b099f92f0b\``);
        await queryRunner.query(`DROP TABLE \`solicitud_de_servicio\``);
        await queryRunner.query(`DROP TABLE \`reporte_incidente\``);
        await queryRunner.query(`DROP INDEX \`IDX_6a7fe41cca063b1d99aac54e61\` ON \`calificacion\``);
        await queryRunner.query(`DROP TABLE \`calificacion\``);
        await queryRunner.query(`DROP TABLE \`portafolio_de_servicios\``);
        await queryRunner.query(`DROP INDEX \`UQ_detalle_portafolio_trabajador_portafolio\` ON \`detalle_portafolio\``);
        await queryRunner.query(`DROP TABLE \`detalle_portafolio\``);
        await queryRunner.query(`DROP INDEX \`REL_0164cea1377e431a281152ab32\` ON \`trabajador\``);
        await queryRunner.query(`DROP INDEX \`IDX_5463255a6f0c3260e05e68a607\` ON \`trabajador\``);
        await queryRunner.query(`DROP INDEX \`IDX_ebe6e05c2acc52dfbb60a46d4d\` ON \`trabajador\``);
        await queryRunner.query(`DROP TABLE \`trabajador\``);
        await queryRunner.query(`DROP INDEX \`UQ_disponibilidad_trabajador_jornada\` ON \`disponibilidad\``);
        await queryRunner.query(`DROP TABLE \`disponibilidad\``);
        await queryRunner.query(`DROP TABLE \`municipios\``);
        await queryRunner.query(`DROP TABLE \`zona\``);
        await queryRunner.query(`DROP INDEX \`IDX_446adfc18b35418aac32ae0b7b\` ON \`usuarios\``);
        await queryRunner.query(`DROP TABLE \`usuarios\``);
    }

}
