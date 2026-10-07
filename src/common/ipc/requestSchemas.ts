import * as yup from 'yup';
import { AccountType, CodeKind, Currency, ExchangeKind, TradeKind, TransactionKind } from '../CommonType';
import {
  ReqCodeModel,
  ReqTransactionModel,
  ReqFavoriteModel,
  ReqExchangeModel,
  ReqMemoModel,
  ReqCategoryModel,
  ReqAccountModel,
  ReqStockModel,
  ReqStockBuyModel,
  ReqSnapshotModel,
  ReqTradeModel,
  ReqSearchModel,
  ReqMonthlySummaryModel,
  ReqMonthlyAmountSumModel,
  ReqAssetTrend,
} from '../ReqModel';

export const finiteNumber = yup.number().test('finite', '유한한 숫자를 입력해 주세요.', (value) => value === undefined || Number.isFinite(value));
const accountTypes = yup
  .mixed<Set<AccountType>>()
  .test(
    'account-types',
    '조회 유형이 올바르지 않습니다.',
    (value) => value instanceof Set && Array.from(value).every((kind) => Object.values(AccountType).includes(kind)),
  );
const CurrencyAmountModelSchema = yup.object({
  currency: yup.mixed<Currency>().oneOf(Object.values(Currency)).defined(),
  amount: finiteNumber.defined(),
});
export const ExchangeRateModelSchema = yup.object({
  currency: yup.mixed<Currency>().oneOf(Object.values(Currency)).defined(),
  rate: finiteNumber.positive().defined(),
});
const ResStockEvaluateModelSchema = yup.object({
  stockBuySeq: finiteNumber.integer().positive().defined(),
  buyAmount: finiteNumber.defined(),
  evaluateAmount: finiteNumber.defined(),
});

export const ReqCodeModelSchema: yup.ObjectSchema<ReqCodeModel> = yup.object({
  codeItemSeq: finiteNumber.integer().min(0).defined(),
  codeMainId: yup.mixed<CodeKind>().oneOf(Object.values(CodeKind)).defined(),
  name: yup.string().defined(),
});

export const ReqTransactionModelSchema: yup.ObjectSchema<ReqTransactionModel> = yup.object({
  transactionSeq: finiteNumber.integer().min(0).defined(),
  transactionDate: yup.date().defined(),
  categorySeq: finiteNumber.integer().min(0).defined(),
  kind: yup.mixed<TransactionKind>().oneOf(Object.values(TransactionKind)).defined(),
  note: yup.string().defined(),
  currency: yup.mixed<Currency>().oneOf(Object.values(Currency)).defined(),
  amount: finiteNumber.defined(),
  payAccount: finiteNumber.defined(),
  receiveAccount: finiteNumber.defined(),
  attribute: finiteNumber.defined(),
  fee: finiteNumber.defined(),
});

export const ReqFavoriteModelSchema: yup.ObjectSchema<ReqFavoriteModel> = yup.object({
  favoriteSeq: finiteNumber.integer().min(0).defined(),
  title: yup.string().defined(),
  categorySeq: finiteNumber.integer().min(0).defined(),
  kind: yup.mixed<TransactionKind>().oneOf(Object.values(TransactionKind)).defined(),
  note: yup.string().defined(),
  currency: yup.mixed<Currency>().oneOf(Object.values(Currency)).defined(),
  amount: finiteNumber.defined(),
  payAccount: finiteNumber.defined(),
  receiveAccount: finiteNumber.defined(),
  attribute: finiteNumber.defined(),
});

export const ReqExchangeModelSchema: yup.ObjectSchema<ReqExchangeModel> = yup.object({
  exchangeSeq: finiteNumber.integer().min(0).defined(),
  kind: yup.mixed<ExchangeKind>().oneOf(Object.values(ExchangeKind)).defined(),
  exchangeDate: yup.date().defined(),
  accountSeq: finiteNumber.integer().min(0).defined(),
  note: yup.string().defined(),
  sellCurrency: yup.mixed<Currency>().oneOf(Object.values(Currency)).defined(),
  sellAmount: finiteNumber.defined(),
  buyCurrency: yup.mixed<Currency>().oneOf(Object.values(Currency)).defined(),
  buyAmount: finiteNumber.defined(),
  fee: finiteNumber.defined(),
});

export const ReqMemoModelSchema: yup.ObjectSchema<ReqMemoModel> = yup.object({
  memoSeq: finiteNumber.integer().min(0).defined(),
  memoDate: yup.date().defined(),
  note: yup.string().defined(),
});

