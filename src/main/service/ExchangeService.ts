import moment from 'moment';
import { EntityManager } from 'typeorm';
import AppDataSource from '../config/AppDataSource';
import { ExchangeForm, ReqSearchModel } from '../../common/ReqModel';
import { ExchangeEntity } from '../entity/Entity';
import { ResExchangeModel } from '../../common/ResModel';
import { escapeWildcards } from '../util';
import AccountService from './AccountService';
import { Currency, ExchangeKind } from '../../common/CommonType';
import ExchangeRepository from '../repository/ExchangeRepository';

export default class ExchangeService {
  private static exchangeRepository = new ExchangeRepository(AppDataSource);

  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // empty
  }

  private static mapEntityToRes(exchange: ExchangeEntity) {
    return {
      exchangeSeq: exchange.exchangeSeq,
      note: exchange.note,
      kind: exchange.sellCurrency === Currency.KRW ? ExchangeKind.EXCHANGE_SELL : ExchangeKind.EXCHANGE_BUY,
      sellCurrency: exchange.sellCurrency,
      sellAmount: exchange.sellAmount,
      buyCurrency: exchange.buyCurrency,
      buyAmount: exchange.buyAmount,
      fee: exchange.fee,
      accountSeq: exchange.account.accountSeq,
      exchangeDate: exchange.exchangeDate,
    } as ResExchangeModel;
  }

  static async get(exchangeSeq: number) {
    const exchange = await this.exchangeRepository.repository.findOne({ where: { exchangeSeq } });
    if (!exchange) {
      throw new Error('환전 정보를 찾을 수 없습니다.');
    }
    return this.mapEntityToRes(exchange);
  }

  static async findList(searchCondition: ReqSearchModel) {
    const transactionEntitySelectQueryBuilder = this.exchangeRepository.repository
      .createQueryBuilder('exchange')
      .innerJoinAndSelect('exchange.account', 'account')
      .where('exchange.exchangeDate BETWEEN :from AND :to', {
        from: moment(searchCondition.from).format('YYYY-MM-DD 00:00:00.000'),
        to: moment(searchCondition.to).format('YYYY-MM-DD 00:00:00.000'),
      })
      .andWhere('exchange.kind IN (:...kind)', { kind: Array.from(searchCondition.checkType) });
    if (searchCondition.note) {
      transactionEntitySelectQueryBuilder.andWhere('exchange.note LIKE :note', { note: `%${escapeWildcards(searchCondition.note)}%` });
    }
    if (searchCondition.accountSeq && searchCondition.accountSeq !== 0) {
      transactionEntitySelectQueryBuilder.andWhere('account.accountSeq = :accountSeq', { accountSeq: searchCondition.accountSeq });
    }
    transactionEntitySelectQueryBuilder.orderBy('exchange.exchangeDate', 'DESC').addOrderBy('exchange.exchangeSeq', 'DESC');
    const transactionList = await transactionEntitySelectQueryBuilder.getMany();
    const result = transactionList.map(async (transaction) => {
      return this.mapEntityToRes(transaction);
    });
    return Promise.all(result);
  }

  static async save(exchangeForm: ExchangeForm) {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const account = await AccountService.get(exchangeForm.accountSeq);
      const entity = transactionalEntityManager.create(ExchangeEntity, {
        account,
        kind: exchangeForm.kind,
        note: exchangeForm.note,
        sellCurrency: exchangeForm.sellCurrency,
        sellAmount: exchangeForm.sellAmount,
        buyCurrency: exchangeForm.buyCurrency,
        buyAmount: exchangeForm.buyAmount,
        fee: exchangeForm.fee,
        exchangeDate: moment(exchangeForm.exchangeDate).format('YYYY-MM-DD 00:00:00.000'),
      });

      await transactionalEntityManager.save(ExchangeEntity, entity);

      // 계좌 잔고 업데이트
      await this.updateForInsert(transactionalEntityManager, exchangeForm);
    });
  }

  static async update(exchangeForm: ExchangeForm) {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const beforeData = await this.exchangeRepository.repository.findOne({ where: { exchangeSeq: exchangeForm.exchangeSeq } });
      if (!beforeData) {
        throw new Error('거래 정보를 찾을 수 없습니다.');
      }
      // 계좌 잔고 동기화(이전 상태로 복구)
      await this.updateBalanceForDelete(transactionalEntityManager, beforeData);

      const updateData = {
        ...beforeData,
        kind: exchangeForm.kind,
        note: exchangeForm.note,
        sellCurrency: exchangeForm.sellCurrency,
        sellAmount: exchangeForm.sellAmount,
        buyCurrency: exchangeForm.buyCurrency,
        buyAmount: exchangeForm.buyAmount,
        fee: exchangeForm.fee,
        exchangeDate: moment(exchangeForm.exchangeDate).format('YYYY-MM-DD 00:00:00.000'),
      };

      await transactionalEntityManager.save(ExchangeEntity, updateData);
      // 계좌 잔고 업데이트
      await this.updateForInsert(transactionalEntityManager, exchangeForm);
    });
  }

  static async delete(exchangeSeq: number) {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const beforeData = await this.exchangeRepository.repository.findOne({ where: { exchangeSeq } });
      if (!beforeData) {
        throw new Error('환전 정보를 찾을 수 없습니다.');
      }
      await transactionalEntityManager.delete(ExchangeEntity, { exchangeSeq });
      await this.updateBalanceForDelete(transactionalEntityManager, beforeData);
    });
  }

  private static async updateForInsert(transactionalEntityManager: EntityManager, exchangeForm: ExchangeForm) {
    await AccountService.updateBalance(transactionalEntityManager, exchangeForm.accountSeq, exchangeForm.sellCurrency, -exchangeForm.sellAmount);
    await AccountService.updateBalance(transactionalEntityManager, exchangeForm.accountSeq, exchangeForm.buyCurrency, exchangeForm.buyAmount);
    await AccountService.updateBalance(transactionalEntityManager, exchangeForm.accountSeq, Currency.KRW, -exchangeForm.fee);
  }

  private static async updateBalanceForDelete(transactionalEntityManager: EntityManager, beforeData: ExchangeEntity) {
    await AccountService.updateBalance(transactionalEntityManager, beforeData.account.accountSeq, beforeData.sellCurrency, beforeData.sellAmount);
    await AccountService.updateBalance(transactionalEntityManager, beforeData.account.accountSeq, beforeData.buyCurrency, -beforeData.buyAmount);
    await AccountService.updateBalance(transactionalEntityManager, beforeData.account.accountSeq, Currency.KRW, beforeData.fee);
  }
}
