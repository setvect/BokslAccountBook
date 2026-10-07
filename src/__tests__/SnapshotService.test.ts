import { Currency } from '../common/CommonType';
import { ReqSnapshotModel } from '../common/ReqModel';
import calculateSnapshotAssets from '../common/calculation/snapshotAssets';
import {
  AccountEntity,
  AssetGroupEntity,
  BalanceEntity,
  ExchangeRateEntity,
  SnapshotEntity,
  StockBuyEntity,
  StockEntity,
  StockEvaluateEntity,
} from '../main/entity/Entity';
import SnapshotService from '../main/service/SnapshotService';
import createTestDatabase from './support/testDatabase';

describe('atomic snapshot replacement', () => {
  let database: Awaited<ReturnType<typeof createTestDatabase>>;
  let form: ReqSnapshotModel;
  beforeEach(async () => {
    database = await createTestDatabase();
    const { manager } = database.dataSource;
    await manager.insert(AccountEntity, { accountSeq: 1, name: 'stock', accountType: 1, assetType: 1 });
    await manager.insert(BalanceEntity, { account: { accountSeq: 1 }, currency: Currency.USD, amount: 10.25 });
    await manager.insert(StockEntity, { stockSeq: 1, name: 'stock', currency: Currency.USD, nationCode: 1, stockTypeCode: 1 });
    await manager.insert(StockBuyEntity, { stockBuySeq: 1, account: { accountSeq: 1 }, stock: { stockSeq: 1 }, quantity: 0.3, buyAmount: 3 });
    form = {
      snapshotSeq: 0,
      note: 'original',
      exchangeRateList: [{ currency: Currency.USD, rate: 1300 }],
      stockEvaluateList: [{ stockBuySeq: 1, buyAmount: 3, evaluateAmount: 4 }],
    };
  });
  afterEach(async () => database.dispose());
  async function state() {
    return Promise.all(
      [SnapshotEntity, AssetGroupEntity, ExchangeRateEntity, StockEvaluateEntity].map((entity) => database.dataSource.manager.find(entity)),
    );
  }
  async function rejectEvaluation() {
    await database.dataSource.query(
      "CREATE TEMP TRIGGER reject_evaluation BEFORE INSERT ON ED_STOCK_EVALUATE BEGIN SELECT RAISE(ABORT, 'evaluation failed'); END",
    );
  }
  it('saves the same rounded cash and holding totals as the pure calculation', async () => {
    await SnapshotService.save(form, database.dataSource);
    const [group] = await database.dataSource.manager.find(AssetGroupEntity);
    expect(group).toMatchObject({ accountType: 1, totalAmount: 17225, evaluateAmount: 18525 });
    expect(
      calculateSnapshotAssets(
        [{ accountType: 1, balances: [{ currency: Currency.USD, amount: 10.25 }], holdings: [{ stockBuySeq: 1, currency: Currency.USD }] }],
        form.stockEvaluateList,
        form.exchangeRateList,
      ),
    ).toEqual([{ accountType: 1, totalAmount: 17225, evaluateAmount: 18525 }]);
  });
  it('restores all deleted children and the note when the last replacement fails', async () => {
    const snapshotSeq = await SnapshotService.save(form, database.dataSource);
    const before = await state();
    await rejectEvaluation();
    await expect(
      SnapshotService.update(
        { ...form, snapshotSeq, note: 'changed', exchangeRateList: [{ currency: Currency.USD, rate: 1500 }] },
        database.dataSource,
      ),
    ).rejects.toThrow('evaluation failed');
    expect(await state()).toEqual(before);
  });
  it('rolls back a new snapshot and intermediate children on failure', async () => {
    await rejectEvaluation();
    await expect(SnapshotService.save(form, database.dataSource)).rejects.toThrow('evaluation failed');
    expect(await state()).toEqual([[], [], [], []]);
  });
  it('replaces the children without retaining stale totals or duplicating rows', async () => {
    const snapshotSeq = await SnapshotService.save(form, database.dataSource);
    await SnapshotService.update({ ...form, snapshotSeq, note: 'changed', stockEvaluateList: [] }, database.dataSource);
    const [snapshot] = await database.dataSource.manager.find(SnapshotEntity);
    expect(snapshot.note).toBe('changed');
    expect(await database.dataSource.manager.find(AssetGroupEntity)).toEqual([
      expect.objectContaining({ totalAmount: 13325, evaluateAmount: 13325 }),
    ]);
    expect(await database.dataSource.manager.count(StockEvaluateEntity)).toBe(0);
    expect(await database.dataSource.manager.count(ExchangeRateEntity)).toBe(1);
  });
});
