import {MigrationInterface, QueryRunner} from "typeorm";

export class updatePrimaryColumn1642180017854 implements MigrationInterface {
    name = 'updatePrimaryColumn1642180017854'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pos" DROP CONSTRAINT "PK_6001f83f6f65dee911aa922b24a"`);
        await queryRunner.query(`ALTER TABLE "pos" DROP COLUMN "nationalStoreNumber"`);
        await queryRunner.query(`ALTER TABLE "pos" ADD "nationalStoreNumber" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pos" ADD CONSTRAINT "PK_6001f83f6f65dee911aa922b24a" PRIMARY KEY ("nationalStoreNumber")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pos" DROP CONSTRAINT "PK_6001f83f6f65dee911aa922b24a"`);
        await queryRunner.query(`ALTER TABLE "pos" DROP COLUMN "nationalStoreNumber"`);
        await queryRunner.query(`ALTER TABLE "pos" ADD "nationalStoreNumber" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pos" ADD CONSTRAINT "PK_6001f83f6f65dee911aa922b24a" PRIMARY KEY ("nationalStoreNumber")`);
    }

}
