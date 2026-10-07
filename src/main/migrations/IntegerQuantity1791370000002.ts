// TypeORM migrations implement stateless instance methods.
/* eslint class-methods-use-this: off */
import { MigrationInterface, QueryRunner } from 'typeorm';

export default class IntegerQuantity1791370000002 implements MigrationInterface {
  name = 'IntegerQuantity1791370000002';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Validate raw SQLite values before TypeORM can truncate them while reading INTEGER columns.
    // eslint-disable-next-line no-restricted-syntax
    for (const name of ['CB_STOCK_BUY', 'CC_TRADE']) {
      // eslint-disable-next-line no-await-in-loop
      const invalid: unknown[] = await queryRunner.query(
        `SELECT 1 FROM "${name}" WHERE typeof(QUANTITY) NOT IN ('integer', 'real') OR QUANTITY != CAST(QUANTITY AS INTEGER) LIMIT 1`,
      );
      if (invalid.length) throw new Error(`정수가 아닌 수량이 있어 INTEGER 전환을 중단합니다: ${name}. 수량을 임의로 반올림하거나 버리지 않습니다.`);
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const name of ['CB_STOCK_BUY', 'CC_TRADE']) {
      // eslint-disable-next-line no-await-in-loop
      const table = await queryRunner.getTable(name);
      const column = table?.findColumnByName('QUANTITY');
      if (!table || !column || !['integer', 'real'].includes(column.type)) throw new Error(`수량 컬럼을 확인할 수 없습니다: ${name}`);
      if (column.type === 'real') {
        // Preserve AUTOINCREMENT high-water marks and user triggers during the rebuild.
        // eslint-disable-next-line no-await-in-loop
        const sequences: { seq: number }[] = await queryRunner.query('SELECT seq FROM sqlite_sequence WHERE name = ?', [name]);
        // eslint-disable-next-line no-await-in-loop
        const triggers: { sql: string }[] = await queryRunner.query("SELECT sql FROM sqlite_master WHERE type = 'trigger' AND tbl_name = ?", [name]);
        const integerColumn = column.clone();
        integerColumn.type = 'integer';
        // SQLite rebuild copies every column and retains the table's keys and indexes.
        // eslint-disable-next-line no-await-in-loop
        await queryRunner.changeColumn(table, column, integerColumn);
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
    }
    const violations: unknown[] = await queryRunner.query('PRAGMA foreign_key_check');
    if (violations.length) throw new Error('업그레이드 후 외래 키 검증에 실패했습니다.');
  }

  async down(): Promise<void> {
    throw new Error('수량의 정수 정책을 유지합니다. 이전 버전으로 복구하려면 업그레이드 전 백업을 사용해 주세요.');
  }
}
