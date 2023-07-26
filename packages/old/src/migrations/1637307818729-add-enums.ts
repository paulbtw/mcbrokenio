import {MigrationInterface, QueryRunner} from "typeorm";

export class addEnums1637307818729 implements MigrationInterface {
    name = 'addEnums1637307818729'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pos" DROP COLUMN "hasMilchshake"`);
        await queryRunner.query(`CREATE TYPE "public"."pos_hasmilchshake_enum" AS ENUM('AVAILABLE', 'NOT_AVAILABLE', 'UNKNOWN', 'NOT_APPLICABLE')`);
        await queryRunner.query(`ALTER TABLE "pos" ADD "hasMilchshake" "public"."pos_hasmilchshake_enum" NOT NULL DEFAULT 'UNKNOWN'`);
        await queryRunner.query(`ALTER TABLE "pos" DROP COLUMN "hasMcFlurry"`);
        await queryRunner.query(`CREATE TYPE "public"."pos_hasmcflurry_enum" AS ENUM('AVAILABLE', 'NOT_AVAILABLE', 'UNKNOWN', 'NOT_APPLICABLE')`);
        await queryRunner.query(`ALTER TABLE "pos" ADD "hasMcFlurry" "public"."pos_hasmcflurry_enum" NOT NULL DEFAULT 'UNKNOWN'`);
        await queryRunner.query(`ALTER TABLE "pos" DROP COLUMN "hasMcSundae"`);
        await queryRunner.query(`CREATE TYPE "public"."pos_hasmcsundae_enum" AS ENUM('AVAILABLE', 'NOT_AVAILABLE', 'UNKNOWN', 'NOT_APPLICABLE')`);
        await queryRunner.query(`ALTER TABLE "pos" ADD "hasMcSundae" "public"."pos_hasmcsundae_enum" NOT NULL DEFAULT 'UNKNOWN'`);
        await queryRunner.query(`ALTER TABLE "pos" DROP COLUMN "country"`);
        await queryRunner.query(`CREATE TYPE "public"."pos_country_enum" AS ENUM('DE', 'NL', 'DK', 'SE', 'FI', 'IE', 'GB', 'NO', 'AT', 'CH', 'BE', 'FR', 'ES', 'IT', 'US', 'CA', 'UNKNOWN')`);
        await queryRunner.query(`ALTER TABLE "pos" ADD "country" "public"."pos_country_enum" NOT NULL DEFAULT 'UNKNOWN'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pos" DROP COLUMN "country"`);
        await queryRunner.query(`DROP TYPE "public"."pos_country_enum"`);
        await queryRunner.query(`ALTER TABLE "pos" ADD "country" character varying NOT NULL DEFAULT 'DE'`);
        await queryRunner.query(`ALTER TABLE "pos" DROP COLUMN "hasMcSundae"`);
        await queryRunner.query(`DROP TYPE "public"."pos_hasmcsundae_enum"`);
        await queryRunner.query(`ALTER TABLE "pos" ADD "hasMcSundae" boolean`);
        await queryRunner.query(`ALTER TABLE "pos" DROP COLUMN "hasMcFlurry"`);
        await queryRunner.query(`DROP TYPE "public"."pos_hasmcflurry_enum"`);
        await queryRunner.query(`ALTER TABLE "pos" ADD "hasMcFlurry" boolean`);
        await queryRunner.query(`ALTER TABLE "pos" DROP COLUMN "hasMilchshake"`);
        await queryRunner.query(`DROP TYPE "public"."pos_hasmilchshake_enum"`);
        await queryRunner.query(`ALTER TABLE "pos" ADD "hasMilchshake" boolean`);
    }

}
