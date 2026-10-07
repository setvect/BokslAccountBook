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
} from '../../common/ResModel';
import { ExchangeRateModel, IPC_CHANNEL, TransactionKind } from '../../common/CommonType';
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
} from '../../common/ReqModel';
import rawRequest from './request';
import { RequestArgs, RequestChannel, ResponseValue } from '../../common/ipc/Contract';
import { refreshAfterMutation } from '../state/referenceData';
import { showWarnDialog } from '../components/util/util';

async function request<C extends RequestChannel>(channel: C, ...args: RequestArgs<C>): Promise<ResponseValue<C>> {
  const value = await rawRequest(channel, ...args);
  try {
    await refreshAfterMutation(channel);
  } catch {
    showWarnDialog('저장은 완료됐지만 목록을 새로 불러오지 못했습니다. 앱을 다시 열어 최신 상태를 확인해 주세요.');
  }
  return value;
}

function getCategoryList(): Promise<ResCategoryModel[]> {
  return request(IPC_CHANNEL.CallCategoryLoad);
}

function saveCategory(category: ReqCategoryModel): Promise<void> {
  return request(IPC_CHANNEL.CallCategorySave, category);
}

function updateCategoryOrder(category: { orderNo: number; categorySeq: number }[]): Promise<void> {
  return request(IPC_CHANNEL.CallCategoryUpdateOrder, category);
}

function updateCategory(category: ReqCategoryModel): Promise<void> {
  return request(IPC_CHANNEL.CallCategoryUpdate, category);
}

function deleteCategory(categorySeq: number): Promise<void> {
  return request(IPC_CHANNEL.CallCategoryDelete, categorySeq);
}

function getCodeList(): Promise<ResCodeModel[]> {
  return request(IPC_CHANNEL.CallCodeLoad);
}

function saveCode(code: ReqCodeModel): Promise<void> {
  return request(IPC_CHANNEL.CallCodeSave, code);
}

function updateCode(code: ReqCodeModel): Promise<void> {
  return request(IPC_CHANNEL.CallCodeUpdate, code);
}

function updateCodeOrder(code: { orderNo: number; codeItemSeq: number }[]): Promise<void> {
  return request(IPC_CHANNEL.CallCodeUpdateOrder, code);
}

function deleteCode(codeSeq: number): Promise<void> {
  return request(IPC_CHANNEL.CallCodeDelete, codeSeq);
}

function getFavoriteList(): Promise<ResFavoriteModel[]> {
  return request(IPC_CHANNEL.CallFavoriteLoad);
}

function saveFavorite(favorite: ReqFavoriteModel): Promise<void> {
  return request(IPC_CHANNEL.CallFavoriteSave, favorite);
}

function updateFavorite(favorite: ReqFavoriteModel): Promise<void> {
  return request(IPC_CHANNEL.CallFavoriteUpdate, favorite);
}

function updateFavoriteOrder(category: { orderNo: number; favoriteSeq: number }[]): Promise<void> {
  return request(IPC_CHANNEL.CallFavoriteUpdateOrder, category);
}

function deleteFavorite(favoriteSeq: number): Promise<void> {
  return request(IPC_CHANNEL.CallFavoriteDelete, favoriteSeq);
}

function getAccountList(): Promise<ResAccountModel[]> {
  return request(IPC_CHANNEL.CallAccountLoad);
}

function saveAccount(account: ReqAccountModel): Promise<void> {
  return request(IPC_CHANNEL.CallAccountSave, account);
}

function updateAccount(account: ReqAccountModel): Promise<void> {
  return request(IPC_CHANNEL.CallAccountUpdate, account);
}

function deleteAccount(accountSeq: number): Promise<void> {
  return request(IPC_CHANNEL.CallAccountDelete, accountSeq);
}

function getStockList(): Promise<ResStockModel[]> {
  return request(IPC_CHANNEL.CallStockLoad);
}

function saveStock(stock: ReqStockModel): Promise<void> {
  return request(IPC_CHANNEL.CallStockSave, stock);
}

function updateStock(stock: ReqStockModel): Promise<void> {
  return request(IPC_CHANNEL.CallStockUpdate, stock);
}

