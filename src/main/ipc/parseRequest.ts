import * as yup from 'yup';
import { IPC_CHANNEL, TransactionKind } from '../../common/CommonType';
import { RequestArgs, RequestChannel } from '../../common/ipc/Contract';
import {
  ReqCodeModelSchema,
  ReqTransactionModelSchema,
  ReqFavoriteModelSchema,
  ReqExchangeModelSchema,
  ReqMemoModelSchema,
  ReqCategoryModelSchema,
  ReqAccountModelSchema,
  ReqStockModelSchema,
  ReqStockBuyModelSchema,
  ReqSnapshotModelSchema,
  ReqTradeModelSchema,
  ReqSearchModelSchema,
  ReqMonthlySummaryModelSchema,
  ReqMonthlyAmountSumModelSchema,
  ReqAssetTrendSchema,
  ExchangeRateModelSchema,
} from '../../common/ipc/requestSchemas';

function noArgs(args: unknown[]): [] {
  if (args.length) throw new Error('요청 인자가 올바르지 않습니다.');
  return [];
}

function single<T>(schema: yup.Schema<T>) {
  return (args: unknown[]): [T] => {
    if (args.length !== 1 || args[0] === null || args[0] === undefined) throw new Error('요청 인자가 올바르지 않습니다.');
    return [schema.validateSync(args[0], { strict: true })];
  };
}

const id = yup.number().integer().positive().defined();
const text = yup.string().defined();
const transactionNote = yup.object({ kind: yup.mixed<TransactionKind>().oneOf(Object.values(TransactionKind)).defined(), note: text });
const passwords = yup.tuple([text, text]).defined();

