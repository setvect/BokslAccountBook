import _ from 'lodash';
import { EntityManager } from 'typeorm';
import AppDataSource from '../config/AppDataSource';
import SnapshotRepository from '../repository/SnapshotRepository';
import ExchangeRateRepository from '../repository/ExchangeRateRepository';
import AssetGroupRepository from '../repository/AssetGroupRepository';
import StockEvaluateRepository from '../repository/StockEvaluateRepository';
import { ReqSearchModel, ReqSnapshotModel } from '../../common/ReqModel';
import { AccountEntity, AssetGroupEntity, ExchangeRateEntity, SnapshotEntity, StockEvaluateEntity } from '../entity/Entity';
import { ResAssetGroupModel, ResPageModel, ResSnapshotModel, ResStockEvaluateModel, ResStockModel, ResTradeModel } from '../../common/ResModel';
import { Currency, ExchangeRateModel } from '../../common/CommonType';
import TradeService from './TradeService';
import { AccountType } from '../../renderer/common/RendererModel';
import StockService from './StockService';

const PAGE_SIZE = 10;

export default class SnapshotService {
  private static snapshotRepository = new SnapshotRepository(AppDataSource);

  private static exchangeRateRepository = new ExchangeRateRepository(AppDataSource);

  private static assetGroupRepository = new AssetGroupRepository(AppDataSource);

