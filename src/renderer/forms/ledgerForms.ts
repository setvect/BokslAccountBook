import moment from 'moment';
import * as yup from 'yup';
import { Currency, ExchangeKind, TradeKind, TransactionKind } from '../../common/CommonType';
import { ReqExchangeModel, ReqTradeModel, ReqTransactionModel } from '../../common/ReqModel';
import { ResExchangeModel, ResTradeModel, ResTransactionModel } from '../../common/ResModel';
import { finiteNumber, ReqExchangeModelSchema, ReqTradeModelSchema, ReqTransactionModelSchema } from '../../common/ipc/requestSchemas';

const selected = (message: string) => finiteNumber.integer().positive(message).required(message);
export const transactionFormSchema: yup.ObjectSchema<ReqTransactionModel> = ReqTransactionModelSchema.shape({
  transactionDate: yup.date().required('날짜는 필수입니다.'),
  categorySeq: selected('분류를 선택해 주세요.'),
  attribute: selected('속성을 선택해 주세요.'),
  note: yup.string().required('메모는 필수입니다.'),
  payAccount: finiteNumber
    .defined()
    .when('kind', { is: (kind: TransactionKind) => kind !== TransactionKind.INCOME, then: () => selected('지출 계좌를 선택해 주세요.') }),
  receiveAccount: finiteNumber.defined().when('kind', {
    is: (kind: TransactionKind) => kind !== TransactionKind.SPENDING,
    then: () =>
      selected('수입 계좌를 선택해 주세요.').when('kind', {
        is: TransactionKind.TRANSFER,
        then: (schema) => schema.notOneOf([yup.ref('payAccount')], '지출 계좌와 수입 계좌를 다르게 선택해 주세요.'),
      }),
  }),
});
export const exchangeFormSchema: yup.ObjectSchema<ReqExchangeModel> = ReqExchangeModelSchema.shape({
  exchangeDate: yup.date().required('날짜는 필수입니다.'),
  accountSeq: selected('계좌를 선택해 주세요.'),
  note: yup.string().required('메모는 필수입니다.'),
  sellAmount: finiteNumber.required('매도 금액은 필수입니다.').notOneOf([0], '매도 금액은 필수입니다.'),
  buyAmount: finiteNumber.required('매수 금액은 필수입니다.').notOneOf([0], '매수 금액은 필수입니다.'),
  buyCurrency: yup
    .mixed<Currency>()
    .oneOf(Object.values(Currency))
    .required('매수 통화는 필수입니다.')
    .notOneOf([yup.ref('sellCurrency')], '매도 통화와 매수 통화는 달라야 합니다.'),
});
export const tradeFormSchema: yup.ObjectSchema<ReqTradeModel> = ReqTradeModelSchema.shape({
  tradeDate: yup.date().required('날짜는 필수입니다.'),
  accountSeq: selected('계좌를 선택해 주세요.'),
  stockSeq: selected('종목을 선택해 주세요.'),
  note: yup.string().required('메모는 필수입니다.'),
  quantity: finiteNumber.positive('수량을 입력해 주세요.').required('수량은 필수입니다.'),
  price: finiteNumber.positive('단가를 입력해 주세요.').required('단가는 필수입니다.'),
});
export function newTransaction(kind: TransactionKind, date: Date | null): ReqTransactionModel {
  return {
    transactionSeq: 0,
    transactionDate: date ?? new Date(),
    kind,
    categorySeq: 0,
    note: '',
    currency: Currency.KRW,
    amount: 0,
    payAccount: 0,
    receiveAccount: 0,
    attribute: 0,
    fee: 0,
  };
}
export function transactionToForm(model: ResTransactionModel): ReqTransactionModel {
  return {
    ...model,
    transactionDate: moment(model.transactionDate).toDate(),
    payAccount: model.payAccount ?? 0,
    receiveAccount: model.receiveAccount ?? 0,
    note: model.note ?? '',
  };
}
export function newExchange(kind: ExchangeKind, date: Date | null): ReqExchangeModel {
  return {
    exchangeSeq: 0,
    exchangeDate: date ?? new Date(),
    kind,
    accountSeq: 0,
    note: '',
    sellCurrency: kind === ExchangeKind.EXCHANGE_SELL ? Currency.KRW : Currency.USD,
    buyCurrency: kind === ExchangeKind.EXCHANGE_BUY ? Currency.KRW : Currency.USD,
    sellAmount: 0,
    buyAmount: 0,
    fee: 0,
  };
}
export function exchangeToForm(model: ResExchangeModel): ReqExchangeModel {
  return { ...model, exchangeDate: moment(model.exchangeDate).toDate(), note: model.note ?? '' };
}
export function newTrade(kind: TradeKind, date: Date | null): ReqTradeModel {
  return { tradeSeq: 0, tradeDate: date ?? new Date(), kind, accountSeq: 0, stockSeq: 0, note: '', quantity: 0, price: 0, tax: 0, fee: 0 };
}
export function tradeToForm(model: ResTradeModel): ReqTradeModel {
  return { ...model, tradeDate: moment(model.tradeDate).toDate(), note: model.note ?? '' };
}
