import {
  ResAccountModel,
  ResAssetTrend,
  ResCategoryModel,
  ResCodeModel,
  ResExchangeModel,
  ResFavoriteModel,
  ResMemoModal,
  ResPageModel,
  ResSnapshotModel,
  ResStockBuyModel,
  ResStockModel,
  ResTradeModel,
  ResTradeSum,
  ResTransactionModel,
  ResTransactionSum,
  ResTransactionSummary,
} from '../ResModel';
import { ExchangeRateModel, IPC_CHANNEL, TransactionKind } from '../CommonType';
import {
  ReqAccountModel,
  ReqAssetTrend,
  ReqCategoryModel,
  ReqCodeModel,
  ReqExchangeModel,
  ReqFavoriteModel,
  ReqMemoModel,
  ReqMonthlyAmountSumModel,
  ReqMonthlySummaryModel,
  ReqSearchModel,
  ReqSnapshotModel,
  ReqStockBuyModel,
  ReqStockModel,
  ReqTradeModel,
  ReqTransactionModel,
} from '../ReqModel';

export interface IpcContract {
  [IPC_CHANNEL.CallCategoryLoad]: { args: []; result: ResCategoryModel[] };
  [IPC_CHANNEL.CallCategorySave]: { args: [ReqCategoryModel]; result: void };
  [IPC_CHANNEL.CallCategoryUpdateOrder]: { args: [{ orderNo: number; categorySeq: number }[]]; result: void };
  [IPC_CHANNEL.CallCategoryUpdate]: { args: [ReqCategoryModel]; result: void };
  [IPC_CHANNEL.CallCategoryDelete]: { args: [number]; result: void };
  [IPC_CHANNEL.CallCodeLoad]: { args: []; result: ResCodeModel[] };
  [IPC_CHANNEL.CallCodeSave]: { args: [ReqCodeModel]; result: void };
  [IPC_CHANNEL.CallCodeUpdate]: { args: [ReqCodeModel]; result: void };
  [IPC_CHANNEL.CallCodeUpdateOrder]: { args: [{ orderNo: number; codeItemSeq: number }[]]; result: void };
  [IPC_CHANNEL.CallCodeDelete]: { args: [number]; result: void };
  [IPC_CHANNEL.CallFavoriteLoad]: { args: []; result: ResFavoriteModel[] };
  [IPC_CHANNEL.CallFavoriteSave]: { args: [ReqFavoriteModel]; result: void };
  [IPC_CHANNEL.CallFavoriteUpdate]: { args: [ReqFavoriteModel]; result: void };
  [IPC_CHANNEL.CallFavoriteUpdateOrder]: { args: [{ orderNo: number; favoriteSeq: number }[]]; result: void };
  [IPC_CHANNEL.CallFavoriteDelete]: { args: [number]; result: void };
  [IPC_CHANNEL.CallAccountLoad]: { args: []; result: ResAccountModel[] };
  [IPC_CHANNEL.CallAccountSave]: { args: [ReqAccountModel]; result: void };
  [IPC_CHANNEL.CallAccountUpdate]: { args: [ReqAccountModel]; result: void };
  [IPC_CHANNEL.CallAccountDelete]: { args: [number]; result: void };
  [IPC_CHANNEL.CallStockLoad]: { args: []; result: ResStockModel[] };
  [IPC_CHANNEL.CallStockSave]: { args: [ReqStockModel]; result: void };
  [IPC_CHANNEL.CallStockUpdate]: { args: [ReqStockModel]; result: void };
  [IPC_CHANNEL.CallStockDelete]: { args: [number]; result: void };
  [IPC_CHANNEL.CallStockBuyLoad]: { args: []; result: ResStockBuyModel[] };
  [IPC_CHANNEL.CallStockBuySave]: { args: [ReqStockBuyModel]; result: void };
  [IPC_CHANNEL.CallStockBuyUpdate]: { args: [ReqStockBuyModel]; result: void };
  [IPC_CHANNEL.CallStockBuyDelete]: { args: [number]; result: void };
  [IPC_CHANNEL.CallTransactionList]: { args: [ReqSearchModel]; result: ResTransactionModel[] };
  [IPC_CHANNEL.CallTransactionGet]: { args: [number]; result: ResTransactionModel };
  [IPC_CHANNEL.CallTransactionMonthlyFinancialSummary]: { args: [ReqMonthlySummaryModel]; result: ResTransactionSummary[] };
  [IPC_CHANNEL.CallTransactionMonthlyAmountSum]: { args: [ReqMonthlyAmountSumModel]; result: ResTransactionSum[] };
  [IPC_CHANNEL.CallTransactionCategoryByNote]: { args: [{ kind: TransactionKind; note: string }]; result: number[] };
  [IPC_CHANNEL.CallTransactionSave]: { args: [ReqTransactionModel]; result: void };
  [IPC_CHANNEL.CallTransactionUpdate]: { args: [ReqTransactionModel]; result: void };
  [IPC_CHANNEL.CallTransactionDelete]: { args: [number]; result: void };
  [IPC_CHANNEL.CallTradeList]: { args: [ReqSearchModel]; result: ResTradeModel[] };
  [IPC_CHANNEL.CallTradeMonthlyAmountSum]: { args: [ReqMonthlyAmountSumModel]; result: ResTradeSum[] };
  [IPC_CHANNEL.CallTradeGet]: { args: [number]; result: ResTradeModel };
  [IPC_CHANNEL.CallTradeSave]: { args: [ReqTradeModel]; result: void };
  [IPC_CHANNEL.CallTradeUpdate]: { args: [ReqTradeModel]; result: void };
  [IPC_CHANNEL.CallTradeDelete]: { args: [number]; result: void };
  [IPC_CHANNEL.CallExchangeList]: { args: [ReqSearchModel]; result: ResExchangeModel[] };
  [IPC_CHANNEL.CallExchangeGet]: { args: [number]; result: ResExchangeModel };
  [IPC_CHANNEL.CallExchangeSave]: { args: [ReqExchangeModel]; result: void };
  [IPC_CHANNEL.CallExchangeUpdate]: { args: [ReqExchangeModel]; result: void };
  [IPC_CHANNEL.CallExchangeDelete]: { args: [number]; result: void };
  [IPC_CHANNEL.CallMemoList]: { args: [ReqSearchModel]; result: ResMemoModal[] };
  [IPC_CHANNEL.CallMemoGet]: { args: [number]; result: ResMemoModal };
  [IPC_CHANNEL.CallMemoSeqGetDate]: { args: [Date]; result: number };
  [IPC_CHANNEL.CallMemoSave]: { args: [ReqMemoModel]; result: void };
  [IPC_CHANNEL.CallMemoUpdate]: { args: [ReqMemoModel]; result: void };
  [IPC_CHANNEL.CallMemoDelete]: { args: [number]; result: void };
  [IPC_CHANNEL.CallAssetTrend]: { args: [ReqAssetTrend]; result: ResAssetTrend[] };
  [IPC_CHANNEL.CallStoreExchangeRateGet]: { args: []; result: ExchangeRateModel[] };
  [IPC_CHANNEL.CallStoreExchangeRateSave]: { args: [ExchangeRateModel[]]; result: void };
  [IPC_CHANNEL.CallSnapshotPage]: { args: [number]; result: ResPageModel<ResSnapshotModel> };
  [IPC_CHANNEL.CallSnapshotGet]: { args: [number]; result: ResSnapshotModel };
  [IPC_CHANNEL.CallSnapshotSave]: { args: [ReqSnapshotModel]; result: void };
  [IPC_CHANNEL.CallSnapshotUpdate]: { args: [ReqSnapshotModel]; result: void };
  [IPC_CHANNEL.CallSnapshotDelete]: { args: [number]; result: void };
  [IPC_CHANNEL.CallUserChangePassword]: { args: [[string, string]]; result: void };
  [IPC_CHANNEL.CallUserCheckPassword]: { args: [string]; result: boolean };
  [IPC_CHANNEL.CallFindDocument]: { args: [string]; result: boolean };
}
export type RequestChannel = keyof IpcContract;
export type RequestArgs<C extends RequestChannel> = IpcContract[C]['args'];
export type ResponseValue<C extends RequestChannel> = IpcContract[C]['result'];
export type IpcErrorCode = 'INVALID_REQUEST' | 'SERVICE_ERROR' | 'TIMEOUT' | 'TRANSPORT_ERROR';
export type IpcResult<T> = { ok: true; value: T } | { ok: false; error: { code: IpcErrorCode; message: string } };

