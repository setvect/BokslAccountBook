import moment from 'moment';
import { EntityManager } from 'typeorm';
import AppDataSource from '../config/AppDataSource';
import { StockBuyForm, TradeForm } from '../../common/ReqModel';
import { TradeEntity, TransactionEntity } from '../entity/Entity';
import { ResSearchModel, ResTradeModel } from '../../common/ResModel';
import { escapeWildcards } from '../util';
import AccountService from './AccountService';
import { TradeKind } from '../../common/CommonType';
import TradeRepository from '../repository/TradeRepository';
import StockBuyService from './StockBuyService';
import StockService from './StockService';

export default class TransactionService {
  private static tradeRepository = new TradeRepository(AppDataSource);

  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // empty
  }

  private static mapEntityToRes(trade: TradeEntity) {
    return {
      tradeSeq: trade.tradeSeq,
      type: trade.kind,
      note: trade.note,
      stockSeq: trade.stockBuy.stock.stockSeq,
      quantity: trade.quantity,
      price: trade.price,
      sellGains: trade.sellGains,
      tax: trade.tax,
      fee: trade.fee,
      accountSeq: trade.stockBuy.account.accountSeq,
      date: trade.tradeDate,
    } as ResTradeModel;
  }

  static async getTrade(tradeSeq: number) {
    const trade = await this.tradeRepository.repository.findOne({ where: { tradeSeq } });
    if (!trade) {
      throw new Error('거래 정보를 찾을 수 없습니다.');
    }
    return this.mapEntityToRes(trade);
  }

  static async findTradeList(searchCondition: ResSearchModel) {
    const tradeEntitySelectQueryBuilder = this.tradeRepository.repository
      .createQueryBuilder('trade')
      .where('trade.tradeDate BETWEEN :from AND :to', {
        from: moment(searchCondition.from).format('YYYY-MM-DD 00:00:00.000'),
        to: moment(searchCondition.to).format('YYYY-MM-DD 00:00:00.000'),
      })
      .andWhere('trade.kind IN (:...kind)', { kind: Array.from(searchCondition.checkType) });
    if (searchCondition.note) {
      tradeEntitySelectQueryBuilder.andWhere('trade.note LIKE :note', { note: `%${escapeWildcards(searchCondition.note)}%` });
    }
    if (searchCondition.accountSeq && searchCondition.accountSeq !== 0) {
      tradeEntitySelectQueryBuilder.andWhere('trade.stockBuy.account.accountSeq = :accountSeq', { accountSeq: searchCondition.accountSeq });
    }
    tradeEntitySelectQueryBuilder.orderBy('trade.tradeDate', 'DESC').addOrderBy('trade.tradeSeq', 'DESC');
    const tradeList = await tradeEntitySelectQueryBuilder.getMany();
    const result = tradeList.map(async (transaction) => {
      return this.mapEntityToRes(transaction);
    });
    return Promise.all(result);
  }

  static async saveTransaction(tradeForm: TradeForm) {
    await AppDataSource.transaction(async (tradeEntityManager) => {
      const stockBuyEntity = await this.findOrSave(tradeForm.accountSeq, tradeForm.stockSeq);

      const entity = tradeEntityManager.create(TradeEntity, {
        stockBuy: stockBuyEntity,
        note: tradeForm.note,
        kind: tradeForm.kind,
        tradeDate: moment(tradeForm.tradeDate).format('YYYY-MM-DD 00:00:00.000'),
        price: tradeForm.price,
        quantity: tradeForm.quantity,
        tax: tradeForm.tax,
        fee: tradeForm.fee,
        sellGains: tradeForm.fee,
      });

      await tradeEntityManager.save(TradeEntity, entity);

      // 계좌 잔고 업데이트
      await this.updateBalanceForInsert(tradeEntityManager, tradeForm);
    });
  }

  /*
   * 매수 정보 조회, 없으면 생성
   */
  static async updateTransaction(tradeForm: TradeForm) {
    await AppDataSource.transaction(async (tradeEntityManager) => {
      const beforeData = await this.tradeRepository.repository.findOne({ where: { tradeSeq: tradeForm.tradeSeq } });
      if (!beforeData) {
        throw new Error('매매 정보를 찾을 수 없습니다.');
      }

      // 계좌 잔고 동기화(이전 상태로 복구)
      await this.updateBalanceForDelete(tradeEntityManager, beforeData);

      const stockBuyEntity = await this.findOrSave(tradeForm.accountSeq, tradeForm.stockSeq);

      const updateData = {
        ...beforeData,
        stockBuy: stockBuyEntity,
        note: tradeForm.note,
        kind: tradeForm.kind,
        tradeDate: moment(tradeForm.tradeDate).format('YYYY-MM-DD 00:00:00.000'),
        price: tradeForm.price,
        quantity: tradeForm.quantity,
        tax: tradeForm.tax,
        fee: tradeForm.fee,
        sellGains: tradeForm.fee,
      };

      await tradeEntityManager.save(TradeEntity, updateData);
      // 계좌 잔고 업데이트
      await this.updateBalanceForInsert(tradeEntityManager, tradeForm);
    });
  }

  static async deleteTransaction(tradeSeq: number) {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const beforeData = await this.tradeRepository.repository.findOne({ where: { tradeSeq } });
      if (!beforeData) {
        throw new Error('매매 정보를 찾을 수 없습니다.');
      }
      await transactionalEntityManager.delete(TransactionEntity, { transactionSeq: tradeSeq });
      // 계좌 잔고 업데이트
      await this.updateBalanceForDelete(transactionalEntityManager, beforeData);
    });
  }

  private static async updateBalanceForInsert(transactionalEntityManager: EntityManager, tradeForm: TradeForm) {
    const stock = await StockService.getStock(tradeForm.stockSeq);

    switch (tradeForm.kind) {
      case TradeKind.BUY:
        await AccountService.updateAccountBalance(
          transactionalEntityManager,
          tradeForm.accountSeq,
          stock.currency,
          -(tradeForm.price * tradeForm.quantity + tradeForm.fee + tradeForm.tax),
        );
        break;
      case TradeKind.SELL:
        await AccountService.updateAccountBalance(
          transactionalEntityManager,
          tradeForm.accountSeq,
          stock.currency,
          tradeForm.price * tradeForm.quantity - tradeForm.fee - tradeForm.tax,
        );
        break;
      default:
        throw new Error('매매 유형을 찾을 수 없습니다.');
    }

    // TODO 매매 정보 업데이트
  }

  private static async findOrSave(accountSeq: number, stockSeq: number) {
    let stockBuyEntity = await StockBuyService.getStockBuy(accountSeq, stockSeq);
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

  private static async updateBalanceForDelete(transactionalEntityManager: EntityManager, beforeData: TradeEntity) {
    switch (beforeData.kind) {
      case TradeKind.BUY:
        await AccountService.updateAccountBalance(
          transactionalEntityManager,
          beforeData.stockBuy.account.accountSeq,
          beforeData.stockBuy.stock.currency,
          beforeData.price * beforeData.quantity + beforeData.fee + beforeData.tax,
        );
        break;
      case TradeKind.SELL:
        await AccountService.updateAccountBalance(
          transactionalEntityManager,
          beforeData.stockBuy.account.accountSeq,
          beforeData.stockBuy.stock.currency,
          -(beforeData.price * beforeData.quantity - beforeData.fee - beforeData.tax),
        );
        break;
      default:
        throw new Error('매매 유형을 찾을 수 없습니다.');
    }
    // TODO 매매 정보 업데이트
  }
}
