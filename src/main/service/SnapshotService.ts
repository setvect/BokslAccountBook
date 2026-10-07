import { DataSource, EntityManager } from 'typeorm';
import calculateSnapshotAssets from '../../common/calculation/snapshotAssets';
import AppDataSource from '../config/AppDataSource';
import SnapshotRepository from '../repository/SnapshotRepository';
import { ReqSearchModel, ReqSnapshotModel } from '../../common/ReqModel';
import {
  AccountEntity,
  AssetGroupEntity,
  BalanceEntity,
  ExchangeRateEntity,
  SnapshotEntity,
  StockBuyEntity,
  StockEvaluateEntity,
} from '../entity/Entity';
import { ResAssetGroupModel, ResPageModel, ResSnapshotModel, ResStockEvaluateModel, ResTradeModel } from '../../common/ResModel';
import { AccountType, ExchangeRateModel } from '../../common/CommonType';
import tradeService from './TradeService';

const PAGE_SIZE = 25;

export default class SnapshotService {
  private static snapshotRepository = new SnapshotRepository(AppDataSource);

  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // empty
  }

  private static async mapEntityToRes(snapshot: SnapshotEntity): Promise<ResSnapshotModel> {
    const exchangeRateEntities = await snapshot.exchangeRateList;
    const exchangeRateList: ExchangeRateModel[] = exchangeRateEntities.map((exchangeRate) => {
      return {
        currency: exchangeRate.currency,
        rate: exchangeRate.rate,
      };
    });

    const assetGroupEntities = await snapshot.assetGroupList;
    const assetGroupList: ResAssetGroupModel[] = assetGroupEntities.map((assetGroup) => {
      return {
        assetGroupSeq: assetGroup.assetGroupSeq,
        accountType: assetGroup.accountType,
        totalAmount: assetGroup.totalAmount,
        evaluateAmount: assetGroup.evaluateAmount,
      };
    });

    const stockEvaluateEntities = await snapshot.stockEvaluateList;
    const stockEvaluateList: ResStockEvaluateModel[] = stockEvaluateEntities.map((stockEvaluate) => {
      return {
        stockBuySeq: stockEvaluate.stockBuySeq,
        buyAmount: stockEvaluate.buyAmount,
        evaluateAmount: stockEvaluate.evaluateAmount,
      };
    });

    let tradeList: ResTradeModel[] = [];
    if (snapshot.stockSellCheckDate) {
      // 주식 매도 체크일 이후의 매도 내역 조회
      const searchCondition: ReqSearchModel = {
        from: snapshot.stockSellCheckDate,
        to: snapshot.regDate,
        checkType: new Set([AccountType.SELL]),
      };
      tradeList = await tradeService.findList(searchCondition);
    }

    return {
      snapshotSeq: snapshot.snapshotSeq,
      note: snapshot.note,
      stockSellCheckDate: snapshot.stockSellCheckDate,
      regDate: snapshot.regDate,
      deleteF: snapshot.deleteF,
      exchangeRateList,
      assetGroupList,
      stockEvaluateList,
      tradeList,
    };
  }

  static async get(snapshotSeq: number) {
    const snapshot = await this.snapshotRepository.repository.findOne({ where: { snapshotSeq } });
    if (!snapshot) {
      throw new Error('스냅샷 정보를 찾을 수 없습니다.');
    }
    return this.mapEntityToRes(snapshot);
  }

  /**
   * @param page 1부터 시작
   */
  static async findPage(page: number): Promise<ResPageModel<ResSnapshotModel>> {
    const [snapshotList, total] = await this.snapshotRepository.repository.findAndCount({
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      where: {
        deleteF: false,
      },
      order: {
        snapshotSeq: 'DESC',
      },
    });
    const resList = await Promise.all(snapshotList.map((snapshot) => this.mapEntityToRes(snapshot)));
    return {
      list: resList,
      pagePerSize: PAGE_SIZE,
      total,
    };
  }

  static async save(snapshot: ReqSnapshotModel, dataSource: DataSource = AppDataSource) {
    let snapshotEntity: SnapshotEntity | undefined;
    await dataSource.transaction(async (transactionalEntityManager) => {
      // 1. 스냅샷 저장
      snapshotEntity = await this.saveEntity(transactionalEntityManager, snapshot);

      // 2. 환율 저장
      await this.saveExchangeRates(transactionalEntityManager, snapshot, snapshotEntity);

      // 3. 계좌 평가 금액 저장
      await this.saveAssetGroups(transactionalEntityManager, snapshot, snapshotEntity);

      // 4. 주식 평가 금액 저장
      await this.saveStockEvaluates(transactionalEntityManager, snapshot.stockEvaluateList, snapshotEntity);
    });
    if (snapshotEntity === undefined) {
      throw new Error('스냅샷 정보를 찾을 수 없습니다.');
    }

    return snapshotEntity.snapshotSeq;
  }

  static async update(snapshot: ReqSnapshotModel, dataSource: DataSource = AppDataSource) {
    const { snapshotSeq } = snapshot;
    await dataSource.transaction(async (transactionalEntityManager) => {
      const snapshotEntity = await transactionalEntityManager.findOneBy(SnapshotEntity, { snapshotSeq });
      if (!snapshotEntity) throw new Error('스냅샷 정보를 찾을 수 없습니다.');

      // 1. 스냅샷 저장
      await this.updateEntity(transactionalEntityManager, snapshot, snapshotEntity);

      await transactionalEntityManager.delete(ExchangeRateEntity, { snapshot: { snapshotSeq } });
      await transactionalEntityManager.delete(AssetGroupEntity, { snapshot: { snapshotSeq } });
      await transactionalEntityManager.delete(StockEvaluateEntity, { snapshot: { snapshotSeq } });

      // 2. 환율 저장
      await this.saveExchangeRates(transactionalEntityManager, snapshot, snapshotEntity);

      // 3. 계좌 평가 금액 저장
      await this.saveAssetGroups(transactionalEntityManager, snapshot, snapshotEntity);

      // 4. 주식 평가 금액 저장
      await this.saveStockEvaluates(transactionalEntityManager, snapshot.stockEvaluateList, snapshotEntity);
    });

    return snapshotSeq;
  }

  static async delete(snapshotSeq: number) {
    const snapshotEntity = await this.snapshotRepository.repository.findOne({ where: { snapshotSeq } });
    if (!snapshotEntity) {
      throw new Error('스냅샷 정보를 찾을 수 없습니다.');
    }

    snapshotEntity.deleteF = true;
    await this.snapshotRepository.repository.save(snapshotEntity);
  }

  /**
   * 스냅샷 저장
   */
  private static async saveEntity(transactionalEntityManager: EntityManager, snapshot: ReqSnapshotModel) {
    const snapshotEntity = transactionalEntityManager.create(SnapshotEntity, {
      note: snapshot.note,
      stockSellCheckDate: snapshot.stockSellCheckDate,
      regDate: new Date(),
    });
    await transactionalEntityManager.save(snapshotEntity);
    return snapshotEntity;
  }

  private static async updateEntity(transactionalEntityManager: EntityManager, snapshot: ReqSnapshotModel, snapshotEntity: SnapshotEntity) {
    snapshotEntity.note = snapshot.note;
    snapshotEntity.stockSellCheckDate = snapshot.stockSellCheckDate;
    await transactionalEntityManager.save(snapshotEntity);
  }

  /**
   * 계좌 평가 금액 저장
   */
  private static async saveAssetGroups(transactionalEntityManager: EntityManager, snapshot: ReqSnapshotModel, snapshotEntity: SnapshotEntity) {
    const [accounts, balances, holdings] = await Promise.all([
      transactionalEntityManager.find(AccountEntity, { where: { deleteF: false }, order: { accountSeq: 'ASC' } }),
      transactionalEntityManager.find(BalanceEntity),
      transactionalEntityManager.find(StockBuyEntity),
    ]);
    const inputs = accounts.map((account) => ({
      accountType: account.accountType,
      balances: balances.filter((balance) => balance.account.accountSeq === account.accountSeq),
      holdings: holdings
        .filter((holding) => holding.account.accountSeq === account.accountSeq)
        .map((holding) => ({ stockBuySeq: holding.stockBuySeq, currency: holding.stock.currency })),
    }));
    const groups = calculateSnapshotAssets(inputs, snapshot.stockEvaluateList, snapshot.exchangeRateList);
    await transactionalEntityManager.save(
      groups.map((group) =>
        transactionalEntityManager.create(AssetGroupEntity, {
          ...group,
          snapshot: snapshotEntity,
        }),
      ),
    );
  }

  /**
   * 환율 저장
   */
  private static async saveExchangeRates(transactionalEntityManager: EntityManager, snapshot: ReqSnapshotModel, snapshotEntity: SnapshotEntity) {
    const exchangeRateEntityList = snapshot.exchangeRateList.map((exchangeRate) => {
      return transactionalEntityManager.create(ExchangeRateEntity, {
        snapshot: snapshotEntity,
        currency: exchangeRate.currency,
        rate: exchangeRate.rate,
      });
    });
    await transactionalEntityManager.save(exchangeRateEntityList);
  }

  /**
   * 주식 평가 금액 저장
   */
  private static async saveStockEvaluates(
    transactionalEntityManager: EntityManager,
    snapshot: ResStockEvaluateModel[],
    snapshotEntity: SnapshotEntity,
  ) {
    const stockEvaluateEntityList = snapshot.map((stockEvaluate) => {
      return transactionalEntityManager.create(StockEvaluateEntity, {
        snapshot: snapshotEntity,
        stockBuySeq: stockEvaluate.stockBuySeq,
        buyAmount: stockEvaluate.buyAmount,
        evaluateAmount: stockEvaluate.evaluateAmount,
      });
    });
    await transactionalEntityManager.save(stockEvaluateEntityList);
  }
}
