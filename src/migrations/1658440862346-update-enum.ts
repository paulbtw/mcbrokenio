import {MigrationInterface, QueryRunner} from "typeorm";

export class updateEnum1658440862346 implements MigrationInterface {
    name = 'updateEnum1658440862346'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."pos_country_enum" RENAME TO "pos_country_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."pos_country_enum" AS ENUM('AE', 'AT', 'AU', 'BA', 'BE', 'BG', 'BH', 'BY', 'CA', 'CY', 'CZ', 'CH', 'DE', 'DK', 'EE', 'EG', 'ES', 'FI', 'FR', 'GE', 'GR', 'GT', 'HK', 'HN', 'HR', 'HU', 'ID', 'IE', 'IT', 'JO', 'KZ', 'KW', 'LV', 'LB', 'LT', 'MA', 'MT', 'MU', 'MY', 'NI', 'NL', 'NO', 'NZ', 'PK', 'PL', 'PT', 'PY', 'RE', 'RO', 'RS', 'SG', 'SAR', 'KR', 'SE', 'SI', 'SV', 'TH', 'UA', 'UK', 'UNKNOWN', 'US', 'VN')`);
        await queryRunner.query(`ALTER TABLE "pos" ALTER COLUMN "country" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "pos" ALTER COLUMN "country" TYPE "public"."pos_country_enum" USING "country"::"text"::"public"."pos_country_enum"`);
        await queryRunner.query(`ALTER TABLE "pos" ALTER COLUMN "country" SET DEFAULT 'UNKNOWN'`);
        await queryRunner.query(`DROP TYPE "public"."pos_country_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."pos_memory_country_enum" RENAME TO "pos_memory_country_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."pos_memory_country_enum" AS ENUM('AE', 'AT', 'AU', 'BA', 'BE', 'BG', 'BH', 'BY', 'CA', 'CY', 'CZ', 'CH', 'DE', 'DK', 'EE', 'EG', 'ES', 'FI', 'FR', 'GE', 'GR', 'GT', 'HK', 'HN', 'HR', 'HU', 'ID', 'IE', 'IT', 'JO', 'KZ', 'KW', 'LV', 'LB', 'LT', 'MA', 'MT', 'MU', 'MY', 'NI', 'NL', 'NO', 'NZ', 'PK', 'PL', 'PT', 'PY', 'RE', 'RO', 'RS', 'SG', 'SAR', 'KR', 'SE', 'SI', 'SV', 'TH', 'UA', 'UK', 'UNKNOWN', 'US', 'VN')`);
        await queryRunner.query(`ALTER TABLE "pos_memory" ALTER COLUMN "country" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "pos_memory" ALTER COLUMN "country" TYPE "public"."pos_memory_country_enum" USING "country"::"text"::"public"."pos_memory_country_enum"`);
        await queryRunner.query(`ALTER TABLE "pos_memory" ALTER COLUMN "country" SET DEFAULT 'UNKNOWN'`);
        await queryRunner.query(`DROP TYPE "public"."pos_memory_country_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."stats_country_enum" RENAME TO "stats_country_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."stats_country_enum" AS ENUM('AE', 'AT', 'AU', 'BA', 'BE', 'BG', 'BH', 'BY', 'CA', 'CY', 'CZ', 'CH', 'DE', 'DK', 'EE', 'EG', 'ES', 'FI', 'FR', 'GE', 'GR', 'GT', 'HK', 'HN', 'HR', 'HU', 'ID', 'IE', 'IT', 'JO', 'KZ', 'KW', 'LV', 'LB', 'LT', 'MA', 'MT', 'MU', 'MY', 'NI', 'NL', 'NO', 'NZ', 'PK', 'PL', 'PT', 'PY', 'RE', 'RO', 'RS', 'SG', 'SAR', 'KR', 'SE', 'SI', 'SV', 'TH', 'UA', 'UK', 'UNKNOWN', 'US', 'VN')`);
        await queryRunner.query(`ALTER TABLE "stats" ALTER COLUMN "country" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "stats" ALTER COLUMN "country" TYPE "public"."stats_country_enum" USING "country"::"text"::"public"."stats_country_enum"`);
        await queryRunner.query(`ALTER TABLE "stats" ALTER COLUMN "country" SET DEFAULT 'UNKNOWN'`);
        await queryRunner.query(`DROP TYPE "public"."stats_country_enum_old"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fa1a0748043607426d55a470ce"`);
        await queryRunner.query(`ALTER TYPE "public"."stats_memory_country_enum" RENAME TO "stats_memory_country_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."stats_memory_country_enum" AS ENUM('AE', 'AT', 'AU', 'BA', 'BE', 'BG', 'BH', 'BY', 'CA', 'CY', 'CZ', 'CH', 'DE', 'DK', 'EE', 'EG', 'ES', 'FI', 'FR', 'GE', 'GR', 'GT', 'HK', 'HN', 'HR', 'HU', 'ID', 'IE', 'IT', 'JO', 'KZ', 'KW', 'LV', 'LB', 'LT', 'MA', 'MT', 'MU', 'MY', 'NI', 'NL', 'NO', 'NZ', 'PK', 'PL', 'PT', 'PY', 'RE', 'RO', 'RS', 'SG', 'SAR', 'KR', 'SE', 'SI', 'SV', 'TH', 'UA', 'UK', 'UNKNOWN', 'US', 'VN')`);
        await queryRunner.query(`ALTER TABLE "stats_memory" ALTER COLUMN "country" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "stats_memory" ALTER COLUMN "country" TYPE "public"."stats_memory_country_enum" USING "country"::"text"::"public"."stats_memory_country_enum"`);
        await queryRunner.query(`ALTER TABLE "stats_memory" ALTER COLUMN "country" SET DEFAULT 'UNKNOWN'`);
        await queryRunner.query(`DROP TYPE "public"."stats_memory_country_enum_old"`);
        await queryRunner.query(`CREATE INDEX "IDX_fa1a0748043607426d55a470ce" ON "stats_memory" ("country", "targetDate") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_fa1a0748043607426d55a470ce"`);
        await queryRunner.query(`CREATE TYPE "public"."stats_memory_country_enum_old" AS ENUM('AE', 'AT', 'AU', 'BA', 'BE', 'BG', 'BY', 'CA', 'CH', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GE', 'GR', 'GT', 'HK', 'HN', 'HR', 'ID', 'IE', 'IT', 'LT', 'MA', 'MT', 'MU', 'MY', 'NI', 'NL', 'NO', 'PK', 'PL', 'PT', 'PY', 'RE', 'RO', 'RS', 'SAR', 'SE', 'SI', 'SV', 'TH', 'UA', 'UK', 'UNKNOWN', 'US', 'VN')`);
        await queryRunner.query(`ALTER TABLE "stats_memory" ALTER COLUMN "country" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "stats_memory" ALTER COLUMN "country" TYPE "public"."stats_memory_country_enum_old" USING "country"::"text"::"public"."stats_memory_country_enum_old"`);
        await queryRunner.query(`ALTER TABLE "stats_memory" ALTER COLUMN "country" SET DEFAULT 'UNKNOWN'`);
        await queryRunner.query(`DROP TYPE "public"."stats_memory_country_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."stats_memory_country_enum_old" RENAME TO "stats_memory_country_enum"`);
        await queryRunner.query(`CREATE INDEX "IDX_fa1a0748043607426d55a470ce" ON "stats_memory" ("country", "targetDate") `);
        await queryRunner.query(`CREATE TYPE "public"."stats_country_enum_old" AS ENUM('AE', 'AT', 'AU', 'BA', 'BE', 'BG', 'BY', 'CA', 'CH', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GE', 'GR', 'GT', 'HK', 'HN', 'HR', 'ID', 'IE', 'IT', 'LT', 'MA', 'MT', 'MU', 'MY', 'NI', 'NL', 'NO', 'PK', 'PL', 'PT', 'PY', 'RE', 'RO', 'RS', 'SAR', 'SE', 'SI', 'SV', 'TH', 'UA', 'UK', 'UNKNOWN', 'US', 'VN')`);
        await queryRunner.query(`ALTER TABLE "stats" ALTER COLUMN "country" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "stats" ALTER COLUMN "country" TYPE "public"."stats_country_enum_old" USING "country"::"text"::"public"."stats_country_enum_old"`);
        await queryRunner.query(`ALTER TABLE "stats" ALTER COLUMN "country" SET DEFAULT 'UNKNOWN'`);
        await queryRunner.query(`DROP TYPE "public"."stats_country_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."stats_country_enum_old" RENAME TO "stats_country_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."pos_memory_country_enum_old" AS ENUM('AE', 'AT', 'AU', 'BA', 'BE', 'BG', 'BY', 'CA', 'CH', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GE', 'GR', 'GT', 'HK', 'HN', 'HR', 'ID', 'IE', 'IT', 'LT', 'MA', 'MT', 'MU', 'MY', 'NI', 'NL', 'NO', 'PK', 'PL', 'PT', 'PY', 'RE', 'RO', 'RS', 'SAR', 'SE', 'SI', 'SV', 'TH', 'UA', 'UK', 'UNKNOWN', 'US', 'VN')`);
        await queryRunner.query(`ALTER TABLE "pos_memory" ALTER COLUMN "country" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "pos_memory" ALTER COLUMN "country" TYPE "public"."pos_memory_country_enum_old" USING "country"::"text"::"public"."pos_memory_country_enum_old"`);
        await queryRunner.query(`ALTER TABLE "pos_memory" ALTER COLUMN "country" SET DEFAULT 'UNKNOWN'`);
        await queryRunner.query(`DROP TYPE "public"."pos_memory_country_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."pos_memory_country_enum_old" RENAME TO "pos_memory_country_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."pos_country_enum_old" AS ENUM('AE', 'AT', 'AU', 'BA', 'BE', 'BG', 'BY', 'CA', 'CH', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GE', 'GR', 'GT', 'HK', 'HN', 'HR', 'ID', 'IE', 'IT', 'LT', 'MA', 'MT', 'MU', 'MY', 'NI', 'NL', 'NO', 'PK', 'PL', 'PT', 'PY', 'RE', 'RO', 'RS', 'SAR', 'SE', 'SI', 'SV', 'TH', 'UA', 'UK', 'UNKNOWN', 'US', 'VN')`);
        await queryRunner.query(`ALTER TABLE "pos" ALTER COLUMN "country" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "pos" ALTER COLUMN "country" TYPE "public"."pos_country_enum_old" USING "country"::"text"::"public"."pos_country_enum_old"`);
        await queryRunner.query(`ALTER TABLE "pos" ALTER COLUMN "country" SET DEFAULT 'UNKNOWN'`);
        await queryRunner.query(`DROP TYPE "public"."pos_country_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."pos_country_enum_old" RENAME TO "pos_country_enum"`);
    }

}
