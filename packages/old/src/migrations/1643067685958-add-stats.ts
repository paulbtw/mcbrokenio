import {MigrationInterface, QueryRunner} from "typeorm";

export class addStats1643067685958 implements MigrationInterface {
    name = 'addStats1643067685958'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."stats_country_enum" AS ENUM('AE', 'AT', 'AU', 'BA', 'BE', 'BG', 'BY', 'CA', 'CH', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GE', 'GR', 'GT', 'HK', 'HN', 'HR', 'ID', 'IE', 'IT', 'LT', 'MA', 'MT', 'MU', 'MY', 'NI', 'NL', 'NO', 'PK', 'PL', 'PT', 'PY', 'RE', 'RO', 'RS', 'SAR', 'SE', 'SI', 'SV', 'TH', 'UA', 'UK', 'UNKNOWN', 'US', 'VN')`);
        await queryRunner.query(`CREATE TABLE "stats" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "country" "public"."stats_country_enum" NOT NULL DEFAULT 'UNKNOWN', "totalMcd" integer NOT NULL, "trackableMcd" integer NOT NULL, "availableMilchshake" integer NOT NULL, "trackableMilchshake" integer NOT NULL, "availableMcFlurry" integer NOT NULL, "trackableMcFlurry" integer NOT NULL, "availableMcSundae" integer NOT NULL, "trackableMcSundae" integer NOT NULL, CONSTRAINT "PK_c76e93dfef28ba9b6942f578ab1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b6cad4001c3e236c1d773b077f" ON "stats" ("country") `);
        await queryRunner.query(`CREATE TYPE "public"."stats_memory_country_enum" AS ENUM('AE', 'AT', 'AU', 'BA', 'BE', 'BG', 'BY', 'CA', 'CH', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GE', 'GR', 'GT', 'HK', 'HN', 'HR', 'ID', 'IE', 'IT', 'LT', 'MA', 'MT', 'MU', 'MY', 'NI', 'NL', 'NO', 'PK', 'PL', 'PT', 'PY', 'RE', 'RO', 'RS', 'SAR', 'SE', 'SI', 'SV', 'TH', 'UA', 'UK', 'UNKNOWN', 'US', 'VN')`);
        await queryRunner.query(`CREATE TABLE "stats_memory" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "country" "public"."stats_memory_country_enum" NOT NULL DEFAULT 'UNKNOWN', "totalMcd" integer NOT NULL, "trackableMcd" integer NOT NULL, "availableMilchshake" integer NOT NULL, "trackableMilchshake" integer NOT NULL, "availableMcFlurry" integer NOT NULL, "trackableMcFlurry" integer NOT NULL, "availableMcSundae" integer NOT NULL, "trackableMcSundae" integer NOT NULL, "targetDate" date NOT NULL DEFAULT ('now'::text)::date, CONSTRAINT "PK_4f5a2465b6e8b70579c013ff573" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7223b77b74c45171ffb29b2a39" ON "stats_memory" ("country") `);
        await queryRunner.query(`CREATE INDEX "IDX_50927193a3f5faf5ed0c9ba115" ON "stats_memory" ("targetDate") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_50927193a3f5faf5ed0c9ba115"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7223b77b74c45171ffb29b2a39"`);
        await queryRunner.query(`DROP TABLE "stats_memory"`);
        await queryRunner.query(`DROP TYPE "public"."stats_memory_country_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b6cad4001c3e236c1d773b077f"`);
        await queryRunner.query(`DROP TABLE "stats"`);
        await queryRunner.query(`DROP TYPE "public"."stats_country_enum"`);
    }

}
