import _ from 'lodash';
import { EntityManager } from 'typeorm';
import AppDataSource from '../config/AppDataSource';
import SnapshotRepository from '../repository/SnapshotRepository';
import ExchangeRateRepository from '../repository/ExchangeRateRepository';
import AssetGroupRepository from '../repository/AssetGroupRepository';
import StockEvaluateRepository from '../repository/StockEvaluateRepository';
import { ReqSearchModel, SnapshotForm } from '../../common/ReqModel';
import { AssetGroupEntity, ExchangeRateEntity, SnapshotEntity, StockEvaluateEntity } from '../entity/Entity';
import { ResAssetGroupModel, ResPageModel, ResSnapshotModel, ResStockEvaluateModel, ResTradeModel } from '../../common/ResModel';
import { Currency, ExchangeRateModel } from '../../common/CommonType';
import TradeService from './TradeService';
import { AccountType, StockEvaluateModel } from '../../renderer/common/RendererModel';
import AccountService from './AccountService';
import StockBuyService from './StockBuyService';
import StockService from './StockService';

const PAGE_SIZE = 20;

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
      tradeList = await TradeService.findTradeList(searchCondition);
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

  static async getSnapshot(snapshotSeq: number) {
    const snapshot = await this.snapshotRepository.repository.findOne({ where: { snapshotSeq } });
    if (!snapshot) {
      throw new Error('스냅샷 정보를 찾을 수 없습니다.');
    }
    return this.mapEntityToRes(snapshot);
  }

  /**
   * @param page 1부터 시작
   */
  static async findSnapshotPage(page: number) {
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
      total,
    } as ResPageModel<ResSnapshotModel>;
  }

  static async saveSnapshot(snapshot: SnapshotForm) {
    let snapshotEntity: SnapshotEntity | undefined;
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      // 1. 스냅샷 저장
      snapshotEntity = await this.saveSnapshotEntity(transactionalEntityManager, snapshot);

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

  static async updateSnapshot(snapshot: SnapshotForm) {
    const { snapshotSeq } = snapshot;
    const snapshotEntity = await this.snapshotRepository.repository.findOne({ where: { snapshotSeq } });
    if (!snapshotEntity) {
      throw new Error('스냅샷 정보를 찾을 수 없습니다.');
    }

    await AppDataSource.transaction(async (transactionalEntityManager) => {
      // 1. 스냅샷 저장
      await this.updateSnapshotEntity(transactionalEntityManager, snapshot, snapshotEntity);

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

  static async deleteSnapshot(snapshotSeq: number) {
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
  private static async saveSnapshotEntity(transactionalEntityManager: EntityManager, snapshot: SnapshotForm) {
    const snapshotEntity = transactionalEntityManager.create(SnapshotEntity, {
      note: snapshot.note,
      stockSellCheckDate: snapshot.stockSellCheckDate,
      regDate: new Date(),
    });
    await transactionalEntityManager.save(snapshotEntity);
    return snapshotEntity;
  }

  private static async updateSnapshotEntity(transactionalEntityManager: EntityManager, snapshot: SnapshotForm, snapshotEntity: SnapshotEntity) {
    snapshotEntity.note = snapshot.note;
    snapshotEntity.stockSellCheckDate = snapshot.stockSellCheckDate;
    await transactionalEntityManager.save(snapshotEntity);
  }

  /**
   * 계좌 평가 금액 저장
   */
  private static async saveAssetGroups(transactionalEntityManager: EntityManager, snapshot: SnapshotForm, snapshotEntity: SnapshotEntity) {
    const accountList = (await AccountService.findAccountAll()).filter((account) => account.enableF);
    const exchangeRateMap = new Map<Currency, ExchangeRateModel>(
      snapshot.exchangeRateList.map((exchangeRate) => [exchangeRate.currency, exchangeRate]),
    );
    const accountGroupList = _(accountList)
      .groupBy((account) => account.accountType)
      .map(async (accountGroupList, accountType) => {
        const balancePromises = accountGroupList.map(async (account) => {
          const balanceTotal = await AccountService.getAccountBalanceKrwTotal(account.accountSeq, exchangeRateMap);
          const totalBuyAmountKrw = await SnapshotService.getBuyAmountKrwSum(snapshot.stockEvaluateList, account.accountSeq, exchangeRateMap);
          const totalEvaluateAmountKrw = await SnapshotService.getEvaluateAmountKrwSum(
            snapshot.stockEvaluateList,
            account.accountSeq,
            exchangeRateMap,
          );

          console.log('balanceTotal', balanceTotal);
          console.log('totalBuyAmountKrw', totalBuyAmountKrw);
          console.log('totalEvaluateAmountKrw', totalEvaluateAmountKrw);

          return {
            balanceTotal,
            totalBuyAmountKrw,
            totalEvaluateAmountKrw,
          };
        });

        const balances = await Promise.all(balancePromises);

        const { totalAmount, evaluateAmount } = balances.reduce(
          (acc, { balanceTotal, totalBuyAmountKrw, totalEvaluateAmountKrw }) => {
            acc.totalAmount += balanceTotal + totalBuyAmountKrw;
            acc.evaluateAmount += balanceTotal + totalEvaluateAmountKrw;
            return acc;
          },
          { totalAmount: 0, evaluateAmount: 0 },
        );

        return transactionalEntityManager.create(AssetGroupEntity, {
          snapshot: snapshotEntity,
          accountType: Number(accountType),
          totalAmount,
          evaluateAmount,
        });
      })
      .value();
    const assetGroupList = await Promise.all(accountGroupList);
    await transactionalEntityManager.save(assetGroupList);
  }

  /**
   * 환율 저장
   */
  private static async saveExchangeRates(transactionalEntityManager: EntityManager, snapshot: SnapshotForm, snapshotEntity: SnapshotEntity) {
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
  private static async saveStockEvaluates(transactionalEntityManager: EntityManager, snapshot: StockEvaluateModel[], snapshotEntity: SnapshotEntity) {
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

  private static async getBuyAmountKrwSum(
    stockEvaluate: StockEvaluateModel[],
    accountSeq: number,
    exchangeRateMap: Map<Currency, ExchangeRateModel>,
  ) {
    return this.getStockBuyKrwSum(stockEvaluate, accountSeq, exchangeRateMap, (stockEvaluate) => stockEvaluate.buyAmount);
  }

  // 주식 평가금액을 원화로 계산해 합산

  private static async getEvaluateAmountKrwSum(
    stockEvaluate: StockEvaluateModel[],
    accountSeq: number,
    exchangeRateMap: Map<Currency, ExchangeRateModel>,
  ) {
    return this.getStockBuyKrwSum(stockEvaluate, accountSeq, exchangeRateMap, (stockEvaluate) => stockEvaluate.evaluateAmount);
  }

  private static async getStockBuyKrwSum(
    stockEvaluate: StockEvaluateModel[],
    accountSeq: number,
    exchangeRateMap: Map<Currency, ExchangeRateModel>,
    targetValue: (stockEvaluateModel: StockEvaluateModel) => number,
  ) {
    const evaluateAmounts = stockEvaluate.map(async (stockEvaluate) => {
      // todo 호출 할 때마다 DB를 조회 하기 때문에 불필요한 연산이 들어감
      const stockBuy = await StockBuyService.getStockBuy(stockEvaluate.stockBuySeq);
      if (!stockBuy || stockBuy.accountSeq !== accountSeq) {
        return 0;
      }

      const stock = await StockService.getStock(stockBuy.stockSeq);
      const exchangeRate = exchangeRateMap.get(stock.currency)?.rate || 1;
      return targetValue(stockEvaluate) * exchangeRate;
    });
    const results = await Promise.all(evaluateAmounts);
    return results.reduce((sum, value) => sum + value, 0);
  }
}
