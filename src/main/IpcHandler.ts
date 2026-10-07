import { ipcMain, webContents } from 'electron';
import log from 'electron-log';
import { ExchangeRateModel, IPC_CHANNEL, TransactionKind } from '../common/CommonType';
import registerCategoryHandlers from './ipc/categoryHandlers';
import { RequestArgs, RequestChannel, ResponseValue } from '../common/ipc/Contract';
import createRequestHandler from './ipc/createRequestHandler';
import parseRequest from './ipc/parseRequest';
import UserService from './service/UserService';
import Constant from '../common/Constant';
import CodeService from './service/CodeService';
import {
  ReqAccountModel,
  ReqFavoriteModel,
  ReqAssetTrend,
  ReqCodeModel,
  ReqExchangeModel,
  ReqMemoModel,
  ReqMonthlyAmountSumModel,
  ReqMonthlySummaryModel,
  ReqSearchModel,
  ReqSnapshotModel,
  ReqStockBuyModel,
  ReqStockModel,
  ReqTradeModel,
  ReqTransactionModel,
} from '../common/ReqModel';
import AccountService from './service/AccountService';
import StockService from './service/StockService';
import StockBuyService from './service/StockBuyService';
import FavoriteService from './service/FavoriteService';
import transactionService from './service/TransactionService';
import TradeService from './service/TradeService';
import exchangeService from './service/ExchangeService';
import MemoService from './service/MemoService';
import StatisticService from './service/StatisticService';
import StoreService from './service/StoreService';
import SnapshotService from './service/SnapshotService';

function register<C extends RequestChannel>(channel: C, handler: (...args: RequestArgs<C>) => Promise<ResponseValue<C>> | ResponseValue<C>) {
  ipcMain.handle(
    channel,
    createRequestHandler<C>(
      (args) => parseRequest(channel, args),
      handler,
      (error) => log.error(channel, error),
    ),
  );
}

export default class IpcHandler {
  static registerHandlers() {
    log.info('IpcHandler.registerHandlers()');
    registerCategoryHandlers();

    register(IPC_CHANNEL.CallAccountLoad, this.accountLoad);
    register(IPC_CHANNEL.CallAccountSave, this.accountSave);
    register(IPC_CHANNEL.CallAccountUpdate, this.accountUpdate);
    register(IPC_CHANNEL.CallAccountDelete, this.accountDelete);

    register(IPC_CHANNEL.CallUserCheckPassword, this.userCheckPassword);
    register(IPC_CHANNEL.CallUserChangePassword, this.userChangePassword);

    register(IPC_CHANNEL.CallCodeLoad, this.codeLoad);
    register(IPC_CHANNEL.CallCodeUpdateOrder, this.codeUpdateOrder);
    register(IPC_CHANNEL.CallCodeSave, this.codeSave);
    register(IPC_CHANNEL.CallCodeUpdate, this.codeUpdate);
    register(IPC_CHANNEL.CallCodeDelete, this.codeDelete);

    register(IPC_CHANNEL.CallStockLoad, this.stockLoad);
    register(IPC_CHANNEL.CallStockSave, this.stockSave);
    register(IPC_CHANNEL.CallStockUpdate, this.stockUpdate);
    register(IPC_CHANNEL.CallStockDelete, this.stockDelete);

    register(IPC_CHANNEL.CallStockBuyLoad, this.stockBuyLoad);
    register(IPC_CHANNEL.CallStockBuySave, this.stockBuySave);
    register(IPC_CHANNEL.CallStockBuyUpdate, this.stockBuyUpdate);
    register(IPC_CHANNEL.CallStockBuyDelete, this.stockBuyDelete);

    register(IPC_CHANNEL.CallFavoriteLoad, this.favoriteLoad);
    register(IPC_CHANNEL.CallFavoriteUpdateOrder, this.favoriteUpdateOrder);
    register(IPC_CHANNEL.CallFavoriteSave, this.favoriteSave);
    register(IPC_CHANNEL.CallFavoriteUpdate, this.favoriteUpdate);
    register(IPC_CHANNEL.CallFavoriteDelete, this.favoriteDelete);

    register(IPC_CHANNEL.CallTransactionGet, this.transactionGet);
    register(IPC_CHANNEL.CallTransactionList, this.transactionList);
    register(IPC_CHANNEL.CallTransactionMonthlyFinancialSummary, this.transactionMonthlyFinancialSummary);
    register(IPC_CHANNEL.CallTransactionMonthlyAmountSum, this.transactionMonthlyAmountSum);
    register(IPC_CHANNEL.CallTransactionCategoryByNote, this.transactionCategoryByNote);
    register(IPC_CHANNEL.CallTransactionSave, this.transactionSave);
    register(IPC_CHANNEL.CallTransactionUpdate, this.transactionUpdate);
    register(IPC_CHANNEL.CallTransactionDelete, this.transactionDelete);

    register(IPC_CHANNEL.CallTradeGet, this.tradeGet);
    register(IPC_CHANNEL.CallTradeList, this.tradeList);
    register(IPC_CHANNEL.CallTradeMonthlyAmountSum, this.tradeMonthlyAmountSum);
    register(IPC_CHANNEL.CallTradeSave, this.tradeSave);
    register(IPC_CHANNEL.CallTradeUpdate, this.tradeUpdate);
    register(IPC_CHANNEL.CallTradeDelete, this.tradeDelete);

    register(IPC_CHANNEL.CallExchangeGet, this.exchangeGet);
    register(IPC_CHANNEL.CallExchangeList, this.exchangeList);
    register(IPC_CHANNEL.CallExchangeSave, this.exchangeSave);
    register(IPC_CHANNEL.CallExchangeUpdate, this.exchangeUpdate);
    register(IPC_CHANNEL.CallExchangeDelete, this.exchangeDelete);

    register(IPC_CHANNEL.CallMemoGet, this.memoGet);
    register(IPC_CHANNEL.CallMemoSeqGetDate, this.memoGetDate);
    register(IPC_CHANNEL.CallMemoList, this.memoList);
    register(IPC_CHANNEL.CallMemoSave, this.memoSave);
    register(IPC_CHANNEL.CallMemoUpdate, this.memoUpdate);
    register(IPC_CHANNEL.CallMemoDelete, this.memoDelete);

    register(IPC_CHANNEL.CallAssetTrend, this.assetTrendList);

    register(IPC_CHANNEL.CallSnapshotGet, this.snapshotGet);
    register(IPC_CHANNEL.CallSnapshotPage, this.snapshotPage);
    register(IPC_CHANNEL.CallSnapshotSave, this.snapshotSave);
    register(IPC_CHANNEL.CallSnapshotUpdate, this.snapshotUpdate);
    register(IPC_CHANNEL.CallSnapshotDelete, this.snapshotDelete);

    register(IPC_CHANNEL.CallStoreExchangeRateGet, this.storeExchangeRateGet);
    register(IPC_CHANNEL.CallStoreExchangeRateSave, this.storeExchangeRateSave);

    register(IPC_CHANNEL.CallFindDocument, this.documentFind);
  }

