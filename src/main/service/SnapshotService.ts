import AppDataSource from '../config/AppDataSource';
import SnapshotRepository from '../repository/SnapshotRepository';
import ExchangeRateRepository from '../repository/ExchangeRateRepository';
import AssetGroupRepository from '../repository/AssetGroupRepository';
import StockEvaluateRepository from '../repository/StockEvaluateRepository';
import { SnapshotForm, ReqSearchModel } from '../../common/ReqModel';
import { SnapshotEntity } from '../entity/Entity';
import { ResAssetGroupModel, ResPageModel, ResSnapshotModel, ResStockEvaluateModel, ResTradeModel } from '../../common/ResModel';
import { Currency, ExchangeRateModel } from '../../common/CommonType';
import TradeService from './TradeService';
import { AccountType, StockEvaluateModel } from '../../renderer/common/RendererModel';
import AccountService from './AccountService';
import _ from 'lodash';
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
      let searchCondition = {
        from: snapshot.stockSellCheckDate,
        to: snapshot.regDate,
        checkType: new Set(AccountType.SELL),
      } as ReqSearchModel;
      tradeList = await TradeService.findTradeList(searchCondition);
    }

    return {
      snapshotSeq: snapshot.snapshotSeq,
      note: snapshot.note,
      stockSellCheckDate: snapshot.stockSellCheckDate,
      regDate: snapshot.regDate,
      deleteF: snapshot.deleteF,
      exchangeRateList: exchangeRateList,
      assetGroupList: assetGroupList,
      stockEvaluateList: stockEvaluateList,
      tradeList,
    } as ResSnapshotModel;
  }

  static async getSnapshot(snapshotSeq: number) {
    const snapshot = await this.snapshotRepository.repository.findOne({ where: { snapshotSeq } });
    if (!snapshot) {
      throw new Error('스냅샷 정보를 찾을 수 없습니다.');
    }
    return await this.mapEntityToRes(snapshot);
  }

  static async findSnapshotPage(page: number) {
    const [snapshotList, total] = await this.snapshotRepository.repository.findAndCount({
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
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
    // 1. 스냅샷 저장
    const snapshotEntity = await this.saveSnapshotEntity(snapshot);

    // 2. 환율 저장
    await this.saveExchangeRates(snapshot, snapshotEntity);

    // 3. 계좌 평가 금액 저장
    await this.saveAssetGroups(snapshot, snapshotEntity);

    // 4. 주식 평가 금액 저장
    await this.saveStockEvaluates(snapshot.stockEvaluate, snapshotEntity);

    return snapshotEntity.snapshotSeq;
  }

  static async updateSnapshot(snapshot: SnapshotForm) {
    let snapshotSeq = snapshot.assetSnapshotSeq;
    const snapshotEntity = await this.snapshotRepository.repository.findOne({ where: { snapshotSeq } });
    if (!snapshotEntity) {
      throw new Error('스냅샷 정보를 찾을 수 없습니다.');
    }

    // 1. 스냅샷 저장
    await this.updateSnapshotEntity(snapshot, snapshotEntity);

    await this.exchangeRateRepository.repository.delete({ snapshot: { snapshotSeq } });
    await this.assetGroupRepository.repository.delete({ snapshot: { snapshotSeq } });
    await this.stockEvaluateRepository.repository.delete({ snapshot: { snapshotSeq } });

    // 2. 환율 저장
    await this.saveExchangeRates(snapshot, snapshotEntity);

    // 3. 계좌 평가 금액 저장
    await this.saveAssetGroups(snapshot, snapshotEntity);

    // 4. 주식 평가 금액 저장
    await this.saveStockEvaluates(snapshot.stockEvaluate, snapshotEntity);

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
  private static async saveSnapshotEntity(snapshot: SnapshotForm) {
    const snapshotEntity = this.snapshotRepository.repository.create({
      note: snapshot.note,
      stockSellCheckDate: snapshot.stockSellCheckDate,
      regDate: new Date(),
    });
    await this.snapshotRepository.repository.save(snapshotEntity);
    return snapshotEntity;
  }

  private static async updateSnapshotEntity(snapshot: SnapshotForm, snapshotEntity: SnapshotEntity) {
    snapshotEntity.note = snapshot.note;
    snapshotEntity.stockSellCheckDate = snapshot.stockSellCheckDate;
    await this.snapshotRepository.repository.save(snapshotEntity);
  }

  /**
   * 계좌 평가 금액 저장
   */
  private static async saveAssetGroups(snapshot: SnapshotForm, snapshotEntity: SnapshotEntity) {
    const accountList = (await AccountService.findAccountAll()).filter((account) => account.enableF);
    const exchangeRateMap = new Map<Currency, ExchangeRateModel>(snapshot.exchangeRate.map((exchangeRate) => [exchangeRate.currency, exchangeRate]));
    const accountGroupList = _(accountList)
      .groupBy((account) => account.accountType)
      .map(async (accountGroupList, accountType) => {
        let totalAmount = 0;
        let evaluateAmount = 0;

        const balancePromises = accountGroupList.map(async (account) => {
          const balanceTotal = AccountService.getAccountBalanceKrwTotal(account.accountSeq, exchangeRateMap);
          const totalBuyAmountKrw = SnapshotService.getBuyAmountKrwSum(snapshot.stockEvaluate, account.accountSeq, exchangeRateMap);
          const totalEvaluateAmountKrw = SnapshotService.getEvaluateAmountKrwSum(snapshot.stockEvaluate, account.accountSeq, exchangeRateMap);

          return {
            balanceTotal: await balanceTotal,
            totalBuyAmountKrw,
            totalEvaluateAmountKrw,
          };
        });

        const balances = await Promise.all(balancePromises);

        for (const { balanceTotal, totalBuyAmountKrw, totalEvaluateAmountKrw } of balances) {
          totalAmount += balanceTotal + totalBuyAmountKrw;
          evaluateAmount += balanceTotal + totalEvaluateAmountKrw;
        }

        return this.assetGroupRepository.repository.create({
          snapshot: snapshotEntity,
          accountType: Number(accountType),
          totalAmount,
          evaluateAmount,
        });
      })
      .value();
    const assetGroupList = await Promise.all(accountGroupList);
    await this.assetGroupRepository.repository.save(assetGroupList);
  }

  /**
   * 환율 저장
   */
  private static async saveExchangeRates(snapshot: SnapshotForm, snapshotEntity: SnapshotEntity) {
    const exchangeRateEntityList = snapshot.exchangeRate.map((exchangeRate) => {
      return this.exchangeRateRepository.repository.create({
        snapshot: snapshotEntity,
        currency: exchangeRate.currency,
        rate: exchangeRate.rate,
      });
    });
    await this.exchangeRateRepository.repository.save(exchangeRateEntityList);
  }

  /**
   * 주식 평가 금액 저장
   */
  private static async saveStockEvaluates(snapshot: StockEvaluateModel[], snapshotEntity: SnapshotEntity) {
    const stockEvaluateEntityList = snapshot.map((stockEvaluate) => {
      return this.stockEvaluateRepository.repository.create({
        snapshot: snapshotEntity,
        stockBuySeq: stockEvaluate.stockBuySeq,
        buyAmount: stockEvaluate.buyAmount,
        evaluateAmount: stockEvaluate.evaluateAmount,
      });
    });
    await this.stockEvaluateRepository.repository.save(stockEvaluateEntityList);
  }
  // 주식 매수금액을 원화로 계산해 합산

  private static getBuyAmountKrwSum(stockEvaluate: StockEvaluateModel[], accountSeq: number, exchangeRateMap: Map<Currency, ExchangeRateModel>) {
    return this.getStockBuyKrwSum(stockEvaluate, accountSeq, exchangeRateMap, (stockEvaluate) => stockEvaluate.buyAmount);
  }
  // 주식 평가금액을 원화로 계산해 합산

  private static getEvaluateAmountKrwSum(stockEvaluate: StockEvaluateModel[], accountSeq: number, exchangeRateMap: Map<Currency, ExchangeRateModel>) {
    return this.getStockBuyKrwSum(stockEvaluate, accountSeq, exchangeRateMap, (stockEvaluate) => stockEvaluate.evaluateAmount);
  }

  private static getStockBuyKrwSum(
    stockEvaluate: StockEvaluateModel[],
    accountSeq: number,
    exchangeRateMap: Map<Currency, ExchangeRateModel>,
    targetValue: (stockEvaluateModel: StockEvaluateModel) => number,
  ) {
    return _(stockEvaluate)
      .map(async (stockEvaluate) => {
        // todo 호출 할 때마다 DB를 조회 하기 때문에 불필요한 연산이 들어감
        // 이렇게 안하면 소스코드가 복잡해 짐
        const stockBuy = await StockBuyService.getStockBuy(stockEvaluate.stockBuySeq);
        if (!stockBuy) {
          return 0;
        }

        if (stockBuy.accountSeq !== accountSeq) {
          return 0;
        }
        const stock = await StockService.getStock(stockBuy.stockSeq);
        const exchangeRate = exchangeRateMap.get(stock.currency)?.rate || 1;
        return targetValue(stockEvaluate) * exchangeRate;
      })
      .sum();
  }
}
