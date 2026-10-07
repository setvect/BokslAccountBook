import { Currency, ExchangeKind } from '../common/CommonType';
import { ReqExchangeModel } from '../common/ReqModel';
import { AccountEntity, BalanceEntity, ExchangeEntity } from '../main/entity/Entity';
import exchangeService from '../main/service/ExchangeService';
import AppDataSource from '../main/config/AppDataSource';

jest.mock('electron-log', () => ({ info: jest.fn(), error: jest.fn() }));

describe('exchange balance contract', () => {
  beforeEach(async () => {
    await AppDataSource.initialize();
    await AppDataSource.manager.insert(AccountEntity, [
      { accountSeq: 1, name: '첫 계좌', assetType: 1, accountType: 1 },
      { accountSeq: 2, name: '둘째 계좌', assetType: 1, accountType: 1 },
    ]);
    await AppDataSource.manager.insert(BalanceEntity, [
      { account: { accountSeq: 1 }, currency: Currency.KRW, amount: 2000 },
      { account: { accountSeq: 2 }, currency: Currency.KRW, amount: 3000 },
    ]);
  });
  afterEach(async () => AppDataSource.destroy());
  const form: ReqExchangeModel = {
    exchangeSeq: 0,
    kind: ExchangeKind.EXCHANGE_SELL,
    exchangeDate: new Date(2026, 0, 1),
    accountSeq: 1,
    note: '',
    sellCurrency: Currency.KRW,
    sellAmount: 1000,
    buyCurrency: Currency.USD,
    buyAmount: 1,
    fee: 10,
  };
  async function balance(accountSeq: number, currency: Currency) {
    return (await AppDataSource.manager.findOneBy(BalanceEntity, { account: { accountSeq }, currency }))?.amount ?? 0;
  }
  it('creates a missing currency balance and reverses all changes on deletion', async () => {
    await exchangeService.save(form);
    expect(await balance(1, Currency.KRW)).toBe(990);
    expect(await balance(1, Currency.USD)).toBe(1);
    const [saved] = await AppDataSource.manager.find(ExchangeEntity);
    await exchangeService.delete(saved.exchangeSeq);
    expect(await balance(1, Currency.KRW)).toBe(2000);
    expect(await balance(1, Currency.USD)).toBe(0);
  });
  it('persists an edited account so deleting the exchange restores the correct account', async () => {
    await exchangeService.save(form);
    const [saved] = await AppDataSource.manager.find(ExchangeEntity);
    await exchangeService.update({ ...form, exchangeSeq: saved.exchangeSeq, accountSeq: 2, buyCurrency: Currency.JPY, buyAmount: 100 });
    expect((await exchangeService.get(saved.exchangeSeq)).accountSeq).toBe(2);
    expect(await balance(1, Currency.KRW)).toBe(2000);
    expect(await balance(1, Currency.USD)).toBe(0);
    expect(await balance(2, Currency.KRW)).toBe(1990);
    expect(await balance(2, Currency.JPY)).toBe(100);
    await exchangeService.delete(saved.exchangeSeq);
    expect(await balance(1, Currency.KRW)).toBe(2000);
    expect(await balance(2, Currency.KRW)).toBe(3000);
    expect(await balance(2, Currency.JPY)).toBe(0);
  });
  it('rolls back reversal and update if the replacement account is missing', async () => {
    await exchangeService.save(form);
    const [saved] = await AppDataSource.manager.find(ExchangeEntity);
    await expect(exchangeService.update({ ...form, exchangeSeq: saved.exchangeSeq, accountSeq: 999 })).rejects.toThrow();
    expect(await balance(1, Currency.KRW)).toBe(990);
    expect(await balance(1, Currency.USD)).toBe(1);
    expect((await exchangeService.get(saved.exchangeSeq)).accountSeq).toBe(1);
  });
});
