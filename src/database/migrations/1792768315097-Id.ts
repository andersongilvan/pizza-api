import { MigrationInterface, QueryRunner } from 'typeorm'

export class Id1792768315097 implements MigrationInterface {
  name = 'Id1792768315097'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT`)
  }
}
