import moment from 'moment';
import AppDataSource from '../config/AppDataSource';
import { MemoForm, ReqSearchModel } from '../../common/ReqModel';
import { MemoEntity } from '../entity/Entity';
import { ResMemoModal } from '../../common/ResModel';
import { escapeWildcards, toUTCDate } from '../util';
import MemoRepository from '../repository/MemoRepository';

export default class MemoService {
  private static memoRepository = new MemoRepository(AppDataSource);

  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // empty
  }

  private static mapEntityToRes(memo: MemoEntity) {
    return {
      memoSeq: memo.memoSeq,
      note: memo.note,
      memoDate: memo.memoDate,
      deleteF: false,
    } as ResMemoModal;
  }

  static async getMemo(memoSeq: number) {
    const memo = await this.memoRepository.repository.findOne({ where: { memoSeq } });
    if (!memo) {
      throw new Error('매모 정보를 찾을 수 없습니다.');
    }
    return this.mapEntityToRes(memo);
  }

  static async getMemoSeqForDate(date: Date) {
    const memoDate = toUTCDate(date);
    const memo = await this.memoRepository.repository.findOne({ where: { memoDate: memoDate, deleteF: false } });
    if (!memo) {
      return 0;
    }
    return this.mapEntityToRes(memo).memoSeq;
  }

  static async findMemoList(searchCondition: ReqSearchModel) {
    const transactionEntitySelectQueryBuilder = this.memoRepository.repository
      .createQueryBuilder('memo')
      .where('memo.memoDate BETWEEN :from AND :to', {
        from: moment(searchCondition.from).format('YYYY-MM-DD 00:00:00.000'),
        to: moment(searchCondition.to).format('YYYY-MM-DD 00:00:00.000'),
      });
    if (searchCondition.note) {
      transactionEntitySelectQueryBuilder.andWhere('memo.note LIKE :note', { note: `%${escapeWildcards(searchCondition.note)}%` });
    }
    transactionEntitySelectQueryBuilder.andWhere('memo.deleteF = :deleteF', { deleteF: false });
    transactionEntitySelectQueryBuilder.orderBy('memo.memoDate', 'DESC').addOrderBy('memo.memoSeq', 'DESC');
    const memoList = await transactionEntitySelectQueryBuilder.getMany();
    const result = memoList.map(async (memo) => {
      return this.mapEntityToRes(memo);
    });
    return Promise.all(result);
  }

  static async saveMemo(memoForm: MemoForm) {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const entity = transactionalEntityManager.create(MemoEntity, {
        note: memoForm.note,
        memoDate: moment(memoForm.memoDate).format('YYYY-MM-DD 00:00:00.000'),
      });

      await transactionalEntityManager.save(MemoEntity, entity);
    });
  }

  static async updateMemo(memoForm: MemoForm) {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const beforeData = await this.memoRepository.repository.findOne({ where: { memoSeq: memoForm.memoSeq } });
      if (!beforeData) {
        throw new Error('메모 정보를 찾을 수 없습니다.');
      }
      // 계좌 잔고 동기화(이전 상태로 복구)

      const updateData = {
        ...beforeData,
        note: memoForm.note,
        memoDate: moment(memoForm.memoDate).format('YYYY-MM-DD 00:00:00.000'),
      };

      await transactionalEntityManager.save(MemoEntity, updateData);
    });
  }

  static async deleteMemo(memoSeq: number) {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const beforeData = await this.memoRepository.repository.findOne({ where: { memoSeq } });
      if (!beforeData) {
        throw new Error('메모 정보를 찾을 수 없습니다.');
      }
      await transactionalEntityManager.delete(MemoEntity, { memoSeq });
    });
  }
}
