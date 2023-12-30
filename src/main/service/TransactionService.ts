import moment from 'moment';
import AppDataSource from '../config/AppDataSource';
import { TransactionForm } from '../../common/ReqModel';
import TransactionRepository from '../repository/TransactionRepository';
import { TransactionEntity } from '../entity/Entity';
import { ResSearchModel, ResTransactionModel } from '../../common/ResModel';
import { createTransactionSearchCondition } from './Halper';

export default class TransactionService {
  private static transactionRepository = new TransactionRepository(AppDataSource);

  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // empty
  }

  private static mapEntityToRes(transaction: TransactionEntity) {
    return {
      transactionSeq: transaction.transactionSeq,
      categorySeq: transaction.categorySeq,
      kind: transaction.kind,
      payAccount: transaction.payAccount,
      receiveAccount: transaction.receiveAccount,
      attribute: transaction.attribute,
      categoryMain: '..',
      categorySub: '..',
      currency: transaction.currency,
      amount: transaction.amount,
      transactionDate: transaction.transactionDate,
      note: transaction.note,
      fee: transaction.fee,
    } as ResTransactionModel;
  }

  static async getTransaction(transactionSeq: number) {
    const transaction = await this.transactionRepository.repository.findOne({ where: { transactionSeq } });
    if (!transaction) {
      throw new Error('거래 정보를 찾을 수 없습니다.');
    }
    return this.mapEntityToRes(transaction);
  }

  static async findTransactionList(searchCondition: ResSearchModel) {
    const where = createTransactionSearchCondition(searchCondition);
    const transactionList = await this.transactionRepository.repository.find({
      where,
      order: {
        transactionDate: 'DESC',
        transactionSeq: 'DESC',
      },
    });
    console.log('where', where);

    const result = transactionList.map(async (transaction) => {
      return this.mapEntityToRes(transaction);
    });
    return Promise.all(result);
  }

  static async saveTransaction(transactionForm: TransactionForm) {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const entity = transactionalEntityManager.create(TransactionEntity, {
        categorySeq: transactionForm.categorySeq,
        kind: transactionForm.kind,
        payAccount: transactionForm.payAccount,
        receiveAccount: transactionForm.receiveAccount,
        attribute: transactionForm.attribute,
        currency: transactionForm.currency,
        amount: transactionForm.amount,
        transactionDate: moment(transactionForm.transactionDate).format('YYYY-MM-DD 00:00:00.000'),
        note: transactionForm.note,
        fee: transactionForm.fee,
      });

      await transactionalEntityManager.save(TransactionEntity, entity);

      // TODO: 계좌 잔고 동기화 로직
      // 이 부분도 transactionalEntityManager를 사용하여 트랜잭션 내에서 수행됩니다.
    });
  }

  static async updateTransaction(transactionForm: TransactionForm) {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const beforeData = await this.transactionRepository.repository.findOne({ where: { transactionSeq: transactionForm.transactionSeq } });
      if (!beforeData) {
        throw new Error('거래 정보를 찾을 수 없습니다.');
      }

      // TODO: 계좌 잔고 동기화(이전 상태로 복구)

      const updateData = {
        ...beforeData,
        categorySeq: transactionForm.categorySeq,
        kind: transactionForm.kind,
        payAccount: transactionForm.payAccount,
        receiveAccount: transactionForm.receiveAccount,
        attribute: transactionForm.attribute,
        currency: transactionForm.currency,
        amount: transactionForm.amount,
        transactionDate: moment(transactionForm.transactionDate).format('YYYY-MM-DD 00:00:00.000'),
        note: transactionForm.note,
        fee: transactionForm.fee,
      };

      await transactionalEntityManager.save(TransactionEntity, updateData);
      // TODO: 계좌 잔고 동기화
    });
  }

  static async deleteTransaction(transactionSeq: number) {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.delete(TransactionEntity, { transactionSeq });
      // TODO: 계좌 잔고 동기화
    });
  }
}
