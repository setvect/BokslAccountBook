import { EntityManager } from 'typeorm';
import AppDataSource from '../config/AppDataSource';
import { ResStockBuyModel } from '../../common/ResModel';
import { StockBuyForm } from '../../common/ReqModel';
import StockBuyRepository from '../repository/StockBuyRepository';
import StockRepository from '../repository/StockRepository';
import AccountRepository from '../repository/AccountRepository';
import { StockBuyEntity } from '../entity/Entity';
import { Currency, ExchangeRateModel } from '../../common/CommonType';
import _ from 'lodash';

export default class StockBuyService {
  private static stockBuyRepository = new StockBuyRepository(AppDataSource);

  private static stockRepository = new StockRepository(AppDataSource);

  private static accountRepository = new AccountRepository(AppDataSource);

  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // empty
  }

  private static async mapEntityToRes(stockBuy: StockBuyEntity) {
    return {
      stockBuySeq: stockBuy.stockBuySeq,
      stockSeq: stockBuy.stock.stockSeq,
      accountSeq: stockBuy.account.accountSeq,
      buyAmount: parseFloat(stockBuy.buyAmount.toFixed(2)),
      quantity: stockBuy.quantity,
      deleteF: stockBuy.deleteF,
    } as ResStockBuyModel;
  }

  static async findStockBuyAll() {
    const stockList = await this.stockBuyRepository.repository.find({
      order: { stockBuySeq: 'ASC' },
    });

    const result = stockList.map(async (stockBuy) => {
      return this.mapEntityToRes(stockBuy);
    });
    return Promise.all(result);
  }

  static async saveStockBuy(stockBuyForm: StockBuyForm) {
    const stock = await this.stockRepository.repository.findOne({ where: { stockSeq: stockBuyForm.stockSeq } });
    const account = await this.accountRepository.repository.findOne({ where: { accountSeq: stockBuyForm.accountSeq } });

    if (!stock) {
      throw new Error('주식 정보를 찾을 수 없습니다.');
    }
    if (!account) {
      throw new Error('계좌 정보를 찾을 수 없습니다.');
    }

    const entity: StockBuyEntity = this.stockBuyRepository.repository.create({
      stock,
      account,
      buyAmount: stockBuyForm.buyAmount,
      quantity: stockBuyForm.quantity,
    });
    return this.stockBuyRepository.repository.save(entity);
  }

  /**
   * 주식 매수 정보가 없으면 생성하고 있으면 조회한다.
   */
  static async findOrSave(accountSeq: number, stockSeq: number) {
    let stockBuyEntity = await StockBuyService.getStockBuyByAccount(accountSeq, stockSeq);
    if (!stockBuyEntity) {
      const stockBuyForm = {
        stockSeq,
        accountSeq,
        buyAmount: 0,
        quantity: 0,
      } as StockBuyForm;
      stockBuyEntity = await StockBuyService.saveStockBuy(stockBuyForm);
    }
    return stockBuyEntity;
  }

  static async updateStockBuy(stockBuyForm: StockBuyForm) {
    const beforeData = await this.stockBuyRepository.repository.findOne({ where: { stockBuySeq: stockBuyForm.stockBuySeq } });
    if (!beforeData) {
      throw new Error('수정할 주식 정보를 찾을 수 없습니다.');
    }

    const stock = await this.stockRepository.repository.findOne({ where: { stockSeq: stockBuyForm.stockSeq } });
    const account = await this.accountRepository.repository.findOne({ where: { accountSeq: stockBuyForm.accountSeq } });

    if (!stock) {
      throw new Error('주식 정보를 찾을 수 없습니다.');
    }
    if (!account) {
      throw new Error('계좌 정보를 찾을 수 없습니다.');
    }

    const updateData = {
      ...beforeData,
      stock,
      account,
      buyAmount: stockBuyForm.buyAmount,
      quantity: stockBuyForm.quantity,
    };

    await this.stockBuyRepository.repository.save(updateData);
  }

  /**
   * 주식 매수 정보의 잔고를 업데이트한다.
   * @param transactionalEntityManager 트랜젝션
   * @param stockBuySeq 주식 매수 일련번호
   * @param deltaAmount 매수 가격 변동량
   * @param quantity 수량(양수면 증가, 음수면 감소)
   */
  static async updateStockBuyBalance(transactionalEntityManager: EntityManager, stockBuySeq: number, deltaAmount: number, quantity: number) {
    const stockBuyEntity = await transactionalEntityManager.findOne(StockBuyEntity, {
      where: {
        stockBuySeq,
      },
    });
    if (!stockBuyEntity) {
      throw new Error('주식 정보를 찾을 수 없습니다.');
    }

    const updateData = {
      ...stockBuyEntity,
      buyAmount: stockBuyEntity.buyAmount + deltaAmount,
      quantity: stockBuyEntity.quantity + quantity,
    };

    await transactionalEntityManager.save(StockBuyEntity, updateData);
  }

  static async deleteStockBuy(stockBuySeq: number) {
    const beforeData = await this.stockBuyRepository.repository.findOne({ where: { stockBuySeq } });
    if (!beforeData) {
      throw new Error('종목 정보를 찾을 수 없습니다.');
    }

    const updateData = {
      ...beforeData,
      deleteF: true,
    };

    await this.stockBuyRepository.repository.save(updateData);
  }

  static getStockBuyByAccount(accountSeq: number, stockSeq: number) {
    return this.stockBuyRepository.repository.findOne({
      where: {
        account: { accountSeq },
        stock: { stockSeq },
      },
    });
  }

  static async getStockBuy(stockBuySeq: number) {
    const entity = await this.stockBuyRepository.repository.findOne({
      where: {
        stockBuySeq,
      },
    });
    if (!entity) {
      throw new Error('주식 정보를 찾을 수 없습니다.');
    }

    return this.mapEntityToRes(entity);
  }

  // 특정 계좌의 주식 매수금액 합계를 원화로 계산한다.
  static async getBuyAmountKrwTotal(accountSeq: number, exchangeRateMap: Map<Currency, ExchangeRateModel>) {
    const stockBuyList = await this.stockBuyRepository.repository.find({
      where: {
        account: { accountSeq },
      },
    });

    return _(stockBuyList).sumBy((stockBuy) => {
      const rate = exchangeRateMap.get(stockBuy.stock.currency)?.rate || 1;
      return stockBuy.buyAmount * rate;
    });
  }
}
