import {MigrationInterface, QueryRunner} from "typeorm";

export class addMobileOrderingDetection1637307902022 implements MigrationInterface {
    name = 'addMobileOrderingDetection1637307902022'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pos" ADD "hasMobileOrdering" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pos" DROP COLUMN "hasMobileOrdering"`);
    }

}