  private static stockEvaluateRepository = new StockEvaluateRepository(AppDataSource);

  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // empty
  }

  private static async mapEntityToRes(snapshot: SnapshotEntity) {
    const exchangeRateEntities = await snapshot.exchangeRateList;
    const exchangeRateList = exchangeRateEntities.map((exchangeRate) => {
      return {
        currency: exchangeRate.currency,
        rate: exchangeRate.rate,
      } as ExchangeRateModel;
    });

    const assetGroupEntities = await snapshot.assetGroupList;
    const assetGroupList = assetGroupEntities.map((assetGroup) => {
      return {
        assetGroupSeq: assetGroup.assetGroupSeq,
        accountType: assetGroup.accountType,
        currency: assetGroup.currency,
        totalAmount: assetGroup.totalAmount,
        evaluateAmount: assetGroup.evaluateAmount,
      } as ResAssetGroupModel;
    });

    const stockEvaluateEntities = await snapshot.stockEvaluateList;
    const stockEvaluateList = stockEvaluateEntities.map((stockEvaluate) => {
      return {
        stockBuySeq: stockEvaluate.stockBuySeq,
        buyAmount: stockEvaluate.buyAmount,
        evaluateAmount: stockEvaluate.evaluateAmount,
      } as ResStockEvaluateModel;
    });

    let tradeList: ResTradeModel[] = [];
    if (snapshot.stockSellCheckDate) {
      // 주식 매도 체크일 이후의 매도 내역 조회
      const searchCondition = {
        from: snapshot.stockSellCheckDate,
        to: snapshot.regDate,
        checkType: new Set([AccountType.SELL]),
      } as ReqSearchModel;
      tradeList = await TradeService.findList(searchCondition);
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
    } as ResSnapshotModel;
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
  static async findPage(page: number) {
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
    } as ResPageModel<ResSnapshotModel>;
  }

  static async save(snapshot: ReqSnapshotModel) {
    let snapshotEntity: SnapshotEntity | undefined;
    await AppDataSource.transaction(async (transactionalEntityManager) => {
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

  static async update(snapshot: ReqSnapshotModel) {
    const { snapshotSeq } = snapshot;
    const snapshotEntity = await this.snapshotRepository.repository.findOne({ where: { snapshotSeq } });
    if (!snapshotEntity) {
      throw new Error('스냅샷 정보를 찾을 수 없습니다.');
    }

    await AppDataSource.transaction(async (transactionalEntityManager) => {
      // 1. 스냅샷 저장
      await this.updateEntity(transactionalEntityManager, snapshot, snapshotEntity);

      await this.exchangeRateRepository.repository.delete({ snapshot: { snapshotSeq } });
      await this.assetGroupRepository.repository.delete({ snapshot: { snapshotSeq } });
      await this.stockEvaluateRepository.repository.delete({ snapshot: { snapshotSeq } });

      // 2. 환율 저장
      await this.saveExchangeRates(transactionalEntityManager, snapshot, snapshotEntity);

      // 3. 계좌 평가 금액 저장
      await this.saveAssetGroups(transactionalEntityManager, snapshot, snapshotEntity);

      // 4. 주식 평가 금액 저장
      await this.saveStockEvaluates(transactionalEntityManager, snapshot.stockEvaluateList, snapshotEntity);
    });

    return snapshotEntity.snapshotSeq;
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
    const accountList = await transactionalEntityManager.find(AccountEntity, {
      where: { deleteF: false },
      order: { accountSeq: 'ASC' },
    });

    const stockList = await StockService.findAll();
    const stockMap = new Map<number, ResStockModel>(stockList.map((stock) => [stock.stockSeq, stock]));

    const accountGroupList: Promise<AssetGroupEntity[]>[] = _(accountList)
      .groupBy((account) => account.accountType)
      .map(async (accountGroupList, accountType) => {
        const balancePromises = accountGroupList.map(async (account) => {
          const balanceSumByCurrency = await SnapshotService.getAccountBalanceSumByCurrency(account);
          const buySumByCurrency = await SnapshotService.getBuyAmountSumByCurrency(snapshot.stockEvaluateList, stockMap, account);
          const evaluateSumByCurrency = await SnapshotService.getEvaluateAmountKrwSum(snapshot.stockEvaluateList, stockMap, account);

          return {
            balanceSumByCurrency,
            buySumByCurrency,
            evaluateSumByCurrency,
          };
        });

        const balances: Awaited<{
          buySumByCurrency: Map<Currency, number>;
          evaluateSumByCurrency: Map<Currency, number>;
          balanceSumByCurrency: Map<Currency, number>;
        }>[] = await Promise.all(balancePromises);

        const assetGroupEntities = _(Object.entries(Currency))
          .map(([key, currency]) => {
            const balanceSum = _(balances).sumBy((balance) => balance.balanceSumByCurrency.get(currency) || 0);
            const buySum = _(balances).sumBy((balance) => balance.buySumByCurrency.get(currency) || 0);
            const evaluateSum = _(balances).sumBy((balance) => balance.evaluateSumByCurrency.get(currency) || 0);

            return transactionalEntityManager.create(AssetGroupEntity, {
              snapshot: snapshotEntity,
              accountType: Number(accountType),
              currency,
              totalAmount: balanceSum + buySum,
              evaluateAmount: balanceSum + evaluateSum,
            });
          })
          .value();

        return assetGroupEntities;
      })
      .value();
    const assetGroupListTemp = await Promise.all(accountGroupList);
    const assetGroupList = _(assetGroupListTemp).flatten().value();
    await transactionalEntityManager.save(assetGroupList);
  }

  /**
   * 통화 단위로 잔고 합게
   */
  private static async getAccountBalanceSumByCurrency(account: AccountEntity) {
    const balanceList = await account.balanceList;
    const balanceByMap = new Map<Currency, number>();

    _(balanceList)
      .groupBy((balance) => balance.currency)
      .forEach((balanceList, currency) => {
        balanceByMap.set(
          currency as Currency,
          _(balanceList).sumBy((a) => a.amount),
        );
      });

    return balanceByMap;
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

  // 주식 매수금액을 원화로 계산해 합산
  private static async getBuyAmountSumByCurrency(
    stockEvaluateList: ResStockEvaluateModel[],
    stockMap: Map<number, ResStockModel>,
    account: AccountEntity,
  ) {
    const targetValue = (stockEvaluate: ResStockEvaluateModel) => stockEvaluate.buyAmount;
    return this.getStockBuyKrwSum(account, stockEvaluateList, stockMap, targetValue);
  }

  // 주식 평가금액을 원화로 계산해 합산

  private static async getEvaluateAmountKrwSum(
    stockEvaluateList: ResStockEvaluateModel[],
    stockMap: Map<number, ResStockModel>,
    account: AccountEntity,
  ) {
    const targetValue = (stockEvaluate: ResStockEvaluateModel) => stockEvaluate.evaluateAmount;
    return this.getStockBuyKrwSum(account, stockEvaluateList, stockMap, targetValue);
  }

  private static async getStockBuyKrwSum(
    account: AccountEntity,
    stockEvaluateList: ResStockEvaluateModel[],
    stockMap: Map<number, ResStockModel>,
    targetValue: (stockEvaluate: ResStockEvaluateModel) => number,
  ) {
    const balanceByMap = new Map<Currency, number>();
    const stockBuyEntityList = await account.stockBuyList;
    const stockBuySeqList = stockBuyEntityList.map((stockBuy) => stockBuy.stockBuySeq);

    _(stockEvaluateList)
      .filter((stockEvaluate) => stockBuySeqList.includes(stockEvaluate.stockBuySeq))
      .map((stockEvaluate) => {
        const stockBuy = stockBuyEntityList.find((stockBuy) => stockBuy.stockBuySeq === stockEvaluate.stockBuySeq);
        return {
          stockEvaluate: stockEvaluate!,
          stockBuy: stockBuy!,
        };
      })
      .groupBy((stockInfo) => {
        const stock = stockMap.get(stockInfo.stockBuy.stock.stockSeq);
        return stock!.currency;
      })
      .forEach((stockInfoList, currency) => {
        const amountSum = _(stockInfoList).sumBy((stockInfo) => targetValue(stockInfo.stockEvaluate));
        balanceByMap.set(currency as Currency, amountSum);
      });

    return balanceByMap;
  }
}
