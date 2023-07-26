import { MigrationInterface, QueryRunner } from 'typeorm';

export class initial1636725674089 implements MigrationInterface {
  name = 'initial1636725674089';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "pos" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "nationalStoreNumber" integer NOT NULL, "name" character varying NOT NULL, "restaurantStatus" character varying NOT NULL, "latitude" character varying NOT NULL, "longitude" character varying NOT NULL, "hasMilchshake" boolean, "hasMcFlurry" boolean, "hasMcSundae" boolean, "lastCheck" TIMESTAMP, "timeSinceBrokenMilchshake" integer NOT NULL, "timeSinceBrokenMcFlurry" integer NOT NULL, "timeSinceBrokenMcSundae" integer NOT NULL, "country" character varying NOT NULL DEFAULT \'DE\', CONSTRAINT "PK_6001f83f6f65dee911aa922b24a" PRIMARY KEY ("nationalStoreNumber"))');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "pos"');
  }
}
