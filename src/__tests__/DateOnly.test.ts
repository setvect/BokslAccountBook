import { execFileSync } from 'child_process';
import path from 'path';
import { formatDateOnly, parseDateOnly } from '../common/dateOnly';
import { Currency, TransactionKind } from '../common/CommonType';
import { AccountEntity, TransactionEntity } from '../main/entity/Entity';
import { TransactionService } from '../main/service/TransactionService';
import createTestDatabase from './support/testDatabase';

it('rejects impossible days and retains valid leap days', () => {
  expect(formatDateOnly(parseDateOnly('2024-02-29'))).toBe('2024-02-29');
  expect(() => parseDateOnly('2025-02-29')).toThrow('존재하지');
  expect(() => parseDateOnly('2026-13-01')).toThrow('존재하지');
  expect(() => parseDateOnly('2026-01-01T00:00:00Z')).toThrow('날짜 형식');
  expect(() => formatDateOnly(new Date('invalid'))).toThrow('유효한');
});
it.each(['Asia/Seoul', 'America/Los_Angeles'])('round-trips local days across DST and year boundaries in %s', (timezone) => {
  const modulePath = path.resolve('src/common/dateOnly.ts');
  const script = `const {parseDateOnly,formatDateOnly}=require(${JSON.stringify(
    modulePath,
  )});console.log(JSON.stringify(['2026-01-01','2026-03-08','2026-11-01','2026-12-31'].map(day=>{const d=parseDateOnly(day);return [formatDateOnly(d),d.getHours()]})));`;
  const result = execFileSync(process.execPath, ['-r', 'ts-node/register/transpile-only', '-e', script], {
    cwd: process.cwd(),
    env: { ...process.env, TZ: timezone },
    encoding: 'utf8',
  });
  expect(JSON.parse(result)).toEqual([
    ['2026-01-01', 0],
    ['2026-03-08', 0],
    ['2026-11-01', 0],
    ['2026-12-31', 0],
  ]);
});
it('keeps SQLite DATE text unchanged while entity, service and monthly IPC models contain local Dates', async () => {
  const database = await createTestDatabase();
  try {
    const { manager } = database.dataSource;
    await manager.insert(AccountEntity, { accountSeq: 1, name: 'account', accountType: 1, assetType: 1 });
    const service = new TransactionService(database.dataSource);
    await service.save({
      transactionSeq: 0,
      kind: TransactionKind.INCOME,
      transactionDate: new Date(2026, 2, 8, 22, 30),
      categorySeq: 1,
      payAccount: 0,
      receiveAccount: 1,
      attribute: 1,
      currency: Currency.KRW,
      amount: 100,
      fee: 2,
      note: 'day',
    });
    const [entity] = await manager.find(TransactionEntity);
    expect(entity.transactionDate).toBeInstanceOf(Date);
    expect(entity.transactionDate.getHours()).toBe(0);
    const result = await service.get(entity.transactionSeq);
    expect(formatDateOnly(result.transactionDate)).toBe('2026-03-08');
    const table = database.dataSource.getMetadata(TransactionEntity).tableName;
    expect(await database.dataSource.query(`SELECT TRANSACTION_DATE FROM "${table}"`)).toEqual([{ TRANSACTION_DATE: '2026-03-08' }]);
    const [month] = await service.getMonthlyAmountSum({ from: new Date(2026, 2, 1), to: new Date(2026, 2, 31), currency: Currency.KRW });
    expect(formatDateOnly(month.transactionDate)).toBe('2026-03-01');
    expect(month.transactionDate.getHours()).toBe(0);
    expect(month).toMatchObject({ amount: 100, fee: 2 });
  } finally {
    await database.dispose();
  }
});