const parsers: { [C in RequestChannel]: (args: unknown[]) => RequestArgs<C> } = {
  [IPC_CHANNEL.CallCategoryLoad]: noArgs,
  [IPC_CHANNEL.CallCategorySave]: single(ReqCategoryModelSchema),
  [IPC_CHANNEL.CallCategoryUpdateOrder]: single(
    yup
      .array()
      .of(yup.object({ categorySeq: id, orderNo: yup.number().integer().min(0).defined() }).defined())
      .defined(),
  ),
  [IPC_CHANNEL.CallCategoryUpdate]: single(ReqCategoryModelSchema),
  [IPC_CHANNEL.CallCategoryDelete]: single(id),
  [IPC_CHANNEL.CallCodeLoad]: noArgs,
  [IPC_CHANNEL.CallCodeSave]: single(ReqCodeModelSchema),
  [IPC_CHANNEL.CallCodeUpdate]: single(ReqCodeModelSchema),
  [IPC_CHANNEL.CallCodeUpdateOrder]: single(
    yup
      .array()
      .of(yup.object({ codeItemSeq: id, orderNo: yup.number().integer().min(0).defined() }).defined())
      .defined(),
  ),
  [IPC_CHANNEL.CallCodeDelete]: single(id),
  [IPC_CHANNEL.CallFavoriteLoad]: noArgs,
  [IPC_CHANNEL.CallFavoriteSave]: single(ReqFavoriteModelSchema),
  [IPC_CHANNEL.CallFavoriteUpdate]: single(ReqFavoriteModelSchema),
  [IPC_CHANNEL.CallFavoriteUpdateOrder]: single(
    yup
      .array()
      .of(yup.object({ favoriteSeq: id, orderNo: yup.number().integer().min(0).defined() }).defined())
      .defined(),
  ),
  [IPC_CHANNEL.CallFavoriteDelete]: single(id),
  [IPC_CHANNEL.CallAccountLoad]: noArgs,
  [IPC_CHANNEL.CallAccountSave]: single(ReqAccountModelSchema),
  [IPC_CHANNEL.CallAccountUpdate]: single(ReqAccountModelSchema),
  [IPC_CHANNEL.CallAccountDelete]: single(id),
  [IPC_CHANNEL.CallStockLoad]: noArgs,
  [IPC_CHANNEL.CallStockSave]: single(ReqStockModelSchema),
  [IPC_CHANNEL.CallStockUpdate]: single(ReqStockModelSchema),
  [IPC_CHANNEL.CallStockDelete]: single(id),
  [IPC_CHANNEL.CallStockBuyLoad]: noArgs,
  [IPC_CHANNEL.CallStockBuySave]: single(ReqStockBuyModelSchema),
  [IPC_CHANNEL.CallStockBuyUpdate]: single(ReqStockBuyModelSchema),
  [IPC_CHANNEL.CallStockBuyDelete]: single(id),
  [IPC_CHANNEL.CallTransactionList]: single(ReqSearchModelSchema),
  [IPC_CHANNEL.CallTransactionGet]: single(id),
  [IPC_CHANNEL.CallTransactionMonthlyFinancialSummary]: single(ReqMonthlySummaryModelSchema),
  [IPC_CHANNEL.CallTransactionMonthlyAmountSum]: single(ReqMonthlyAmountSumModelSchema),
  [IPC_CHANNEL.CallTransactionCategoryByNote]: single(transactionNote),
  [IPC_CHANNEL.CallTransactionSave]: single(ReqTransactionModelSchema),
  [IPC_CHANNEL.CallTransactionUpdate]: single(ReqTransactionModelSchema),
  [IPC_CHANNEL.CallTransactionDelete]: single(id),
  [IPC_CHANNEL.CallTradeList]: single(ReqSearchModelSchema),
  [IPC_CHANNEL.CallTradeMonthlyAmountSum]: single(ReqMonthlyAmountSumModelSchema),
  [IPC_CHANNEL.CallTradeGet]: single(id),
  [IPC_CHANNEL.CallTradeSave]: single(ReqTradeModelSchema),
  [IPC_CHANNEL.CallTradeUpdate]: single(ReqTradeModelSchema),
  [IPC_CHANNEL.CallTradeDelete]: single(id),
  [IPC_CHANNEL.CallExchangeList]: single(ReqSearchModelSchema),
  [IPC_CHANNEL.CallExchangeGet]: single(id),
  [IPC_CHANNEL.CallExchangeSave]: single(ReqExchangeModelSchema),
  [IPC_CHANNEL.CallExchangeUpdate]: single(ReqExchangeModelSchema),
  [IPC_CHANNEL.CallExchangeDelete]: single(id),
  [IPC_CHANNEL.CallMemoList]: single(ReqSearchModelSchema),
  [IPC_CHANNEL.CallMemoGet]: single(id),
  [IPC_CHANNEL.CallMemoSeqGetDate]: single(yup.date().defined()),
  [IPC_CHANNEL.CallMemoSave]: single(ReqMemoModelSchema),
  [IPC_CHANNEL.CallMemoUpdate]: single(ReqMemoModelSchema),
  [IPC_CHANNEL.CallMemoDelete]: single(id),
  [IPC_CHANNEL.CallAssetTrend]: single(ReqAssetTrendSchema),
  [IPC_CHANNEL.CallStoreExchangeRateGet]: noArgs,
  [IPC_CHANNEL.CallStoreExchangeRateSave]: single(yup.array().of(ExchangeRateModelSchema.defined()).defined()),
  [IPC_CHANNEL.CallSnapshotPage]: single(id),
  [IPC_CHANNEL.CallSnapshotGet]: single(id),
  [IPC_CHANNEL.CallSnapshotSave]: single(ReqSnapshotModelSchema),
  [IPC_CHANNEL.CallSnapshotUpdate]: single(ReqSnapshotModelSchema),
  [IPC_CHANNEL.CallSnapshotDelete]: single(id),
  [IPC_CHANNEL.CallUserChangePassword]: single(passwords),
  [IPC_CHANNEL.CallUserCheckPassword]: single(text),
  [IPC_CHANNEL.CallFindDocument]: single(text),
};

export default function parseRequest<C extends RequestChannel>(channel: C, args: unknown[]): RequestArgs<C> {
  return parsers[channel](args);
}