export const ReqCategoryModelSchema: yup.ObjectSchema<ReqCategoryModel> = yup.object({
  kind: yup.mixed<TransactionKind>().oneOf(Object.values(TransactionKind)).defined(),
  categorySeq: finiteNumber.integer().min(0).defined(),
  name: yup.string().defined(),
  parentSeq: finiteNumber.integer().min(0).defined(),
});

export const ReqAccountModelSchema: yup.ObjectSchema<ReqAccountModel> = yup.object({
  accountSeq: finiteNumber.integer().min(0).defined(),
  name: yup.string().defined(),
  accountNumber: yup.string().defined(),
  assetType: finiteNumber.defined(),
  accountType: finiteNumber.defined(),
  stockF: yup.boolean().defined(),
  balance: yup.array().of(CurrencyAmountModelSchema.defined()).defined(),
  interestRate: yup.string().optional(),
  term: yup.string().optional(),
  expDate: yup.string().optional(),
  monthlyPay: yup.string().optional(),
  transferDate: yup.string().optional(),
  note: yup.string().optional(),
  enableF: yup.boolean().optional(),
});

export const ReqStockModelSchema: yup.ObjectSchema<ReqStockModel> = yup.object({
  stockSeq: finiteNumber.integer().min(0).defined(),
  name: yup.string().defined(),
  currency: yup.mixed<Currency>().oneOf(Object.values(Currency)).defined(),
  stockTypeCode: finiteNumber.defined(),
  nationCode: finiteNumber.defined(),
  link: yup.string().defined(),
  note: yup.string().optional(),
  enableF: yup.boolean().defined(),
});

export const ReqStockBuyModelSchema: yup.ObjectSchema<ReqStockBuyModel> = yup.object({
  stockBuySeq: finiteNumber.integer().min(0).defined(),
  stockSeq: finiteNumber.integer().min(0).defined(),
  accountSeq: finiteNumber.integer().min(0).defined(),
  buyAmount: finiteNumber.defined(),
  quantity: finiteNumber.defined(),
});

export const ReqSnapshotModelSchema: yup.ObjectSchema<ReqSnapshotModel> = yup.object({
  snapshotSeq: finiteNumber.integer().min(0).defined(),
  note: yup.string().defined(),
  exchangeRateList: yup.array().of(ExchangeRateModelSchema.defined()).defined(),
  stockEvaluateList: yup.array().of(ResStockEvaluateModelSchema.defined()).defined(),
  stockSellCheckDate: yup.date().optional(),
});

export const ReqTradeModelSchema: yup.ObjectSchema<ReqTradeModel> = yup.object({
  tradeSeq: finiteNumber.integer().min(0).defined(),
  tradeDate: yup.date().defined(),
  accountSeq: finiteNumber.integer().min(0).defined(),
  stockSeq: finiteNumber.integer().min(0).defined(),
  note: yup.string().defined(),
  kind: yup.mixed<TradeKind>().oneOf(Object.values(TradeKind)).defined(),
  quantity: finiteNumber.defined(),
  price: finiteNumber.defined(),
  tax: finiteNumber.defined(),
  fee: finiteNumber.defined(),
});

export const ReqSearchModelSchema: yup.ObjectSchema<ReqSearchModel> = yup.object({
  note: yup.string().optional(),
  from: yup.date().defined(),
  to: yup.date().defined(),
  accountSeq: finiteNumber.optional(),
  checkType: accountTypes.defined(),
  currency: yup.mixed<Currency>().oneOf(Object.values(Currency)).optional(),
});

export const ReqMonthlySummaryModelSchema: yup.ObjectSchema<ReqMonthlySummaryModel> = yup.object({
  from: yup.date().defined(),
  to: yup.date().defined(),
  kind: yup.mixed<TransactionKind>().oneOf(Object.values(TransactionKind)).defined(),
  currency: yup.mixed<Currency>().oneOf(Object.values(Currency)).defined(),
});

export const ReqMonthlyAmountSumModelSchema: yup.ObjectSchema<ReqMonthlyAmountSumModel> = yup.object({
  from: yup.date().defined(),
  to: yup.date().defined(),
  currency: yup.mixed<Currency>().oneOf(Object.values(Currency)).defined(),
});

export const ReqAssetTrendSchema: yup.ObjectSchema<ReqAssetTrend> = yup.object({
  startDate: yup.date().defined(),
  exchangeRate: yup.array().of(ExchangeRateModelSchema.defined()).defined(),
});
