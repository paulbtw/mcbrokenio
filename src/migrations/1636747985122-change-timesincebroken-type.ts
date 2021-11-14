import {MigrationInterface, QueryRunner} from "typeorm";

export class changeTimesincebrokenType1636747985122 implements MigrationInterface {
    name = 'changeTimesincebrokenType1636747985122'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pos" DROP COLUMN "timeSinceBrokenMilchshake"`);
        await queryRunner.query(`ALTER TABLE "pos" ADD "timeSinceBrokenMilchshake" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "pos" DROP COLUMN "timeSinceBrokenMcFlurry"`);
        await queryRunner.query(`ALTER TABLE "pos" ADD "timeSinceBrokenMcFlurry" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "pos" DROP COLUMN "timeSinceBrokenMcSundae"`);
        await queryRunner.query(`ALTER TABLE "pos" ADD "timeSinceBrokenMcSundae" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pos" DROP COLUMN "timeSinceBrokenMcSundae"`);
        await queryRunner.query(`ALTER TABLE "pos" ADD "timeSinceBrokenMcSundae" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pos" DROP COLUMN "timeSinceBrokenMcFlurry"`);
        await queryRunner.query(`ALTER TABLE "pos" ADD "timeSinceBrokenMcFlurry" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pos" DROP COLUMN "timeSinceBrokenMilchshake"`);
        await queryRunner.query(`ALTER TABLE "pos" ADD "timeSinceBrokenMilchshake" integer NOT NULL`);
    }

}
