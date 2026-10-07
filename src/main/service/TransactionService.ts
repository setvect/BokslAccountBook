import moment from 'moment';
import { Brackets, DataSource } from 'typeorm';
import { parseDateOnly } from '../../common/dateOnly';
import AppDataSource from '../config/AppDataSource';
import { ReqMonthlyAmountSumModel, ReqMonthlySummaryModel, ReqSearchModel, ReqTransactionModel } from '../../common/ReqModel';
import TransactionRepository from '../repository/TransactionRepository';
import { CategoryEntity, TransactionEntity } from '../entity/Entity';
import { ResTransactionModel, ResTransactionSum, ResTransactionSummary } from '../../common/ResModel';
import { escapeWildcards } from '../util';
import applyBalanceChanges from './applyBalanceChanges';
import { transactionBalanceChanges, reverseBalanceChanges } from '../domain/balanceChanges';
import { TransactionKind } from '../../common/CommonType';

export class TransactionService {
  private readonly transactionRepository: TransactionRepository;

  constructor(private readonly dataSource: DataSource) {
    this.transactionRepository = new TransactionRepository(dataSource);
  }

  private static mapEntityToRes(transaction: TransactionEntity): ResTransactionModel {
    return {
      transactionSeq: transaction.transactionSeq,
      categorySeq: transaction.categorySeq,
      kind: transaction.kind,
      payAccount: transaction.payAccount,
      receiveAccount: transaction.receiveAccount,
      attribute: transaction.attribute,
      currency: transaction.currency,
      amount: transaction.amount,
      transactionDate: transaction.transactionDate,
      note: transaction.note,
      fee: transaction.fee,
    };
  }

  async get(transactionSeq: number) {
    const transaction = await this.transactionRepository.repository.findOne({ where: { transactionSeq } });
    if (!transaction) {
      throw new Error('거래 정보를 찾을 수 없습니다.');
    }
    return TransactionService.mapEntityToRes(transaction);
  }

