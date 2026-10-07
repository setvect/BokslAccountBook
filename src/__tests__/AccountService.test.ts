import { Currency } from '../common/CommonType';
import { ReqAccountModel } from '../common/ReqModel';
import { AccountEntity, BalanceEntity } from '../main/entity/Entity';
import AccountService from '../main/service/AccountService';
import createTestDatabase from './support/testDatabase';

describe('atomic account balances', () => {
  let database: Awaited<ReturnType<typeof createTestDatabase>>;
  beforeEach(async () => {
    database = await createTestDatabase();
  });
  afterEach(async () => database?.dispose());
  const form: ReqAccountModel = {
    accountSeq: 0,
    name: '계좌',
    accountNumber: '',
    accountType: 1,
    assetType: 1,
    stockF: false,
    balance: [{ currency: Currency.KRW, amount: 1000 }],
  };
  async function failForeignCurrencyInsert() {
    await database.dataSource.query(
      "CREATE TEMP TRIGGER reject_usd BEFORE INSERT ON BB_BALANCE WHEN NEW.CURRENCY = 'USD' BEGIN SELECT RAISE(ABORT, 'test failure'); END",
    );
  }
  it('rolls back account creation and the first balance if a later balance fails', async () => {
    await failForeignCurrencyInsert();
    await expect(
      AccountService.save({ ...form, balance: [...form.balance, { currency: Currency.USD, amount: 10 }] }, database.dataSource),
    ).rejects.toThrow('test failure');
    expect(await database.dataSource.manager.count(AccountEntity)).toBe(0);
    expect(await database.dataSource.manager.count(BalanceEntity)).toBe(0);
  });
  it('restores the name and deleted balances when replacement fails', async () => {
    await AccountService.save(form, database.dataSource);
    const [account] = await database.dataSource.manager.find(AccountEntity);
    await failForeignCurrencyInsert();
    await expect(
      AccountService.update(
        { ...form, accountSeq: account.accountSeq, name: '변경', balance: [{ currency: Currency.USD, amount: 10 }] },
        database.dataSource,
      ),
    ).rejects.toThrow('test failure');
    expect((await database.dataSource.manager.find(AccountEntity))[0].name).toBe('계좌');
    expect((await database.dataSource.manager.find(BalanceEntity))[0]).toMatchObject({ currency: Currency.KRW, amount: 1000 });
  });
  it('rejects duplicate currencies without partial writes', async () => {
    await expect(AccountService.save({ ...form, balance: [...form.balance, ...form.balance] }, database.dataSource)).rejects.toThrow('중복');
    expect(await database.dataSource.manager.count(AccountEntity)).toBe(0);
  });
});