export const REQUEST_CHANNELS: readonly RequestChannel[] = [
  IPC_CHANNEL.CallCategoryLoad,
  IPC_CHANNEL.CallCategorySave,
  IPC_CHANNEL.CallCategoryUpdateOrder,
  IPC_CHANNEL.CallCategoryUpdate,
  IPC_CHANNEL.CallCategoryDelete,
  IPC_CHANNEL.CallCodeLoad,
  IPC_CHANNEL.CallCodeSave,
  IPC_CHANNEL.CallCodeUpdate,
  IPC_CHANNEL.CallCodeUpdateOrder,
  IPC_CHANNEL.CallCodeDelete,
  IPC_CHANNEL.CallFavoriteLoad,
  IPC_CHANNEL.CallFavoriteSave,
  IPC_CHANNEL.CallFavoriteUpdate,
  IPC_CHANNEL.CallFavoriteUpdateOrder,
  IPC_CHANNEL.CallFavoriteDelete,
  IPC_CHANNEL.CallAccountLoad,
  IPC_CHANNEL.CallAccountSave,
  IPC_CHANNEL.CallAccountUpdate,
  IPC_CHANNEL.CallAccountDelete,
  IPC_CHANNEL.CallStockLoad,
  IPC_CHANNEL.CallStockSave,
  IPC_CHANNEL.CallStockUpdate,
  IPC_CHANNEL.CallStockDelete,
  IPC_CHANNEL.CallStockBuyLoad,
  IPC_CHANNEL.CallStockBuySave,
  IPC_CHANNEL.CallStockBuyUpdate,
  IPC_CHANNEL.CallStockBuyDelete,
  IPC_CHANNEL.CallTransactionList,
  IPC_CHANNEL.CallTransactionGet,
  IPC_CHANNEL.CallTransactionMonthlyFinancialSummary,
  IPC_CHANNEL.CallTransactionMonthlyAmountSum,
  IPC_CHANNEL.CallTransactionCategoryByNote,
  IPC_CHANNEL.CallTransactionSave,
  IPC_CHANNEL.CallTransactionUpdate,
  IPC_CHANNEL.CallTransactionDelete,
  IPC_CHANNEL.CallTradeList,
  IPC_CHANNEL.CallTradeMonthlyAmountSum,
  IPC_CHANNEL.CallTradeGet,
  IPC_CHANNEL.CallTradeSave,
  IPC_CHANNEL.CallTradeUpdate,
  IPC_CHANNEL.CallTradeDelete,
  IPC_CHANNEL.CallExchangeList,
  IPC_CHANNEL.CallExchangeGet,
  IPC_CHANNEL.CallExchangeSave,
  IPC_CHANNEL.CallExchangeUpdate,
  IPC_CHANNEL.CallExchangeDelete,
  IPC_CHANNEL.CallMemoList,
  IPC_CHANNEL.CallMemoGet,
  IPC_CHANNEL.CallMemoSeqGetDate,
  IPC_CHANNEL.CallMemoSave,
  IPC_CHANNEL.CallMemoUpdate,
  IPC_CHANNEL.CallMemoDelete,
  IPC_CHANNEL.CallAssetTrend,
  IPC_CHANNEL.CallStoreExchangeRateGet,
  IPC_CHANNEL.CallStoreExchangeRateSave,
  IPC_CHANNEL.CallSnapshotPage,
  IPC_CHANNEL.CallSnapshotGet,
  IPC_CHANNEL.CallSnapshotSave,
  IPC_CHANNEL.CallSnapshotUpdate,
  IPC_CHANNEL.CallSnapshotDelete,
  IPC_CHANNEL.CallUserChangePassword,
  IPC_CHANNEL.CallUserCheckPassword,
  IPC_CHANNEL.CallFindDocument,
];

export const NOTIFICATION_CHANNELS = [IPC_CHANNEL.PageAboutBoksl, IPC_CHANNEL.PageChangePassword, IPC_CHANNEL.FindOpen] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];