  async findList(searchCondition: ReqSearchModel) {
    const transactionEntitySelectQueryBuilder = this.transactionRepository.repository
      .createQueryBuilder('transaction')
      .where('transaction.transactionDate BETWEEN :from AND :to', {
        from: moment(searchCondition.from).format('YYYY-MM-DD'),
        to: moment(searchCondition.to).format('YYYY-MM-DD'),
      })
      .andWhere('transaction.kind IN (:...kind)', { kind: Array.from(searchCondition.checkType) });
    if (searchCondition.note) {
      transactionEntitySelectQueryBuilder.andWhere('transaction.note LIKE :note', { note: `%${escapeWildcards(searchCondition.note)}%` });
    }
    if (searchCondition.currency) {
      transactionEntitySelectQueryBuilder.andWhere('transaction.currency = :currency', { currency: searchCondition.currency });
    }
    if (searchCondition.accountSeq && searchCondition.accountSeq !== 0) {
      transactionEntitySelectQueryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('transaction.payAccount = :accountSeq', { accountSeq: searchCondition.accountSeq }).orWhere(
            'transaction.receiveAccount = :accountSeq',
            { accountSeq: searchCondition.accountSeq },
          );
        }),
      );
    }
    transactionEntitySelectQueryBuilder.orderBy('transaction.transactionDate', 'DESC').addOrderBy('transaction.transactionSeq', 'DESC');
    const transactionList = await transactionEntitySelectQueryBuilder.getMany();
    return transactionList.map(TransactionService.mapEntityToRes);
  }

  async getMonthlySummary({ from, to, kind, currency }: ReqMonthlySummaryModel) {
    const rawResult = await this.transactionRepository.repository
      .createQueryBuilder('transaction')
      .select([
        "strftime('%Y-%m-01', transaction.transactionDate) AS transactionDate",
        'category.parentSeq AS parentSeq',
        'SUM(transaction.amount) AS amount',
      ])
      .where('transaction.transactionDate BETWEEN :from AND :to', {
        from: moment(from).format('YYYY-MM-DD'),
        to: moment(to).format('YYYY-MM-DD'),
      })
      .andWhere('transaction.kind = :kind', { kind })
      .andWhere('transaction.currency = :currency', { currency })
      .leftJoin(CategoryEntity, 'category', 'transaction.categorySeq = category.categorySeq')
      .groupBy("strftime('%Y-%m-01', transaction.transactionDate) ")
      .addGroupBy('category.parentSeq')
      .orderBy("strftime('%Y-%m-01', transaction.transactionDate)", 'ASC')
      .getRawMany<{ transactionDate: string; parentSeq: number | null; amount: number }>();

    return rawResult.map(
      (result): ResTransactionSummary => ({
        transactionDate: parseDateOnly(result.transactionDate),
        parentSeq: result.parentSeq ?? 0,
        amount: result.amount,
      }),
    );
  }

  async getMonthlyAmountSum({ from, to, currency }: ReqMonthlyAmountSumModel) {
    const rawResult = await this.transactionRepository.repository
      .createQueryBuilder('transaction')
      .select([
        "strftime('%Y-%m-01', transaction.transactionDate) AS transactionDate",
        'transaction.kind as kind',
        'SUM(transaction.amount) AS amount',
        'SUM(transaction.fee) AS fee',
      ])
      .where('transaction.transactionDate BETWEEN :from AND :to', {
        from: moment(from).format('YYYY-MM-DD'),
        to: moment(to).format('YYYY-MM-DD'),
      })
      .andWhere('transaction.currency = :currency', { currency })
      .groupBy("strftime('%Y-%m-01', transaction.transactionDate) ")
      .addGroupBy('transaction.kind')
      .orderBy("strftime('%Y-%m-01', transaction.transactionDate)", 'ASC')
      .getRawMany<Omit<ResTransactionSum, 'transactionDate'> & { transactionDate: string }>();

    return rawResult.map(
      (result): ResTransactionSum => ({
        transactionDate: parseDateOnly(result.transactionDate),
        kind: result.kind,
        amount: result.amount,
        fee: result.fee,
      }),
    );
  }

  async findCategoryByNote(kind: TransactionKind, note: string) {
    const from = new Date();
    // 100일 전 데이터에 대해서만 조회
    from.setDate(from.getDate() - 100);

    const transactionEntitySelectQueryBuilder = this.transactionRepository.repository
      .createQueryBuilder('transaction')
      .select(['transaction.categorySeq as categorySeq'])
      .where('transaction.transactionDate > :from ', {
        from: moment(from).format('YYYY-MM-DD'),
      })
      .andWhere('transaction.kind = :kind', { kind });
    if (note) {
      transactionEntitySelectQueryBuilder.andWhere('transaction.note LIKE :note', { note: `${escapeWildcards(note)}%` });
    }
    transactionEntitySelectQueryBuilder.groupBy('transaction.categorySeq');
    const categorySeqList = await transactionEntitySelectQueryBuilder.getRawMany();
    const result = categorySeqList.map((result) => {
      return result.categorySeq;
    });

    return result;
  }

  async save(transactionForm: ReqTransactionModel) {
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      const entity = transactionalEntityManager.create(TransactionEntity, {
        categorySeq: transactionForm.categorySeq,
        kind: transactionForm.kind,
        payAccount: transactionForm.payAccount,
        receiveAccount: transactionForm.receiveAccount,
        attribute: transactionForm.attribute,
        currency: transactionForm.currency,
        amount: transactionForm.amount,
        transactionDate: moment(transactionForm.transactionDate).format('YYYY-MM-DD'),
        note: transactionForm.note,
        fee: transactionForm.fee,
      });

      await transactionalEntityManager.save(TransactionEntity, entity);

      // 계좌 잔고 업데이트
      await applyBalanceChanges(transactionalEntityManager, transactionBalanceChanges(transactionForm));
    });
  }

  async update(transactionForm: ReqTransactionModel) {
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      const beforeData = await transactionalEntityManager.findOne(TransactionEntity, { where: { transactionSeq: transactionForm.transactionSeq } });
      if (!beforeData) {
        throw new Error('거래 정보를 찾을 수 없습니다.');
      }
      // 계좌 잔고 동기화(이전 상태로 복구)
      await applyBalanceChanges(transactionalEntityManager, reverseBalanceChanges(transactionBalanceChanges(beforeData)));

      const updateData = {
        ...beforeData,
        categorySeq: transactionForm.categorySeq,
        kind: transactionForm.kind,
        payAccount: transactionForm.payAccount,
        receiveAccount: transactionForm.receiveAccount,
        attribute: transactionForm.attribute,
        currency: transactionForm.currency,
        amount: transactionForm.amount,
        transactionDate: moment(transactionForm.transactionDate).format('YYYY-MM-DD'),
        note: transactionForm.note,
        fee: transactionForm.fee,
      };

      await transactionalEntityManager.save(TransactionEntity, updateData);
      // 계좌 잔고 업데이트
      await applyBalanceChanges(transactionalEntityManager, transactionBalanceChanges(transactionForm));
    });
  }

  async delete(transactionSeq: number) {
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      const beforeData = await transactionalEntityManager.findOne(TransactionEntity, { where: { transactionSeq } });
      if (!beforeData) {
        throw new Error('거래 정보를 찾을 수 없습니다.');
      }
      await transactionalEntityManager.delete(TransactionEntity, { transactionSeq });
      await applyBalanceChanges(transactionalEntityManager, reverseBalanceChanges(transactionBalanceChanges(beforeData)));
    });
  }
}

export default new TransactionService(AppDataSource);
