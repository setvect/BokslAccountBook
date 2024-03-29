import { ipcMain, IpcMainEvent, webContents } from 'electron';
import log from 'electron-log';
import { ExchangeRateModel, IPC_CHANNEL, TransactionKind } from '../common/CommonType';
import CategoryService from './service/CategoryService';
import { ResErrorModel } from '../common/ResModel';
import UserService from './service/UserService';
import Constant from '../common/Constant';
import CodeService from './service/CodeService';
import {
  ReqAssetTrend,
  ReqCategoryModel,
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
import TransactionService from './service/TransactionService';
import TradeService from './service/TradeService';
import ExchangeService from './service/ExchangeService';
import MemoService from './service/MemoService';
import StatisticService from './service/StatisticService';
import StoreService from './service/StoreService';
import SnapshotService from './service/SnapshotService';

function withTryCatch(handler: (event: IpcMainEvent, ...args: any[]) => Promise<void>) {
  return async (event: IpcMainEvent, ...args: any[]) => {
    try {
      await handler(event, ...args);
    } catch (error: any) {
      let resError: ResErrorModel;
      if (error instanceof Error) {
        log.error('Error message:', error.message);
        console.log('Error message:', error.message);
        console.log('Error stack', error.stack);

        resError = { message: error.message };
      } else {
        log.error('Unknown error:', error);
        resError = { message: '알려지지 않은 예외가 발생했어요.' };
      }
      event.reply(IPC_CHANNEL.ErrorCommon, resError);
    }
  };
}

export default class IpcHandler {
  static registerHandlers() {
    log.info('IpcHandler.registerHandlers()');
    ipcMain.on(IPC_CHANNEL.CallCategoryLoad, withTryCatch(this.categoryLoad));
    ipcMain.on(IPC_CHANNEL.CallCategoryUpdateOrder, withTryCatch(this.categoryUpdateOrder));
    ipcMain.on(IPC_CHANNEL.CallCategorySave, withTryCatch(this.categorySave));
    ipcMain.on(IPC_CHANNEL.CallCategoryUpdate, withTryCatch(this.categoryUpdate));
    ipcMain.on(IPC_CHANNEL.CallCategoryDelete, withTryCatch(this.categoryDelete));

    ipcMain.on(IPC_CHANNEL.CallAccountLoad, withTryCatch(this.accountLoad));
    ipcMain.on(IPC_CHANNEL.CallAccountSave, withTryCatch(this.accountSave));
    ipcMain.on(IPC_CHANNEL.CallAccountUpdate, withTryCatch(this.accountUpdate));
    ipcMain.on(IPC_CHANNEL.CallAccountDelete, withTryCatch(this.accountDelete));

    ipcMain.on(IPC_CHANNEL.CallUserCheckPassword, withTryCatch(this.userCheckPassword));
    ipcMain.on(IPC_CHANNEL.CallUserChangePassword, withTryCatch(this.userChangePassword));

    ipcMain.on(IPC_CHANNEL.CallCodeLoad, withTryCatch(this.codeLoad));
    ipcMain.on(IPC_CHANNEL.CallCodeUpdateOrder, withTryCatch(this.codeUpdateOrder));
    ipcMain.on(IPC_CHANNEL.CallCodeSave, withTryCatch(this.codeSave));
    ipcMain.on(IPC_CHANNEL.CallCodeUpdate, withTryCatch(this.codeUpdate));
    ipcMain.on(IPC_CHANNEL.CallCodeDelete, withTryCatch(this.codeDelete));

    ipcMain.on(IPC_CHANNEL.CallStockLoad, withTryCatch(this.stockLoad));
    ipcMain.on(IPC_CHANNEL.CallStockSave, withTryCatch(this.stockSave));
    ipcMain.on(IPC_CHANNEL.CallStockUpdate, withTryCatch(this.stockUpdate));
    ipcMain.on(IPC_CHANNEL.CallStockDelete, withTryCatch(this.stockDelete));

    ipcMain.on(IPC_CHANNEL.CallStockBuyLoad, withTryCatch(this.stockBuyLoad));
    ipcMain.on(IPC_CHANNEL.CallStockBuySave, withTryCatch(this.stockBuySave));
    ipcMain.on(IPC_CHANNEL.CallStockBuyUpdate, withTryCatch(this.stockBuyUpdate));
    ipcMain.on(IPC_CHANNEL.CallStockBuyDelete, withTryCatch(this.stockBuyDelete));

    ipcMain.on(IPC_CHANNEL.CallFavoriteLoad, withTryCatch(this.favoriteLoad));
    ipcMain.on(IPC_CHANNEL.CallFavoriteUpdateOrder, withTryCatch(this.favoriteUpdateOrder));
    ipcMain.on(IPC_CHANNEL.CallFavoriteSave, withTryCatch(this.favoriteSave));
    ipcMain.on(IPC_CHANNEL.CallFavoriteUpdate, withTryCatch(this.favoriteUpdate));
    ipcMain.on(IPC_CHANNEL.CallFavoriteDelete, withTryCatch(this.favoriteDelete));

    ipcMain.on(IPC_CHANNEL.CallTransactionGet, withTryCatch(this.transactionGet));
    ipcMain.on(IPC_CHANNEL.CallTransactionList, withTryCatch(this.transactionList));
    ipcMain.on(IPC_CHANNEL.CallTransactionMonthlyFinancialSummary, withTryCatch(this.transactionMonthlyFinancialSummary));
    ipcMain.on(IPC_CHANNEL.CallTransactionMonthlyAmountSum, withTryCatch(this.transactionMonthlyAmountSum));
    ipcMain.on(IPC_CHANNEL.CallTransactionCategoryByNote, withTryCatch(this.transactionCategoryByNote));
    ipcMain.on(IPC_CHANNEL.CallTransactionSave, withTryCatch(this.transactionSave));
    ipcMain.on(IPC_CHANNEL.CallTransactionUpdate, withTryCatch(this.transactionUpdate));
    ipcMain.on(IPC_CHANNEL.CallTransactionDelete, withTryCatch(this.transactionDelete));

    ipcMain.on(IPC_CHANNEL.CallTradeGet, withTryCatch(this.tradeGet));
    ipcMain.on(IPC_CHANNEL.CallTradeList, withTryCatch(this.tradeList));
    ipcMain.on(IPC_CHANNEL.CallTradeMonthlyAmountSum, withTryCatch(this.tradeMonthlyAmountSum));
    ipcMain.on(IPC_CHANNEL.CallTradeSave, withTryCatch(this.tradeSave));
    ipcMain.on(IPC_CHANNEL.CallTradeUpdate, withTryCatch(this.tradeUpdate));
    ipcMain.on(IPC_CHANNEL.CallTradeDelete, withTryCatch(this.tradeDelete));

    ipcMain.on(IPC_CHANNEL.CallExchangeGet, withTryCatch(this.exchangeGet));
    ipcMain.on(IPC_CHANNEL.CallExchangeList, withTryCatch(this.exchangeList));
    ipcMain.on(IPC_CHANNEL.CallExchangeSave, withTryCatch(this.exchangeSave));
    ipcMain.on(IPC_CHANNEL.CallExchangeUpdate, withTryCatch(this.exchangeUpdate));
    ipcMain.on(IPC_CHANNEL.CallExchangeDelete, withTryCatch(this.exchangeDelete));

    ipcMain.on(IPC_CHANNEL.CallMemoGet, withTryCatch(this.memoGet));
    ipcMain.on(IPC_CHANNEL.CallMemoSeqGetDate, withTryCatch(this.memoGetDate));
    ipcMain.on(IPC_CHANNEL.CallMemoList, withTryCatch(this.memoList));
    ipcMain.on(IPC_CHANNEL.CallMemoSave, withTryCatch(this.memoSave));
    ipcMain.on(IPC_CHANNEL.CallMemoUpdate, withTryCatch(this.memoUpdate));
    ipcMain.on(IPC_CHANNEL.CallMemoDelete, withTryCatch(this.memoDelete));

    ipcMain.on(IPC_CHANNEL.CallAssetTrend, withTryCatch(this.assetTrendList));

    ipcMain.on(IPC_CHANNEL.CallSnapshotGet, withTryCatch(this.snapshotGet));
    ipcMain.on(IPC_CHANNEL.CallSnapshotPage, withTryCatch(this.snapshotPage));
    ipcMain.on(IPC_CHANNEL.CallSnapshotSave, withTryCatch(this.snapshotSave));
    ipcMain.on(IPC_CHANNEL.CallSnapshotUpdate, withTryCatch(this.snapshotUpdate));
    ipcMain.on(IPC_CHANNEL.CallSnapshotDelete, withTryCatch(this.snapshotDelete));

    ipcMain.on(IPC_CHANNEL.CallStoreExchangeRateGet, withTryCatch(this.storeExchangeRateGet));
    ipcMain.on(IPC_CHANNEL.CallStoreExchangeRateSave, withTryCatch(this.storeExchangeRateSave));

    ipcMain.on(IPC_CHANNEL.CallFindDocument, withTryCatch(this.documentFind));
  }

  //  --- CategoryList ---
  private static async categoryLoad(event: IpcMainEvent, eventId: string) {
    log.info('IpcHandler.categoryLoad()');
    const categoryList = await CategoryService.findAll();

    event.reply(eventId, categoryList);
  }

  private static async categoryUpdateOrder(
    event: IpcMainEvent,
    eventId: string,
    updateInfo: {
      categorySeq: number;
      orderNo: number;
    }[],
  ) {
    await CategoryService.updateOrder(updateInfo);
    event.reply(eventId, true);
  }

  private static async categorySave(event: IpcMainEvent, eventId: string, categoryForm: ReqCategoryModel) {
    await CategoryService.save(categoryForm);
    event.reply(eventId, true);
  }

  private static async categoryUpdate(event: IpcMainEvent, eventId: string, categoryForm: ReqCategoryModel) {
    await CategoryService.update(categoryForm);
    event.reply(eventId, true);
  }

  private static async categoryDelete(event: IpcMainEvent, eventId: string, categorySeq: number) {
    await CategoryService.delete(categorySeq);
    event.reply(eventId, true);
  }

  // --- Account ---
  private static async accountLoad(event: IpcMainEvent, eventId: string) {
    const accountList = await AccountService.findAll();
    event.reply(eventId, accountList);
  }

  private static async accountSave(event: IpcMainEvent, eventId: string, accountForm: any) {
    await AccountService.save(accountForm);
    event.reply(eventId, true);
  }

  private static async accountUpdate(event: IpcMainEvent, eventId: string, accountForm: any) {
    await AccountService.update(accountForm);
    event.reply(eventId, true);
  }

  private static async accountDelete(event: IpcMainEvent, eventId: string, accountSeq: number) {
    await AccountService.delete(accountSeq);
    event.reply(eventId, true);
  }

  // --- Stock ---
  private static async stockLoad(event: IpcMainEvent, eventId: string) {
    const stockList = await StockService.findAll();
    event.reply(eventId, stockList);
  }

  private static async stockSave(event: IpcMainEvent, eventId: string, stockForm: ReqStockModel) {
    await StockService.save(stockForm);
    event.reply(eventId, true);
  }

  private static async stockUpdate(event: IpcMainEvent, eventId: string, stockForm: ReqStockModel) {
    await StockService.update(stockForm);
    event.reply(eventId, true);
  }

  private static async stockDelete(event: IpcMainEvent, eventId: string, stockSeq: number) {
    await StockService.delete(stockSeq);
    event.reply(eventId, true);
  }

  // --- StockBuy ---

  private static async stockBuyLoad(event: IpcMainEvent, eventId: string) {
    const stockBuyList = await StockBuyService.findStockBuyAll();
    event.reply(eventId, stockBuyList);
  }

  private static async stockBuySave(event: IpcMainEvent, eventId: string, stockBuyForm: ReqStockBuyModel) {
    await StockBuyService.saveStockBuy(stockBuyForm);
    event.reply(eventId, true);
  }

  private static async stockBuyUpdate(event: IpcMainEvent, eventId: string, stockBuyForm: ReqStockBuyModel) {
    await StockBuyService.updateStockBuy(stockBuyForm);
    event.reply(eventId, true);
  }

  private static async stockBuyDelete(event: IpcMainEvent, eventId: string, stockBuySeq: number) {
    await StockBuyService.deleteStockBuy(stockBuySeq);
    event.reply(eventId, true);
  }

  // --- User ---

  private static async userCheckPassword(event: IpcMainEvent, eventId: string, password: string) {
    const pass = await UserService.checkPassword(Constant.DEFAULT_USER.userId, password);
    event.reply(eventId, pass);
  }

  private static async userChangePassword(event: IpcMainEvent, eventId: string, args: any) {
    await UserService.changePassword(Constant.DEFAULT_USER.userId, args[0], args[1]);
    event.reply(eventId, true);
  }

  // --- CodeList ---
  private static async codeLoad(event: IpcMainEvent, eventId: string) {
    const result = await CodeService.findAll();
    event.reply(eventId, result);
  }

  private static async codeUpdateOrder(
    event: IpcMainEvent,
    eventId: string,
    updateInfo: {
      codeItemSeq: number;
      orderNo: number;
    }[],
  ) {
    await CodeService.updateItemOrder(updateInfo);
    event.reply(eventId, true);
  }

  private static async codeSave(event: IpcMainEvent, eventId: string, codeForm: ReqCodeModel) {
    await CodeService.saveItem(codeForm);
    event.reply(eventId, true);
  }

  private static async codeUpdate(event: IpcMainEvent, eventId: string, codeForm: ReqCodeModel) {
    await CodeService.update(codeForm);
    event.reply(eventId, true);
  }

  private static async codeDelete(event: IpcMainEvent, eventId: string, codeItemSeq: number) {
    await CodeService.deleteItem(codeItemSeq);
    event.reply(eventId, true);
  }

  // --- Favorite ---
  private static async favoriteLoad(event: IpcMainEvent, eventId: string) {
    const result = await FavoriteService.findAll();
    event.reply(eventId, result);
  }

  private static async favoriteUpdateOrder(
    event: IpcMainEvent,
    eventId: string,
    updateInfo: {
      favoriteSeq: number;
      orderNo: number;
    }[],
  ) {
    await FavoriteService.updateOrder(updateInfo);
    event.reply(eventId, true);
  }

  private static async favoriteSave(event: IpcMainEvent, eventId: string, favoriteForm: any) {
    await FavoriteService.save(favoriteForm);
    event.reply(eventId, true);
  }

  private static async favoriteUpdate(event: IpcMainEvent, eventId: string, favoriteForm: any) {
    await FavoriteService.update(favoriteForm);
    event.reply(eventId, true);
  }

  private static async favoriteDelete(event: IpcMainEvent, eventId: string, favoriteSeq: number) {
    await FavoriteService.delete(favoriteSeq);
    event.reply(eventId, true);
  }

  // --- Transaction ---
  private static async transactionGet(event: IpcMainEvent, eventId: string, transactionSeq: number) {
    const result = await TransactionService.get(transactionSeq);
    event.reply(eventId, result);
  }

  private static async transactionList(event: IpcMainEvent, eventId: string, condition: ReqSearchModel) {
    const result = await TransactionService.findList(condition);
    event.reply(eventId, result);
  }

  private static async transactionMonthlyFinancialSummary(event: IpcMainEvent, eventId: string, condition: ReqMonthlySummaryModel) {
    const result = await TransactionService.getMonthlySummary(condition);
    event.reply(eventId, result);
  }

  private static async transactionMonthlyAmountSum(event: IpcMainEvent, eventId: string, condition: ReqMonthlyAmountSumModel) {
    const result = await TransactionService.getMonthlyAmountSum(condition);
    event.reply(eventId, result);
  }

  private static async transactionCategoryByNote(event: IpcMainEvent, eventId: string, condition: { kind: TransactionKind; note: string }) {
    const result = await TransactionService.findCategoryByNote(condition.kind, condition.note);
    event.reply(eventId, result);
  }

  private static async transactionSave(event: IpcMainEvent, eventId: string, transactionForm: ReqTransactionModel) {
    await TransactionService.save(transactionForm);
    event.reply(eventId, true);
  }

  private static async transactionUpdate(event: IpcMainEvent, eventId: string, transactionForm: ReqTransactionModel) {
    await TransactionService.update(transactionForm);
    event.reply(eventId, true);
  }

  private static async transactionDelete(event: IpcMainEvent, eventId: string, transactionSeq: number) {
    await TransactionService.delete(transactionSeq);
    event.reply(eventId, true);
  }

  // --- Trade ---
  private static async tradeGet(event: IpcMainEvent, eventId: string, tradeSeq: number) {
    const result = await TradeService.get(tradeSeq);
    event.reply(eventId, result);
  }

  private static async tradeList(event: IpcMainEvent, eventId: string, condition: ReqSearchModel) {
    const result = await TradeService.findList(condition);
    event.reply(eventId, result);
  }

  private static async tradeMonthlyAmountSum(event: IpcMainEvent, eventId: string, condition: ReqMonthlyAmountSumModel) {
    const result = await TradeService.getMonthlyAmountSum(condition);
    event.reply(eventId, result);
  }

  private static async tradeSave(event: IpcMainEvent, eventId: string, tradeForm: ReqTradeModel) {
    await TradeService.save(tradeForm);
    event.reply(eventId, true);
  }

  private static async tradeUpdate(event: IpcMainEvent, eventId: string, tradeForm: ReqTradeModel) {
    await TradeService.update(tradeForm);
    event.reply(eventId, true);
  }

  private static async tradeDelete(event: IpcMainEvent, eventId: string, tradeSeq: number) {
    await TradeService.delete(tradeSeq);
    event.reply(eventId, true);
  }

  // --- Exchange ---
  private static async exchangeGet(event: IpcMainEvent, eventId: string, exchangeSeq: number) {
    const result = await ExchangeService.get(exchangeSeq);
    event.reply(eventId, result);
  }

  private static async exchangeList(event: IpcMainEvent, eventId: string, condition: ReqSearchModel) {
    const result = await ExchangeService.findList(condition);
    event.reply(eventId, result);
  }

  private static async exchangeSave(event: IpcMainEvent, eventId: string, exchangeForm: ReqExchangeModel) {
    await ExchangeService.save(exchangeForm);
    event.reply(eventId, true);
  }

  private static async exchangeUpdate(event: IpcMainEvent, eventId: string, exchangeForm: ReqExchangeModel) {
    await ExchangeService.update(exchangeForm);
    event.reply(eventId, true);
  }

  private static async exchangeDelete(event: IpcMainEvent, eventId: string, exchangeSeq: number) {
    await ExchangeService.delete(exchangeSeq);
    event.reply(eventId, true);
  }

  // --- Memo ---
  private static async memoGet(event: IpcMainEvent, eventId: string, memoSeq: number) {
    const result = await MemoService.get(memoSeq);
    event.reply(eventId, result);
  }

  private static async memoGetDate(event: IpcMainEvent, eventId: string, date: Date) {
    const result = await MemoService.getSeqForDate(date);
    event.reply(eventId, result);
  }

  private static async memoList(event: IpcMainEvent, eventId: string, condition: ReqSearchModel) {
    const result = await MemoService.findList(condition);
    event.reply(eventId, result);
  }

  private static async memoSave(event: IpcMainEvent, eventId: string, memoForm: ReqMemoModel) {
    await MemoService.save(memoForm);
    event.reply(eventId, true);
  }

  private static async memoUpdate(event: IpcMainEvent, eventId: string, memoForm: ReqMemoModel) {
    await MemoService.update(memoForm);
    event.reply(eventId, true);
  }

  private static async memoDelete(event: IpcMainEvent, eventId: string, memoSeq: number) {
    await MemoService.delete(memoSeq);
    event.reply(eventId, true);
  }

  // --- Snapshot ---
  private static async snapshotGet(event: IpcMainEvent, eventId: string, snapshotSeq: number) {
    const result = await SnapshotService.get(snapshotSeq);
    event.reply(eventId, result);
  }

  /**
   * @param page 1부터 시작
   */
  private static async snapshotPage(event: IpcMainEvent, eventId: string, page: number) {
    const result = await SnapshotService.findPage(page);
    event.reply(eventId, result);
  }

  private static async snapshotSave(event: IpcMainEvent, eventId: string, snapshotForm: ReqSnapshotModel) {
    await SnapshotService.save(snapshotForm);
    event.reply(eventId, true);
  }

  private static async snapshotUpdate(event: IpcMainEvent, eventId: string, snapshotForm: ReqSnapshotModel) {
    await SnapshotService.update(snapshotForm);
    event.reply(eventId, true);
  }

  private static async snapshotDelete(event: IpcMainEvent, eventId: string, snapshotSeq: number) {
    await SnapshotService.delete(snapshotSeq);
    event.reply(eventId, true);
  }

  // --- Statistic ---
  private static async assetTrendList(event: IpcMainEvent, eventId: string, condition: ReqAssetTrend) {
    const result = await StatisticService.getAssetTrend(condition);
    event.reply(eventId, result);
  }

  // --- Store ---
  private static async storeExchangeRateGet(event: IpcMainEvent, eventId: string) {
    const currencyRate = StoreService.getExchangeRate();
    event.reply(eventId, currencyRate);
  }

  private static async storeExchangeRateSave(event: IpcMainEvent, eventId: string, currencyRate: ExchangeRateModel[]) {
    StoreService.saveCurrencyRate(currencyRate);
    event.reply(eventId, true);
  }

  // --- Find ----
  private static async documentFind(event: IpcMainEvent, eventId: string, findText: string) {
    const focusedWebContents = webContents.getFocusedWebContents();
    if (!focusedWebContents) {
      return;
    }
    if (findText) {
      focusedWebContents.findInPage(findText);
    } else {
      focusedWebContents.stopFindInPage('clearSelection');
    }

    event.reply(eventId, true);
  }
}
