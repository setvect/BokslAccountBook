// TypeORM migrations implement stateless instance methods.
/* eslint class-methods-use-this: off */
import { MigrationInterface, QueryRunner } from 'typeorm';

export default class FractionalQuantity1791370000001 implements MigrationInterface {
  name = 'FractionalQuantity1791370000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    // eslint-disable-next-line no-restricted-syntax
    for (const name of ['CB_STOCK_BUY', 'CC_TRADE']) {
      // eslint-disable-next-line no-await-in-loop
      const table = await queryRunner.getTable(name);
      const column = table?.findColumnByName('QUANTITY');
      if (!table || !column || column.type !== 'integer') throw new Error(`수량 컬럼을 확인할 수 없습니다: ${name}`);
      // Preserve AUTOINCREMENT high-water marks and user triggers during the rebuild.
      // eslint-disable-next-line no-await-in-loop
      const sequences: { seq: number }[] = await queryRunner.query('SELECT seq FROM sqlite_sequence WHERE name = ?', [name]);
      // eslint-disable-next-line no-await-in-loop
      const triggers: { sql: string }[] = await queryRunner.query("SELECT sql FROM sqlite_master WHERE type = 'trigger' AND tbl_name = ?", [name]);
      const realColumn = column.clone();
      realColumn.type = 'real';
      // SQLite rebuild copies every column and retains the table's keys and indexes.
      // eslint-disable-next-line no-await-in-loop
      await queryRunner.changeColumn(table, column, realColumn);
      if (sequences.length) {
        // eslint-disable-next-line no-await-in-loop
        await queryRunner.query('UPDATE sqlite_sequence SET seq = MAX(seq, ?) WHERE name = ?', [sequences[0].seq, name]);
        // eslint-disable-next-line no-await-in-loop
        await queryRunner.query(
          'INSERT INTO sqlite_sequence(name, seq) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM sqlite_sequence WHERE name = ?)',
          [name, sequences[0].seq, name],
        );
      }
      // eslint-disable-next-line no-restricted-syntax
      for (const trigger of triggers) {
        // eslint-disable-next-line no-await-in-loop
        await queryRunner.query(trigger.sql);
      }
    }
    const violations: unknown[] = await queryRunner.query('PRAGMA foreign_key_check');
    if (violations.length) throw new Error('업그레이드 후 외래 키 검증에 실패했습니다.');
  }

  async down(): Promise<void> {
    throw new Error('소수 수량을 잃을 수 있으므로 정수 스키마로 자동 복귀하지 않습니다. 업그레이드 전 백업을 복원해 주세요.');
  }
}