function deleteStock(stockSeq: number): Promise<void> {
  return request(IPC_CHANNEL.CallStockDelete, stockSeq);
}

function getStockBuyList(): Promise<ResStockBuyModel[]> {
  return request(IPC_CHANNEL.CallStockBuyLoad);
}

function saveStockBuy(stockBuy: ReqStockBuyModel): Promise<void> {
  return request(IPC_CHANNEL.CallStockBuySave, stockBuy);
}

function updateStockBuy(stockBuy: ReqStockBuyModel): Promise<void> {
  return request(IPC_CHANNEL.CallStockBuyUpdate, stockBuy);
}

function deleteStockBuy(stockBuySeq: number): Promise<void> {
  return request(IPC_CHANNEL.CallStockBuyDelete, stockBuySeq);
}

function getTransactionList(searchModel: ReqSearchModel): Promise<ResTransactionModel[]> {
  return request(IPC_CHANNEL.CallTransactionList, searchModel);
}

function getTransaction(transactionSeq: number): Promise<ResTransactionModel> {
  return request(IPC_CHANNEL.CallTransactionGet, transactionSeq);
}

function getTransactionMonthlyFinancialSummary(searchModel: ReqMonthlySummaryModel): Promise<ResTransactionSummary[]> {
  return request(IPC_CHANNEL.CallTransactionMonthlyFinancialSummary, searchModel);
}

function getTransactionMonthlyAmountSum(searchModel: ReqMonthlyAmountSumModel): Promise<ResTransactionSum[]> {
  return request(IPC_CHANNEL.CallTransactionMonthlyAmountSum, searchModel);
}

function getTransactionCategoryByNote(kind: TransactionKind, note: string): Promise<number[]> {
  return request(IPC_CHANNEL.CallTransactionCategoryByNote, { kind, note });
}

function saveTransaction(transaction: ReqTransactionModel): Promise<void> {
  return request(IPC_CHANNEL.CallTransactionSave, transaction);
}

function updateTransaction(transaction: ReqTransactionModel): Promise<void> {
  return request(IPC_CHANNEL.CallTransactionUpdate, transaction);
}

function deleteTransaction(transactionSeq: number): Promise<void> {
  return request(IPC_CHANNEL.CallTransactionDelete, transactionSeq);
}

function getTradeList(searchModel: ReqSearchModel): Promise<ResTradeModel[]> {
  return request(IPC_CHANNEL.CallTradeList, searchModel);
}

function getTradeMonthlyAmountSum(searchModel: ReqMonthlyAmountSumModel): Promise<ResTradeSum[]> {
  return request(IPC_CHANNEL.CallTradeMonthlyAmountSum, searchModel);
}

function getTrade(tradeSeq: number): Promise<ResTradeModel> {
  return request(IPC_CHANNEL.CallTradeGet, tradeSeq);
}

function saveTrade(trade: ReqTradeModel): Promise<void> {
  return request(IPC_CHANNEL.CallTradeSave, trade);
}

function updateTrade(trade: ReqTradeModel): Promise<void> {
  return request(IPC_CHANNEL.CallTradeUpdate, trade);
}

function deleteTrade(tradeSeq: number): Promise<void> {
  return request(IPC_CHANNEL.CallTradeDelete, tradeSeq);
}

function getExchangeList(searchModel: ReqSearchModel): Promise<ResExchangeModel[]> {
  return request(IPC_CHANNEL.CallExchangeList, searchModel);
}

function getExchange(exchangeSeq: number): Promise<ResExchangeModel> {
  return request(IPC_CHANNEL.CallExchangeGet, exchangeSeq);
}

function saveExchange(exchange: ReqExchangeModel): Promise<void> {
  return request(IPC_CHANNEL.CallExchangeSave, exchange);
}

function updateExchange(exchange: ReqExchangeModel): Promise<void> {
  return request(IPC_CHANNEL.CallExchangeUpdate, exchange);
}

function deleteExchange(exchangeSeq: number): Promise<void> {
  return request(IPC_CHANNEL.CallExchangeDelete, exchangeSeq);
}

