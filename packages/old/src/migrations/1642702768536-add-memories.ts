import {MigrationInterface, QueryRunner} from "typeorm";

export class addMemories1642702768536 implements MigrationInterface {
    name = 'addMemories1642702768536'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."pos_memory_hasmilchshake_enum" AS ENUM('AVAILABLE', 'NOT_APPLICABLE', 'NOT_AVAILABLE', 'UNKNOWN')`);
        await queryRunner.query(`CREATE TYPE "public"."pos_memory_hasmcflurry_enum" AS ENUM('AVAILABLE', 'NOT_APPLICABLE', 'NOT_AVAILABLE', 'UNKNOWN')`);
        await queryRunner.query(`CREATE TYPE "public"."pos_memory_hasmcsundae_enum" AS ENUM('AVAILABLE', 'NOT_APPLICABLE', 'NOT_AVAILABLE', 'UNKNOWN')`);
        await queryRunner.query(`CREATE TYPE "public"."pos_memory_country_enum" AS ENUM('AE', 'AT', 'AU', 'BA', 'BE', 'BG', 'BY', 'CA', 'CH', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GE', 'GR', 'GT', 'HK', 'HN', 'HR', 'ID', 'IE', 'IT', 'LT', 'MA', 'MT', 'MU', 'MY', 'NI', 'NL', 'NO', 'PK', 'PL', 'PT', 'PY', 'RE', 'RO', 'RS', 'SAR', 'SE', 'SI', 'SV', 'TH', 'UA', 'UK', 'UNKNOWN', 'US', 'VN')`);
        await queryRunner.query(`CREATE TABLE "pos_memory" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nationalStoreNumber" character varying NOT NULL, "name" character varying NOT NULL, "restaurantStatus" character varying NOT NULL, "latitude" character varying NOT NULL, "longitude" character varying NOT NULL, "hasMilchshake" "public"."pos_memory_hasmilchshake_enum" NOT NULL DEFAULT 'UNKNOWN', "hasMcFlurry" "public"."pos_memory_hasmcflurry_enum" NOT NULL DEFAULT 'UNKNOWN', "hasMcSundae" "public"."pos_memory_hasmcsundae_enum" NOT NULL DEFAULT 'UNKNOWN', "lastCheck" TIMESTAMP, "timeSinceBrokenMilchshake" TIMESTAMP, "timeSinceBrokenMcFlurry" TIMESTAMP, "timeSinceBrokenMcSundae" TIMESTAMP, "country" "public"."pos_memory_country_enum" NOT NULL DEFAULT 'UNKNOWN', "hasMobileOrdering" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_a0b7f8f7182c754ffef78121f3c" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "pos_memory"`);
        await queryRunner.query(`DROP TYPE "public"."pos_memory_country_enum"`);
        await queryRunner.query(`DROP TYPE "public"."pos_memory_hasmcsundae_enum"`);
        await queryRunner.query(`DROP TYPE "public"."pos_memory_hasmcflurry_enum"`);
        await queryRunner.query(`DROP TYPE "public"."pos_memory_hasmilchshake_enum"`);
    }

}
