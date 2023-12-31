import moment from 'moment';
import { EntityManager } from 'typeorm';
import AppDataSource from '../config/AppDataSource';
import { TradeForm } from '../../common/ReqModel';
import { TradeEntity } from '../entity/Entity';
import { ResSearchModel, ResTradeModel } from '../../common/ResModel';
import { escapeWildcards } from '../util';
import AccountService from './AccountService';
import { TradeKind } from '../../common/CommonType';
import TradeRepository from '../repository/TradeRepository';
import StockBuyService from './StockBuyService';
import StockService from './StockService';

export default class TradeService {
  private static tradeRepository = new TradeRepository(AppDataSource);

  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // empty
  }

  private static mapEntityToRes(trade: TradeEntity) {
    return {
      tradeSeq: trade.tradeSeq,
      kind: trade.kind,
      note: trade.note,
      stockSeq: trade.stockBuy.stock.stockSeq,
      quantity: trade.quantity,
      price: trade.price,
      sellGains: trade.sellGains,
      tax: trade.tax,
      fee: trade.fee,
      accountSeq: trade.stockBuy.account.accountSeq,
      tradeDate: trade.tradeDate,
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
      .innerJoinAndSelect('trade.stockBuy', 'stockBuy')
      .innerJoinAndSelect('stockBuy.stock', 'stock')
      .innerJoinAndSelect('stockBuy.account', 'account')
      .where('trade.tradeDate BETWEEN :from AND :to', {
        from: moment(searchCondition.from).format('YYYY-MM-DD 00:00:00.000'),
        to: moment(searchCondition.to).format('YYYY-MM-DD 00:00:00.000'),
      })
      .andWhere('trade.kind IN (:...kind)', { kind: Array.from(searchCondition.checkType) });
    if (searchCondition.note) {
      tradeEntitySelectQueryBuilder.andWhere('trade.note LIKE :note', { note: `%${escapeWildcards(searchCondition.note)}%` });
    }
    if (searchCondition.accountSeq && searchCondition.accountSeq !== 0) {
      tradeEntitySelectQueryBuilder.andWhere('account.accountSeq = :accountSeq', { accountSeq: searchCondition.accountSeq });
    }
    tradeEntitySelectQueryBuilder.orderBy('trade.tradeDate', 'DESC').addOrderBy('trade.tradeSeq', 'DESC');
    const tradeList = await tradeEntitySelectQueryBuilder.getMany();
    const result = tradeList.map(async (trade) => {
      return this.mapEntityToRes(trade);
    });
    return Promise.all(result);
  }

  static async saveTrade(tradeForm: TradeForm) {
    await AppDataSource.transaction(async (tradeEntityManager) => {
      const stockBuyEntity = await StockBuyService.findOrSave(tradeForm.accountSeq, tradeForm.stockSeq);

      let sellGains: number = 0;
      if (tradeForm.kind === TradeKind.SELL) {
        if (stockBuyEntity.quantity - tradeForm.quantity < 0) {
          throw new Error('매도 수량이 매수 수량보다 많습니다.');
        }
        sellGains = (tradeForm.price - stockBuyEntity.getAveragePrice()) * tradeForm.quantity;
      }
      const entity = tradeEntityManager.create(TradeEntity, {
        stockBuy: stockBuyEntity,
        note: tradeForm.note,
        kind: tradeForm.kind,
        tradeDate: moment(tradeForm.tradeDate).format('YYYY-MM-DD 00:00:00.000'),
        price: tradeForm.price,
        quantity: tradeForm.quantity,
        tax: tradeForm.tax,
        fee: tradeForm.fee,
        sellGains,
      });

      await tradeEntityManager.save(TradeEntity, entity);

      // 계좌 잔고 업데이트
      await this.updateBalanceForInsert(tradeEntityManager, tradeForm, stockBuyEntity.stockBuySeq);
    });
  }

  /*
   * 매수 정보 조회, 없으면 생성
   */
  static async updateTrade(tradeForm: TradeForm) {
    await AppDataSource.transaction(async (tradeEntityManager) => {
      const beforeData = await this.tradeRepository.repository.findOne({ where: { tradeSeq: tradeForm.tradeSeq } });
      if (!beforeData) {
        throw new Error('매매 정보를 찾을 수 없습니다.');
      }

      // 계좌 잔고 동기화(이전 상태로 복구)
      await this.updateBalanceForDelete(tradeEntityManager, beforeData);

      const stockBuyEntity = await StockBuyService.findOrSave(tradeForm.accountSeq, tradeForm.stockSeq);
      let sellGains = 0;
      if (beforeData.kind === TradeKind.SELL) {
        sellGains = (tradeForm.price - stockBuyEntity.getAveragePrice()) * tradeForm.quantity;
      }

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
        sellGains,
      };

      await tradeEntityManager.save(TradeEntity, updateData);
      // 계좌 잔고 업데이트
      await this.updateBalanceForInsert(tradeEntityManager, tradeForm, stockBuyEntity.stockBuySeq);
    });
  }

  static async deleteTrade(tradeSeq: number) {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const beforeData = await this.tradeRepository.repository.findOne({ where: { tradeSeq } });
      if (!beforeData) {
        throw new Error('매매 정보를 찾을 수 없습니다.');
      }
      await transactionalEntityManager.delete(TradeEntity, { tradeSeq });
      // 계좌 잔고 업데이트
      await this.updateBalanceForDelete(transactionalEntityManager, beforeData);
    });
  }

  private static async updateBalanceForInsert(transactionalEntityManager: EntityManager, tradeForm: TradeForm, stockBuySeq: number) {
    const stock = await StockService.getStock(tradeForm.stockSeq);

    if (tradeForm.kind === TradeKind.BUY) {
      await AccountService.updateAccountBalance(
        transactionalEntityManager,
        tradeForm.accountSeq,
        stock.currency,
        -(tradeForm.price * tradeForm.quantity + tradeForm.fee + tradeForm.tax),
      );

      const deltaAmount = tradeForm.price * tradeForm.quantity;
      await StockBuyService.updateStockBuyBalance(transactionalEntityManager, stockBuySeq, deltaAmount, tradeForm.quantity);
    } else if (tradeForm.kind === TradeKind.SELL) {
      await AccountService.updateAccountBalance(
        transactionalEntityManager,
        tradeForm.accountSeq,
        stock.currency,
        tradeForm.price * tradeForm.quantity - tradeForm.fee - tradeForm.tax,
      );
      const stockBuyEntity = await StockBuyService.getStockBuy(stockBuySeq);
      if (!stockBuyEntity) {
        throw new Error('주식 매수 정보를 찾을 수 없습니다.');
      }
      if (stockBuyEntity.quantity - tradeForm.quantity < 0) {
        throw new Error('매도 수량이 매수 수량보다 많습니다.');
      }
      const deltaAmount = -(stockBuyEntity.getAveragePrice() * tradeForm.quantity);

      await StockBuyService.updateStockBuyBalance(transactionalEntityManager, stockBuySeq, deltaAmount, -tradeForm.quantity);
    }
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
        await StockBuyService.updateStockBuyBalance(
          transactionalEntityManager,
          beforeData.stockBuy.stockBuySeq,
          -(beforeData.price * beforeData.quantity),
          -beforeData.quantity,
        );
        break;
      case TradeKind.SELL:
        await AccountService.updateAccountBalance(
          transactionalEntityManager,
          beforeData.stockBuy.account.accountSeq,
          beforeData.stockBuy.stock.currency,
          -(beforeData.price * beforeData.quantity - beforeData.fee - beforeData.tax),
        );
        await StockBuyService.updateStockBuyBalance(
          transactionalEntityManager,
          beforeData.stockBuy.stockBuySeq,
          beforeData.price * beforeData.quantity - beforeData.sellGains,
          beforeData.quantity,
        );
        break;
      default:
        throw new Error('매매 유형을 찾을 수 없습니다.');
    }
  }
}