  // --- Account ---
  private static async accountLoad() {
    const accountList = await AccountService.findAll();
    return accountList;
  }

  private static async accountSave(accountForm: ReqAccountModel) {
    await AccountService.save(accountForm);
  }

  private static async accountUpdate(accountForm: ReqAccountModel) {
    await AccountService.update(accountForm);
  }

  private static async accountDelete(accountSeq: number) {
    await AccountService.delete(accountSeq);
  }

  // --- Stock ---
  private static async stockLoad() {
    const stockList = await StockService.findAll();
    return stockList;
  }

  private static async stockSave(stockForm: ReqStockModel) {
    await StockService.save(stockForm);
  }

  private static async stockUpdate(stockForm: ReqStockModel) {
    await StockService.update(stockForm);
  }

  private static async stockDelete(stockSeq: number) {
    await StockService.delete(stockSeq);
  }

  // --- StockBuy ---

  private static async stockBuyLoad() {
    const stockBuyList = await StockBuyService.findStockBuyAll();
    return stockBuyList;
  }

  private static async stockBuySave(stockBuyForm: ReqStockBuyModel) {
    await StockBuyService.saveStockBuy(stockBuyForm);
  }

  private static async stockBuyUpdate(stockBuyForm: ReqStockBuyModel) {
    await StockBuyService.updateStockBuy(stockBuyForm);
  }

  private static async stockBuyDelete(stockBuySeq: number) {
    await StockBuyService.deleteStockBuy(stockBuySeq);
  }

  // --- User ---

  private static async userCheckPassword(password: string) {
    const pass = await UserService.checkPassword(Constant.DEFAULT_USER.userId, password);
    return pass;
  }

  private static async userChangePassword(args: [string, string]) {
    await UserService.changePassword(Constant.DEFAULT_USER.userId, args[0], args[1]);
  }

  // --- CodeList ---
  private static async codeLoad() {
    const result = await CodeService.findAll();
    return result;
  }

  private static async codeUpdateOrder(
    updateInfo: {
      codeItemSeq: number;
      orderNo: number;
    }[],
  ) {
    await CodeService.updateItemOrder(updateInfo);
  }

  private static async codeSave(codeForm: ReqCodeModel) {
    await CodeService.saveItem(codeForm);
  }

  private static async codeUpdate(codeForm: ReqCodeModel) {
    await CodeService.update(codeForm);
  }

  private static async codeDelete(codeItemSeq: number) {
    await CodeService.deleteItem(codeItemSeq);
  }

  // --- Favorite ---
  private static async favoriteLoad() {
    const result = await FavoriteService.findAll();
    return result;
  }

  private static async favoriteUpdateOrder(
    updateInfo: {
      favoriteSeq: number;
      orderNo: number;
    }[],
  ) {
    await FavoriteService.updateOrder(updateInfo);
  }

  private static async favoriteSave(favoriteForm: ReqFavoriteModel) {
    await FavoriteService.save(favoriteForm);
  }

