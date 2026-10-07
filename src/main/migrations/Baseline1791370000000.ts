// TypeORM migrations implement stateless instance methods.
/* eslint class-methods-use-this: off */
import { MigrationInterface, QueryRunner } from 'typeorm';
import legacy from './legacy-schema.json';

export default class Baseline1791370000000 implements MigrationInterface {
  name = 'Baseline1791370000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const tables: { name: string }[] = await queryRunner.query(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name != 'migrations'",
    );
    if (tables.length === 0) {
      // Frozen DDL, independent of future entity changes.
      // eslint-disable-next-line no-restricted-syntax
      for (const object of legacy.objects) {
        // eslint-disable-next-line no-await-in-loop
        await queryRunner.query(object.sql);
      }
      return;
    }

    // Adoption records history only. Never synchronize an unknown user schema.
    // eslint-disable-next-line no-restricted-syntax
    for (const table of legacy.tables) {
      // eslint-disable-next-line no-await-in-loop
      const columns = await queryRunner.query(`PRAGMA table_info("${table.name}")`);
      // eslint-disable-next-line no-await-in-loop
      const foreignKeys = await queryRunner.query(`PRAGMA foreign_key_list("${table.name}")`);
      if (JSON.stringify(columns) !== JSON.stringify(table.columns) || JSON.stringify(foreignKeys) !== JSON.stringify(table.foreignKeys)) {
        throw new Error(`지원하지 않는 기존 DB 구조입니다: ${table.name}. 원본 DB를 보존한 상태에서 업그레이드 경로를 확인해 주세요.`);
      }
    }
    const indexes: { name: string; sql: string }[] = await queryRunner.query(
      "SELECT name, sql FROM sqlite_master WHERE type = 'index' AND sql IS NOT NULL",
    );
    const normalize = (sql: string) => sql.replace(/\s+/g, ' ').trim();
    legacy.objects
      .filter((object) => object.type === 'index')
      .forEach((index) => {
        if (!indexes.some((existing) => existing.name === index.name && normalize(existing.sql) === normalize(index.sql))) {
          throw new Error(`기존 DB 인덱스가 기준과 다릅니다: ${index.name}`);
        }
      });
  }

  async down(): Promise<void> {
    throw new Error('사용자 데이터 보존을 위해 자동 스키마 삭제를 지원하지 않습니다. 업그레이드 전 백업을 복원해 주세요.');
  }
}
