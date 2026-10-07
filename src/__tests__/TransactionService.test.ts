import { Currency, TransactionKind } from '../common/CommonType';
import { ReqTransactionModel } from '../common/ReqModel';
import { AccountEntity, BalanceEntity, TransactionEntity } from '../main/entity/Entity';
import { TransactionService } from '../main/service/TransactionService';
import createTestDatabase from './support/testDatabase';

describe('transaction balance contract', () => {
  let database: Awaited<ReturnType<typeof createTestDatabase>>;
  let service: TransactionService;

  beforeEach(async () => {
    database = await createTestDatabase();
    service = new TransactionService(database.dataSource);
    await database.dataSource.manager.insert(AccountEntity, [
      { accountSeq: 1, name: '출금', assetType: 1, accountType: 1 },
      { accountSeq: 2, name: '입금', assetType: 1, accountType: 1 },
    ]);
    await database.dataSource.manager.insert(BalanceEntity, [
      { account: { accountSeq: 1 }, currency: Currency.KRW, amount: 1000 },
      { account: { accountSeq: 2 }, currency: Currency.KRW, amount: 2000 },
    ]);
  });

  afterEach(async () => database?.dispose());

  const form = (kind: TransactionKind): ReqTransactionModel => ({
    transactionSeq: 0,
    kind,
    categorySeq: 1,
    payAccount: 1,
    receiveAccount: 2,
    attribute: 1,
    currency: Currency.KRW,
    amount: 100,
    fee: 10,
    transactionDate: new Date(2026, 0, 15),
    note: '기준 거래',
  });

  async function balances() {
    const rows = await database.dataSource.manager.find(BalanceEntity, { order: { balanceSeq: 'ASC' } });
    return rows.map((row) => row.amount);
  }

  it.each([
    [TransactionKind.SPENDING, [890, 2000]],
    [TransactionKind.INCOME, [1000, 2090]],
    [TransactionKind.TRANSFER, [890, 2100]],
  ])('%s applies fees and deleting restores balances', async (kind, expected) => {
    await service.save(form(kind as TransactionKind));
    expect(await balances()).toEqual(expected);
    const [saved] = await database.dataSource.manager.find(TransactionEntity);
    await service.delete(saved.transactionSeq);
    expect(await balances()).toEqual([1000, 2000]);
    expect(await database.dataSource.manager.count(TransactionEntity)).toBe(0);
  });

  it('updating reverses the previous balance effect before applying the new one', async () => {
    const original = form(TransactionKind.SPENDING);
    await service.save(original);
    const [saved] = await database.dataSource.manager.find(TransactionEntity);
    await service.update({ ...original, transactionSeq: saved.transactionSeq, amount: 250, payAccount: 2 });
    expect(await balances()).toEqual([1000, 1740]);
    await service.delete(saved.transactionSeq);
    expect(await balances()).toEqual([1000, 2000]);
  });

  it('rolls back both the inserted transaction and first balance write when the second write fails', async () => {
    await expect(service.save({ ...form(TransactionKind.TRANSFER), receiveAccount: 999 })).rejects.toThrow();
    expect(await balances()).toEqual([1000, 2000]);
    expect(await database.dataSource.manager.count(TransactionEntity)).toBe(0);
  });
});
