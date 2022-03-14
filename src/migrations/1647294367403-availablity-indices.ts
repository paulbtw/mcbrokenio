import {MigrationInterface, QueryRunner} from "typeorm";

export class availablityIndices1647294367403 implements MigrationInterface {
    name = 'availablityIndices1647294367403'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_efc4936701b4881f88fc5aacd7" ON "pos_memory" ("hasMilchshake") WHERE "hasMilchshake" = 'AVAILABLE'`);
        await queryRunner.query(`CREATE INDEX "IDX_63008a87b38278d7b65613cea0" ON "pos_memory" ("hasMcFlurry") WHERE "hasMcFlurry" = 'AVAILABLE'`);
        await queryRunner.query(`CREATE INDEX "IDX_1307336e4301a139615ee8a14b" ON "pos_memory" ("hasMcSundae") WHERE "hasMcSundae" = 'AVAILABLE'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_1307336e4301a139615ee8a14b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_63008a87b38278d7b65613cea0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_efc4936701b4881f88fc5aacd7"`);
    }

}
