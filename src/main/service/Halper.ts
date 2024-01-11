import { Between, In, Like } from 'typeorm';
import moment from 'moment/moment';
import { escapeWildcards } from '../util';
import { ReqSearchModel } from '../../common/ReqModel';

// eslint-disable-next-line import/prefer-default-export
export function createTransactionSearchCondition(searchModel: ReqSearchModel) {
  const conditions: any = {};

  if (searchModel.checkType && searchModel.checkType.size > 0) {
    conditions.kind = In(Array.from(searchModel.checkType));
  }

  if (searchModel.accountSeq && searchModel.accountSeq !== 0) {
    conditions.payAccount = searchModel.accountSeq;
    conditions.receiveAccount = searchModel.accountSeq;
  }
  if (searchModel.note) {
    conditions.note = Like(`%${escapeWildcards(searchModel.note)}%`);
  }
  conditions.transactionDate = Between(
    moment(searchModel.from).format('YYYY-MM-DD 00:00:00.000'),
    moment(searchModel.to).format('YYYY-MM-DD 00:00:00.000'),
  );
  return conditions;
}
