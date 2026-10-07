import { EntityManager } from 'typeorm';
import { normalizeQuantity } from '../domain/tradeEffects';
import AppDataSource from '../config/AppDataSource';
import { ResStockBuyModel } from '../../common/ResModel';
import { ReqStockBuyModel } from '../../common/ReqModel';
import StockBuyRepository from '../repository/StockBuyRepository';
import StockRepository from '../repository/StockRepository';
import AccountRepository from '../repository/AccountRepository';
import { AccountEntity, StockEntity, StockBuyEntity } from '../entity/Entity';

export default class StockBuyService {
  private static stockBuyRepository = new StockBuyRepository(AppDataSource);

  private static stockRepository = new StockRepository(AppDataSource);

  private static accountRepository = new AccountRepository(AppDataSource);

  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // empty
  }

  private static mapEntityToRes(stockBuy: StockBuyEntity): ResStockBuyModel {
    return {
      stockBuySeq: stockBuy.stockBuySeq,
      stockSeq: stockBuy.stock.stockSeq,
      accountSeq: stockBuy.account.accountSeq,
      buyAmount: parseFloat(stockBuy.buyAmount.toFixed(2)),
      quantity: stockBuy.quantity,
      deleteF: stockBuy.deleteF,
    };
  }

  static async findStockBuyAll() {
    const stockList = await this.stockBuyRepository.repository.find({
      order: { stockBuySeq: 'ASC' },
    });

    return stockList.map(StockBuyService.mapEntityToRes);
  }

  static async saveStockBuy(stockBuyForm: ReqStockBuyModel, manager: EntityManager = AppDataSource.manager) {
    const stock = await manager.findOne(StockEntity, { where: { stockSeq: stockBuyForm.stockSeq } });
    const account = await manager.findOne(AccountEntity, { where: { accountSeq: stockBuyForm.accountSeq } });

    if (!stock) {
      throw new Error('주식 정보를 찾을 수 없습니다.');
    }
    if (!account) {
      throw new Error('계좌 정보를 찾을 수 없습니다.');
    }

    const entity: StockBuyEntity = manager.create(StockBuyEntity, {
      stock,
      account,
      buyAmount: stockBuyForm.buyAmount,
      quantity: stockBuyForm.quantity,
    });
    return manager.save(StockBuyEntity, entity);
  }

  /**
   * 주식 매수 정보가 없으면 생성하고 있으면 조회한다.
   */
  static async findOrSave(accountSeq: number, stockSeq: number, manager: EntityManager = AppDataSource.manager) {
    let stockBuyEntity = await StockBuyService.getStockBuyByAccount(accountSeq, stockSeq, manager);
    if (!stockBuyEntity) {
      const stockBuyForm = {
        stockSeq,
        accountSeq,
        buyAmount: 0,
        quantity: 0,
      } as ReqStockBuyModel;
      stockBuyEntity = await StockBuyService.saveStockBuy(stockBuyForm, manager);
    }
    return stockBuyEntity;
  }

  static async updateStockBuy(stockBuyForm: ReqStockBuyModel) {
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
      quantity: normalizeQuantity(stockBuyEntity.quantity, quantity),
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

  static getStockBuyByAccount(accountSeq: number, stockSeq: number, manager: EntityManager = AppDataSource.manager) {
    return manager.findOne(StockBuyEntity, {
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
}
