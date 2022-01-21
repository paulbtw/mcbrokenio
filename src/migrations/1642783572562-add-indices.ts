import {MigrationInterface, QueryRunner} from "typeorm";

export class addIndices1642783572562 implements MigrationInterface {
    name = 'addIndices1642783572562'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_ce7ef870dd4d2ca8cb1ea55316" ON "pos_memory" ("nationalStoreNumber") `);
        await queryRunner.query(`CREATE INDEX "IDX_7e703157fd24239b247e77fab5" ON "pos_memory" ("country") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_7e703157fd24239b247e77fab5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ce7ef870dd4d2ca8cb1ea55316"`);
    }

}
