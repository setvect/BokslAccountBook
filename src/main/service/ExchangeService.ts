import moment from 'moment';
import { DataSource } from 'typeorm';
import AppDataSource from '../config/AppDataSource';
import { ReqExchangeModel, ReqSearchModel } from '../../common/ReqModel';
import { AccountEntity, ExchangeEntity } from '../entity/Entity';
import { ResExchangeModel } from '../../common/ResModel';
import { escapeWildcards } from '../util';
import applyBalanceChanges from './applyBalanceChanges';
import { exchangeBalanceChanges, reverseBalanceChanges } from '../domain/balanceChanges';
import { Currency, ExchangeKind } from '../../common/CommonType';
import ExchangeRepository from '../repository/ExchangeRepository';

export class ExchangeService {
  private readonly exchangeRepository: ExchangeRepository;

  constructor(private readonly dataSource: DataSource) {
    this.exchangeRepository = new ExchangeRepository(dataSource);
  }

  private static mapEntityToRes(exchange: ExchangeEntity): ResExchangeModel {
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
    };
  }

  async get(exchangeSeq: number) {
    const exchange = await this.exchangeRepository.repository.findOne({ where: { exchangeSeq } });
    if (!exchange) {
      throw new Error('환전 정보를 찾을 수 없습니다.');
    }
    return ExchangeService.mapEntityToRes(exchange);
  }

  async findList(searchCondition: ReqSearchModel) {
    const transactionEntitySelectQueryBuilder = this.exchangeRepository.repository
      .createQueryBuilder('exchange')
      .innerJoinAndSelect('exchange.account', 'account')
      .where('exchange.exchangeDate BETWEEN :from AND :to', {
        from: moment(searchCondition.from).format('YYYY-MM-DD'),
        to: moment(searchCondition.to).format('YYYY-MM-DD'),
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
    return transactionList.map(ExchangeService.mapEntityToRes);
  }

  async save(exchangeForm: ReqExchangeModel) {
    await this.dataSource.transaction(async (manager) => {
      const account = await manager.findOneByOrFail(AccountEntity, { accountSeq: exchangeForm.accountSeq });
      const entity = manager.create(ExchangeEntity, {
        account,
        kind: exchangeForm.kind,
        note: exchangeForm.note,
        sellCurrency: exchangeForm.sellCurrency,
        sellAmount: exchangeForm.sellAmount,
        buyCurrency: exchangeForm.buyCurrency,
        buyAmount: exchangeForm.buyAmount,
        fee: exchangeForm.fee,
        exchangeDate: moment(exchangeForm.exchangeDate).format('YYYY-MM-DD'),
      });

      await manager.save(ExchangeEntity, entity);

      // 계좌 잔고 업데이트
      await applyBalanceChanges(manager, exchangeBalanceChanges(exchangeForm));
    });
  }

  async update(exchangeForm: ReqExchangeModel) {
    await this.dataSource.transaction(async (manager) => {
      const beforeData = await manager.findOne(ExchangeEntity, { where: { exchangeSeq: exchangeForm.exchangeSeq } });
      if (!beforeData) {
        throw new Error('거래 정보를 찾을 수 없습니다.');
      }
      // 계좌 잔고 동기화(이전 상태로 복구)
      await applyBalanceChanges(manager, reverseBalanceChanges(exchangeBalanceChanges({ ...beforeData, accountSeq: beforeData.account.accountSeq })));

      const account = await manager.findOneByOrFail(AccountEntity, { accountSeq: exchangeForm.accountSeq });
      const updateData = {
        ...beforeData,
        account,
        kind: exchangeForm.kind,
        note: exchangeForm.note,
        sellCurrency: exchangeForm.sellCurrency,
        sellAmount: exchangeForm.sellAmount,
        buyCurrency: exchangeForm.buyCurrency,
        buyAmount: exchangeForm.buyAmount,
        fee: exchangeForm.fee,
        exchangeDate: moment(exchangeForm.exchangeDate).format('YYYY-MM-DD'),
      };

      await manager.save(ExchangeEntity, updateData);
      // 계좌 잔고 업데이트
      await applyBalanceChanges(manager, exchangeBalanceChanges(exchangeForm));
    });
  }

  async delete(exchangeSeq: number) {
    await this.dataSource.transaction(async (manager) => {
      const beforeData = await manager.findOne(ExchangeEntity, { where: { exchangeSeq } });
      if (!beforeData) {
        throw new Error('환전 정보를 찾을 수 없습니다.');
      }
      await manager.delete(ExchangeEntity, { exchangeSeq });
      await applyBalanceChanges(manager, reverseBalanceChanges(exchangeBalanceChanges({ ...beforeData, accountSeq: beforeData.account.accountSeq })));
    });
  }
}

export default new ExchangeService(AppDataSource);
