import {MigrationInterface, QueryRunner} from "typeorm";

export class updateEnum1637512273012 implements MigrationInterface {
    name = 'updateEnum1637512273012'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."pos_country_enum" RENAME TO "pos_country_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."pos_country_enum" AS ENUM('AE', 'AT', 'BA', 'BE', 'BG', 'BY', 'CA', 'CH', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GB', 'GE', 'GR', 'GT', 'HN', 'HR', 'ID', 'IE', 'IT', 'LT', 'MA', 'MT', 'MU', 'MY', 'NI', 'NL', 'NO', 'PK', 'PL', 'PT', 'PY', 'RE', 'RO', 'RS', 'SAR', 'SE', 'SI', 'SV', 'TH', 'UA', 'UNKNOWN', 'US', 'VN')`);
        await queryRunner.query(`ALTER TABLE "pos" ALTER COLUMN "country" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "pos" ALTER COLUMN "country" TYPE "public"."pos_country_enum" USING "country"::"text"::"public"."pos_country_enum"`);
        await queryRunner.query(`ALTER TABLE "pos" ALTER COLUMN "country" SET DEFAULT 'UNKNOWN'`);
        await queryRunner.query(`DROP TYPE "public"."pos_country_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."pos_country_enum_old" AS ENUM('DE', 'NL', 'DK', 'SE', 'FI', 'IE', 'GB', 'NO', 'AT', 'CH', 'BE', 'FR', 'ES', 'IT', 'US', 'CA', 'VN', 'HR', 'GR', 'PT', 'BG', 'BA', 'BY', 'UNKNOWN')`);
        await queryRunner.query(`ALTER TABLE "pos" ALTER COLUMN "country" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "pos" ALTER COLUMN "country" TYPE "public"."pos_country_enum_old" USING "country"::"text"::"public"."pos_country_enum_old"`);
        await queryRunner.query(`ALTER TABLE "pos" ALTER COLUMN "country" SET DEFAULT 'UNKNOWN'`);
        await queryRunner.query(`DROP TYPE "public"."pos_country_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."pos_country_enum_old" RENAME TO "pos_country_enum"`);
    }

}