  private static async favoriteUpdate(favoriteForm: ReqFavoriteModel) {
    await FavoriteService.update(favoriteForm);
  }

  private static async favoriteDelete(favoriteSeq: number) {
    await FavoriteService.delete(favoriteSeq);
  }

  // --- Transaction ---
  private static async transactionGet(transactionSeq: number) {
    const result = await transactionService.get(transactionSeq);
    return result;
  }

  private static async transactionList(condition: ReqSearchModel) {
    const result = await transactionService.findList(condition);
    return result;
  }

  private static async transactionMonthlyFinancialSummary(condition: ReqMonthlySummaryModel) {
    const result = await transactionService.getMonthlySummary(condition);
    return result;
  }

  private static async transactionMonthlyAmountSum(condition: ReqMonthlyAmountSumModel) {
    const result = await transactionService.getMonthlyAmountSum(condition);
    return result;
  }

  private static async transactionCategoryByNote(condition: { kind: TransactionKind; note: string }) {
    const result = await transactionService.findCategoryByNote(condition.kind, condition.note);
    return result;
  }

  private static async transactionSave(transactionForm: ReqTransactionModel) {
    await transactionService.save(transactionForm);
  }

  private static async transactionUpdate(transactionForm: ReqTransactionModel) {
    await transactionService.update(transactionForm);
  }

  private static async transactionDelete(transactionSeq: number) {
    await transactionService.delete(transactionSeq);
  }

  // --- Trade ---
  private static async tradeGet(tradeSeq: number) {
    const result = await TradeService.get(tradeSeq);
    return result;
  }

  private static async tradeList(condition: ReqSearchModel) {
    const result = await TradeService.findList(condition);
    return result;
  }

  private static async tradeMonthlyAmountSum(condition: ReqMonthlyAmountSumModel) {
    const result = await TradeService.getMonthlyAmountSum(condition);
    return result;
  }

  private static async tradeSave(tradeForm: ReqTradeModel) {
    await TradeService.save(tradeForm);
  }

  private static async tradeUpdate(tradeForm: ReqTradeModel) {
    await TradeService.update(tradeForm);
  }

  private static async tradeDelete(tradeSeq: number) {
    await TradeService.delete(tradeSeq);
  }

  // --- Exchange ---
  private static async exchangeGet(exchangeSeq: number) {
    const result = await exchangeService.get(exchangeSeq);
    return result;
  }

  private static async exchangeList(condition: ReqSearchModel) {
    const result = await exchangeService.findList(condition);
    return result;
  }

  private static async exchangeSave(exchangeForm: ReqExchangeModel) {
    await exchangeService.save(exchangeForm);
  }

  private static async exchangeUpdate(exchangeForm: ReqExchangeModel) {
    await exchangeService.update(exchangeForm);
  }

  private static async exchangeDelete(exchangeSeq: number) {
    await exchangeService.delete(exchangeSeq);
  }

  // --- Memo ---
  private static async memoGet(memoSeq: number) {
    const result = await MemoService.get(memoSeq);
    return result;
  }

  private static async memoGetDate(date: Date) {
    const result = await MemoService.getSeqForDate(date);
    return result;
  }

  private static async memoList(condition: ReqSearchModel) {
    const result = await MemoService.findList(condition);
    return result;
  }

  private static async memoSave(memoForm: ReqMemoModel) {
    await MemoService.save(memoForm);
  }

  private static async memoUpdate(memoForm: ReqMemoModel) {
    await MemoService.update(memoForm);
  }

  private static async memoDelete(memoSeq: number) {
    await MemoService.delete(memoSeq);
  }

  // --- Snapshot ---
  private static async snapshotGet(snapshotSeq: number) {
    const result = await SnapshotService.get(snapshotSeq);
    return result;
  }

  /**
   * @param page 1부터 시작
   */
  private static async snapshotPage(page: number) {
    const result = await SnapshotService.findPage(page);
    return result;
  }

  private static async snapshotSave(snapshotForm: ReqSnapshotModel) {
    await SnapshotService.save(snapshotForm);
  }

  private static async snapshotUpdate(snapshotForm: ReqSnapshotModel) {
    await SnapshotService.update(snapshotForm);
  }

  private static async snapshotDelete(snapshotSeq: number) {
    await SnapshotService.delete(snapshotSeq);
  }

  // --- Statistic ---
  private static async assetTrendList(condition: ReqAssetTrend) {
    const result = await StatisticService.getAssetTrend(condition);
    return result;
  }

  // --- Store ---
  private static async storeExchangeRateGet() {
    const currencyRate = StoreService.getExchangeRate();
    return currencyRate;
  }

  private static async storeExchangeRateSave(currencyRate: ExchangeRateModel[]) {
    StoreService.saveCurrencyRate(currencyRate);
  }

  // --- Find ----
  private static async documentFind(findText: string) {
    const focusedWebContents = webContents.getFocusedWebContents();
    if (!focusedWebContents) {
      return false;
    }
    if (findText) {
      focusedWebContents.findInPage(findText);
    } else {
      focusedWebContents.stopFindInPage('clearSelection');
    }

    return true;
  }
}