function getMemoList(searchModel: ReqSearchModel): Promise<ResMemoModal[]> {
  return request(IPC_CHANNEL.CallMemoList, searchModel);
}

function getMemo(memoSeq: number): Promise<ResMemoModal> {
  return request(IPC_CHANNEL.CallMemoGet, memoSeq);
}

function getMemoSeqForDate(date: Date): Promise<number> {
  return request(IPC_CHANNEL.CallMemoSeqGetDate, date);
}

function saveMemo(memo: ReqMemoModel): Promise<void> {
  return request(IPC_CHANNEL.CallMemoSave, memo);
}

function updateMemo(memo: ReqMemoModel): Promise<void> {
  return request(IPC_CHANNEL.CallMemoUpdate, memo);
}

function deleteMemo(memoSeq: number): Promise<void> {
  return request(IPC_CHANNEL.CallMemoDelete, memoSeq);
}

function getAssetTrend(condition: ReqAssetTrend): Promise<ResAssetTrend[]> {
  return request(IPC_CHANNEL.CallAssetTrend, condition);
}

function getExchangeRate(): Promise<ExchangeRateModel[]> {
  return request(IPC_CHANNEL.CallStoreExchangeRateGet);
}

function saveExchangeRate(currencyRate: ExchangeRateModel[]): Promise<void> {
  return request(IPC_CHANNEL.CallStoreExchangeRateSave, currencyRate);
}

function getSnapshotPage(page: number): Promise<ResPageModel<ResSnapshotModel>> {
  return request(IPC_CHANNEL.CallSnapshotPage, page);
}

function getSnapshot(snapshotSeq: number): Promise<ResSnapshotModel> {
  return request(IPC_CHANNEL.CallSnapshotGet, snapshotSeq);
}

function saveSnapshot(snapshot: ReqSnapshotModel): Promise<void> {
  return request(IPC_CHANNEL.CallSnapshotSave, snapshot);
}

function updateSnapshot(snapshot: ReqSnapshotModel): Promise<void> {
  return request(IPC_CHANNEL.CallSnapshotUpdate, snapshot);
}

function deleteSnapshot(snapshotSeq: number): Promise<void> {
  return request(IPC_CHANNEL.CallSnapshotDelete, snapshotSeq);
}

function changeUserPassword(changePassword: [string, string]): Promise<void> {
  return request(IPC_CHANNEL.CallUserChangePassword, changePassword);
}

function login(password: string): Promise<boolean> {
  return request(IPC_CHANNEL.CallUserCheckPassword, password);
}

function findDocument(findText: string): Promise<boolean> {
  return request(IPC_CHANNEL.CallFindDocument, findText);
}
const IpcCaller = {
  getCategoryList,
  saveCategory,
  updateCategory,
  updateCategoryOrder,
  deleteCategory,

  getCodeList,
  saveCode,
  updateCode,
  updateCodeOrder,
  deleteCode,

  getFavoriteList,
  saveFavorite,
  updateFavorite,
  updateFavoriteOrder,
  deleteFavorite,

  getAccountList,
  saveAccount,
  updateAccount,
  deleteAccount,

  getStockList,
  saveStock,
  updateStock,
  deleteStock,

  getStockBuyList,
  saveStockBuy,
  updateStockBuy,
  deleteStockBuy,

  getTransactionList,
  getTransactionMonthlyFinancialSummary,
  getTransactionMonthlyAmountSum,
  getTransactionCategoryByNote,
  getTransaction,
  saveTransaction,
  updateTransaction,
  deleteTransaction,

  getTradeList,
  getTradeMonthlyAmountSum,
  getTrade,
  saveTrade,
  updateTrade,
  deleteTrade,

  getExchangeList,
  getExchange,
  saveExchange,
  updateExchange,
  deleteExchange,

  getMemoList,
  getMemo,
  getMemoSeqForDate,
  saveMemo,
  updateMemo,
  deleteMemo,

  getSnapshotPage,
  getSnapshot,
  saveSnapshot,
  updateSnapshot,
  deleteSnapshot,

  getAssetTrend,

  getExchangeRate,
  saveExchangeRate,

  changeUserPassword,
  login,

  findDocument,
};

export default IpcCaller;
