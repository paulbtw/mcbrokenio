import {MigrationInterface, QueryRunner} from "typeorm";

export class addIndex1643577639172 implements MigrationInterface {
    name = 'addIndex1643577639172'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_fa1a0748043607426d55a470ce" ON "stats_memory" ("country", "targetDate") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_fa1a0748043607426d55a470ce"`);
    }

}
