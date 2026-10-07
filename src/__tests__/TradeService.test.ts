import initializeDatabase from '../main/config/initializeDatabase';
import { Currency, TradeKind } from '../common/CommonType';
import { ReqTradeModel } from '../common/ReqModel';
import { AccountEntity, BalanceEntity, StockEntity, StockBuyEntity, TradeEntity } from '../main/entity/Entity';
import StockBuyService from '../main/service/StockBuyService';
import tradeService from '../main/service/TradeService';
import AppDataSource from '../main/config/AppDataSource';

jest.mock('electron-log', () => ({ info: jest.fn(), error: jest.fn() }));

describe('trade balance and cost contract', () => {
  beforeEach(async () => {
    await initializeDatabase(AppDataSource);
    await AppDataSource.manager.insert(AccountEntity, [
      { accountSeq: 1, name: '첫 계좌', assetType: 1, accountType: 1 },
      { accountSeq: 2, name: '둘째 계좌', assetType: 1, accountType: 1 },
    ]);
    await AppDataSource.manager.insert(StockEntity, [
      { stockSeq: 1, name: '원화 종목', currency: Currency.KRW, stockTypeCode: 1, nationCode: 1 },
      { stockSeq: 2, name: '달러 종목', currency: Currency.USD, stockTypeCode: 1, nationCode: 1 },
    ]);
    await AppDataSource.manager.insert(BalanceEntity, { account: { accountSeq: 1 }, currency: Currency.KRW, amount: 2000 });
  });
  afterEach(async () => AppDataSource.destroy());

  const form = (kind: TradeKind, quantity = 3, price = 10.001): ReqTradeModel => ({
    tradeSeq: 0,
    kind,
    quantity,
    price,
    stockSeq: 1,
    accountSeq: 1,
    tax: 0.2,
    fee: 0.1,
    tradeDate: new Date(2026, 0, 1),
    note: '',
  });
  async function holding(accountSeq = 1, stockSeq = 1) {
    return AppDataSource.manager.findOneByOrFail(StockBuyEntity, { account: { accountSeq }, stock: { stockSeq } });
  }
  async function trades() {
    return AppDataSource.manager.find(TradeEntity, { order: { tradeSeq: 'ASC' } });
  }
  async function balance(accountSeq = 1, currency = Currency.KRW) {
    return (await AppDataSource.manager.findOneBy(BalanceEntity, { account: { accountSeq }, currency }))?.amount ?? 0;
  }

  it('uses unrounded cost for a partial sale and restores it when the sale is deleted', async () => {
    await tradeService.save(form(TradeKind.BUY));
    await tradeService.save(form(TradeKind.SELL, 1, 12));
    const [, sell] = await trades();
    expect(sell.sellGains).toBeCloseTo(1.999, 10);
    expect((await holding()).buyAmount).toBeCloseTo(20.002, 10);
    await tradeService.delete(sell.tradeSeq);
    expect((await holding()).quantity).toBe(3);
    expect((await holding()).buyAmount).toBeCloseTo(30.003, 10);
    const [buy] = await trades();
    await tradeService.delete(buy.tradeSeq);
    expect((await holding()).quantity).toBe(0);
    expect((await holding()).buyAmount).toBeCloseTo(0, 10);
    expect(await balance()).toBeCloseTo(2000, 10);
  });

  it('calculates gains using the new kind when a buy is changed to a sale', async () => {
    await tradeService.save(form(TradeKind.BUY, 10, 5));
    await tradeService.save(form(TradeKind.BUY));
    const [, changed] = await trades();
    await tradeService.update({ ...form(TradeKind.SELL, 2, 8), tradeSeq: changed.tradeSeq });
    expect((await trades())[1].sellGains).toBeCloseTo(6, 10);
    expect((await holding()).quantity).toBe(8);
    expect((await holding()).buyAmount).toBeCloseTo(40, 10);
    await tradeService.delete(changed.tradeSeq);
    expect((await holding()).quantity).toBe(10);
    expect((await holding()).buyAmount).toBeCloseTo(50, 10);
  });

  it('moves a buy to another account and currency and reverses the moved effect on deletion', async () => {
    await tradeService.save(form(TradeKind.BUY));
    const [saved] = await trades();
    await tradeService.update({ ...form(TradeKind.BUY, 2, 15), tradeSeq: saved.tradeSeq, accountSeq: 2, stockSeq: 2 });
    expect(await balance()).toBeCloseTo(2000, 10);
    expect((await holding()).quantity).toBe(0);
    expect((await holding(2, 2)).quantity).toBe(2);
    expect(await balance(2, Currency.USD)).toBeCloseTo(-30.3, 10);
    await tradeService.delete(saved.tradeSeq);
    expect((await holding(2, 2)).quantity).toBe(0);
    expect(await balance(2, Currency.USD)).toBeCloseTo(0, 10);
  });

  it('rolls back every effect when a sale exceeds the available quantity', async () => {
    await tradeService.save(form(TradeKind.BUY));
    const before = await balance();
    await expect(tradeService.save(form(TradeKind.SELL, 4))).rejects.toThrow('매도 수량');
    expect(await balance()).toBe(before);
    expect((await holding()).quantity).toBe(3);
    expect(await AppDataSource.manager.count(TradeEntity)).toBe(1);
  });

  it('does not allow deletion of a buy that would make the current holding negative', async () => {
    await tradeService.save(form(TradeKind.BUY));
    await tradeService.save(form(TradeKind.SELL, 1));
    const [buy] = await trades();
    const before = await balance();
    await expect(tradeService.delete(buy.tradeSeq)).rejects.toThrow('보유 수량');
    expect(await balance()).toBe(before);
    expect((await holding()).quantity).toBe(2);
    expect(await AppDataSource.manager.count(TradeEntity)).toBe(2);
  });

  it('rolls back a newly created holding when trade insertion fails', async () => {
    await AppDataSource.query("CREATE TEMP TRIGGER reject_trade BEFORE INSERT ON CC_TRADE BEGIN SELECT RAISE(ABORT, 'trade failure'); END");
    await expect(tradeService.save(form(TradeKind.BUY))).rejects.toThrow('trade failure');
    expect(await AppDataSource.manager.count(StockBuyEntity)).toBe(0);
    expect(await AppDataSource.manager.count(TradeEntity)).toBe(0);
    expect(await balance()).toBe(2000);
  });
  it('rejects fractional shares without changing balances or holdings', async () => {
    await expect(tradeService.save(form(TradeKind.BUY, 0.3, 100))).rejects.toThrow('정수');
    expect(await AppDataSource.manager.count(StockBuyEntity)).toBe(0);
    expect(await AppDataSource.manager.count(TradeEntity)).toBe(0);
    expect(await balance()).toBe(2000);
  });

  it('rejects fractional quantities in direct holding creation and updates', async () => {
    const input = { stockBuySeq: 0, stockSeq: 1, accountSeq: 1, quantity: 1.5, buyAmount: 15 };
    await expect(StockBuyService.saveStockBuy(input)).rejects.toThrow('정수');
    expect(await AppDataSource.manager.count(StockBuyEntity)).toBe(0);
    const saved = await StockBuyService.saveStockBuy({ ...input, quantity: 1 });
    await expect(StockBuyService.updateStockBuy({ ...input, stockBuySeq: saved.stockBuySeq })).rejects.toThrow('정수');
    expect((await holding()).quantity).toBe(1);
  });

  it('sells integer shares completely without leaving cost or quantity', async () => {
    await tradeService.save(form(TradeKind.BUY, 3, 10));
    await tradeService.save(form(TradeKind.SELL, 1, 12));
    await tradeService.save(form(TradeKind.SELL, 2, 12));
    expect((await holding()).quantity).toBe(0);
    expect((await holding()).buyAmount).toBe(0);
  });

  it('allows a buy edit with a temporary negative reversal if the final holding stays valid', async () => {
    await tradeService.save(form(TradeKind.BUY, 10, 5));
    await tradeService.save(form(TradeKind.SELL, 8, 8));
    const [buy] = await trades();
    await tradeService.update({ ...form(TradeKind.BUY, 12, 5), tradeSeq: buy.tradeSeq });
    expect((await holding()).quantity).toBe(4);
    expect((await holding()).buyAmount).toBeCloseTo(20, 10);
  });

  it('resets realized gains when a sale is changed to a buy', async () => {
    await tradeService.save(form(TradeKind.BUY, 10, 5));
    await tradeService.save(form(TradeKind.SELL, 2, 8));
    const [, sale] = await trades();
    await tradeService.update({ ...form(TradeKind.BUY, 2, 8), tradeSeq: sale.tradeSeq });
    expect((await trades())[1].sellGains).toBe(0);
    expect((await holding()).quantity).toBe(12);
    expect((await holding()).buyAmount).toBeCloseTo(66, 10);
  });
});
