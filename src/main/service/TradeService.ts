import moment from 'moment';
import { DataSource, EntityManager } from 'typeorm';
import AppDataSource from '../config/AppDataSource';
import { ReqMonthlyAmountSumModel, ReqSearchModel, ReqTradeModel } from '../../common/ReqModel';
import { StockBuyEntity, TradeEntity } from '../entity/Entity';
import { ResSellGainsSum, ResTradeModel, ResTradeSum } from '../../common/ResModel';
import { escapeWildcards } from '../util';
import AccountService from './AccountService';
import TradeRepository from '../repository/TradeRepository';
import StockBuyService from './StockBuyService';
import { calculateTradeEffect, reverseTradeEffect, TradeEffect } from '../domain/tradeEffects';

export class TradeService {
  private readonly tradeRepository: TradeRepository;

  constructor(private readonly dataSource: DataSource) {
    this.tradeRepository = new TradeRepository(dataSource);
  }

  private static mapEntityToRes(trade: TradeEntity): ResTradeModel {
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
    };
  }

  async get(tradeSeq: number) {
    const trade = await this.tradeRepository.repository.findOne({ where: { tradeSeq } });
    if (!trade) {
      throw new Error('거래 정보를 찾을 수 없습니다.');
    }
    return TradeService.mapEntityToRes(trade);
  }

  async findList(searchCondition: ReqSearchModel) {
    const tradeEntitySelectQueryBuilder = this.tradeRepository.repository
      .createQueryBuilder('trade')
      .innerJoinAndSelect('trade.stockBuy', 'stockBuy')
      .innerJoinAndSelect('stockBuy.stock', 'stock')
      .innerJoinAndSelect('stockBuy.account', 'account')
      .where('trade.tradeDate BETWEEN :from AND :to', {
        from: moment(searchCondition.from).format('YYYY-MM-DD'),
        to: moment(searchCondition.to).format('YYYY-MM-DD'),
      })
      .andWhere('trade.kind IN (:...kind)', { kind: Array.from(searchCondition.checkType) });
    if (searchCondition.note) {
      tradeEntitySelectQueryBuilder.andWhere('trade.note LIKE :note', { note: `%${escapeWildcards(searchCondition.note)}%` });
    }
    if (searchCondition.currency) {
      tradeEntitySelectQueryBuilder.andWhere('stock.currency = :currency', { currency: searchCondition.currency });
    }
    if (searchCondition.accountSeq && searchCondition.accountSeq !== 0) {
      tradeEntitySelectQueryBuilder.andWhere('account.accountSeq = :accountSeq', { accountSeq: searchCondition.accountSeq });
    }
    tradeEntitySelectQueryBuilder.orderBy('trade.tradeDate', 'DESC').addOrderBy('trade.tradeSeq', 'DESC');
    const tradeList = await tradeEntitySelectQueryBuilder.getMany();
    return tradeList.map(TradeService.mapEntityToRes);
  }

  async getMonthlyAmountSum({ from, to, currency }: ReqMonthlyAmountSumModel) {
    const rawResult = await this.tradeRepository.repository
      .createQueryBuilder('trade')
      .select(["strftime('%Y-%m-01', trade.tradeDate) AS tradeDate", 'trade.kind as kind', 'SUM(trade.price * trade.quantity) AS amount'])
      .leftJoin('trade.stockBuy', 'stockBuy')
      .leftJoin('stockBuy.stock', 'stock')
      .where('trade.tradeDate BETWEEN :from AND :to', {
        from: moment(from).format('YYYY-MM-DD'),
        to: moment(to).format('YYYY-MM-DD'),
      })
      .andWhere('stock.currency = :currency', { currency })
      .groupBy("strftime('%Y-%m-01', trade.tradeDate) ")
      .addGroupBy('trade.kind')
      .orderBy("strftime('%Y-%m-01', trade.tradeDate)", 'ASC')
      .getRawMany();

    return rawResult.map((result) => ({
      tradeDate: new Date(result.tradeDate),
      kind: result.kind,
      amount: result.amount,
    })) as ResTradeSum[];
  }

  async getMonthlySellGainsSum({ from, to, currency }: ReqMonthlyAmountSumModel) {
    const rawResult = await this.tradeRepository.repository
      .createQueryBuilder('trade')
      .select([
        "strftime('%Y-%m-01', trade.tradeDate) AS tradeDate",
        'SUM(trade.sellGains) AS amount',
        'SUM(trade.tax) AS tax',
        'SUM(trade.fee) AS fee',
      ])
      .leftJoin('trade.stockBuy', 'stockBuy')
      .leftJoin('stockBuy.stock', 'stock')
      .where('trade.tradeDate BETWEEN :from AND :to', {
        from: moment(from).format('YYYY-MM-DD'),
        to: moment(to).format('YYYY-MM-DD'),
      })
      .andWhere('stock.currency = :currency', { currency })
      .groupBy("strftime('%Y-%m-01', trade.tradeDate) ")
      .orderBy("strftime('%Y-%m-01', trade.tradeDate)", 'ASC')
      .getRawMany();

    return rawResult.map((result) => ({
      tradeDate: new Date(result.tradeDate),
      amount: result.amount,
      tax: result.tax,
      fee: result.fee,
    })) as ResSellGainsSum[];
  }

  async save(form: ReqTradeModel) {
    await this.dataSource.transaction(async (manager) => {
      const holding = await StockBuyService.findOrSave(form.accountSeq, form.stockSeq, manager);
      const effect = calculateTradeEffect(form, holding);
      const entity = manager.create(TradeEntity, TradeService.toEntity(form, holding, effect.sellGains));
      await manager.save(TradeEntity, entity);
      await TradeService.applyEffect(manager, holding, effect);
      await TradeService.checkHolding(manager, holding.stockBuySeq);
    });
  }

  async update(form: ReqTradeModel) {
    await this.dataSource.transaction(async (manager) => {
      const before = await manager.findOneBy(TradeEntity, { tradeSeq: form.tradeSeq });
      if (!before) throw new Error('매매 정보를 찾을 수 없습니다.');
      await TradeService.applyEffect(manager, before.stockBuy, reverseTradeEffect(before));
      const holding = await StockBuyService.findOrSave(form.accountSeq, form.stockSeq, manager);
      const effect = calculateTradeEffect(form, holding);
      await manager.save(TradeEntity, { ...before, ...TradeService.toEntity(form, holding, effect.sellGains) });
      await TradeService.applyEffect(manager, holding, effect);
      // Validate the final state: a temporary reversal during an edit may be negative.
      await TradeService.checkHolding(manager, before.stockBuy.stockBuySeq);
      if (holding.stockBuySeq !== before.stockBuy.stockBuySeq) await TradeService.checkHolding(manager, holding.stockBuySeq);
    });
  }

  async delete(tradeSeq: number) {
    await this.dataSource.transaction(async (manager) => {
      const before = await manager.findOneBy(TradeEntity, { tradeSeq });
      if (!before) throw new Error('매매 정보를 찾을 수 없습니다.');
      await manager.delete(TradeEntity, { tradeSeq });
      await TradeService.applyEffect(manager, before.stockBuy, reverseTradeEffect(before));
      await TradeService.checkHolding(manager, before.stockBuy.stockBuySeq);
    });
  }

  private static toEntity(form: ReqTradeModel, holding: StockBuyEntity, sellGains: number) {
    return {
      stockBuy: holding,
      note: form.note,
      kind: form.kind,
      tradeDate: moment(form.tradeDate).format('YYYY-MM-DD'),
      price: form.price,
      quantity: form.quantity,
      tax: form.tax,
      fee: form.fee,
      sellGains,
    };
  }

  private static async applyEffect(manager: EntityManager, holding: StockBuyEntity, effect: TradeEffect) {
    if (![effect.cash, effect.cost, effect.quantity, effect.sellGains].every(Number.isFinite)) throw new Error('매매 계산 결과가 올바르지 않습니다.');
    await AccountService.updateBalance(manager, holding.account.accountSeq, holding.stock.currency, effect.cash);
    await StockBuyService.updateStockBuyBalance(manager, holding.stockBuySeq, effect.cost, effect.quantity);
  }

  private static async checkHolding(manager: EntityManager, stockBuySeq: number) {
    const holding = await manager.findOneByOrFail(StockBuyEntity, { stockBuySeq });
    if (holding.quantity < 0) throw new Error('보유 수량이 음수가 됩니다. 관련 매도를 먼저 수정하거나 삭제해 주세요.');
  }
}

export default new TradeService(AppDataSource);
