import { ipcMain, IpcMainEvent } from 'electron';
import log from 'electron-log';
import { IPC_CHANNEL } from '../common/CommonType';
import CategoryService from './service/CategoryService';
import { ResErrorModel, ResSearchModel } from '../common/ResModel';
import UserService from './service/UserService';
import Constant from '../common/Constant';
import CodeService from './service/CodeService';
import { CategoryFrom, CodeFrom, ExchangeForm, MemoForm, StockBuyForm, StockForm, TradeForm, TransactionForm } from '../common/ReqModel';
import AccountService from './service/AccountService';
import StockService from './service/StockService';
import StockBuyService from './service/StockBuyService';
import FavoriteService from './service/FavoriteService';
import TransactionService from './service/TransactionService';
import TradeService from './service/TradeService';
import ExchangeService from './service/ExchangeService';
import MemoService from './service/MemoService';

function withTryCatch(handler: (event: IpcMainEvent, ...args: any[]) => Promise<void>) {
  return async (event: IpcMainEvent, ...args: any[]) => {
    try {
      await handler(event, ...args);
    } catch (error: any) {
      let resError: ResErrorModel;
      if (error instanceof Error) {
        log.error('Error message:', error.message);
        log.error('stock', error.stack);
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
    ipcMain.on(IPC_CHANNEL.CallTransactionSave, withTryCatch(this.transactionSave));
    ipcMain.on(IPC_CHANNEL.CallTransactionUpdate, withTryCatch(this.transactionUpdate));
    ipcMain.on(IPC_CHANNEL.CallTransactionDelete, withTryCatch(this.transactionDelete));

    ipcMain.on(IPC_CHANNEL.CallTradeGet, withTryCatch(this.tradeGet));
    ipcMain.on(IPC_CHANNEL.CallTradeList, withTryCatch(this.tradeList));
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
  }

  //  --- CategoryList ---
  private static async categoryLoad(event: IpcMainEvent, eventId: string) {
    log.info('IpcHandler.categoryLoad()');
    const categoryList = await CategoryService.findCategoryAll();

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
    await CategoryService.updateCategoryOrder(updateInfo);
    event.reply(eventId, true);
  }

  private static async categorySave(event: IpcMainEvent, eventId: string, categoryForm: CategoryFrom) {
    await CategoryService.saveCategory(categoryForm);
    event.reply(eventId, true);
  }

  private static async categoryUpdate(event: IpcMainEvent, eventId: string, categoryForm: CategoryFrom) {
    await CategoryService.updateCategory(categoryForm);
    event.reply(eventId, true);
  }

  private static async categoryDelete(event: IpcMainEvent, eventId: string, categorySeq: number) {
    await CategoryService.deleteCategory(categorySeq);
    event.reply(eventId, true);
  }

  // --- Account ---
  private static async accountLoad(event: IpcMainEvent, eventId: string) {
    const accountList = await AccountService.findAccountAll();
    event.reply(eventId, accountList);
  }

  private static async accountSave(event: IpcMainEvent, eventId: string, accountForm: any) {
    await AccountService.saveAccount(accountForm);
    event.reply(eventId, true);
  }

  private static async accountUpdate(event: IpcMainEvent, eventId: string, accountForm: any) {
    await AccountService.updateAccount(accountForm);
    event.reply(eventId, true);
  }

  private static async accountDelete(event: IpcMainEvent, eventId: string, accountSeq: number) {
    await AccountService.deleteAccount(accountSeq);
    event.reply(eventId, true);
  }

  // --- Stock ---
  private static async stockLoad(event: IpcMainEvent, eventId: string) {
    const stockList = await StockService.findStockAll();
    event.reply(eventId, stockList);
  }

  private static async stockSave(event: IpcMainEvent, eventId: string, stockForm: StockForm) {
    await StockService.saveStock(stockForm);
    event.reply(eventId, true);
  }

  private static async stockUpdate(event: IpcMainEvent, eventId: string, stockForm: StockForm) {
    await StockService.updateStock(stockForm);
    event.reply(eventId, true);
  }

  private static async stockDelete(event: IpcMainEvent, eventId: string, stockSeq: number) {
    await StockService.deleteStock(stockSeq);
    event.reply(eventId, true);
  }

  // --- StockBuy ---

  private static async stockBuyLoad(event: IpcMainEvent, eventId: string) {
    const stockBuyList = await StockBuyService.findStockAll();
    event.reply(eventId, stockBuyList);
  }

  private static async stockBuySave(event: IpcMainEvent, eventId: string, stockBuyForm: StockBuyForm) {
    await StockBuyService.saveStockBuy(stockBuyForm);
    event.reply(eventId, true);
  }

  private static async stockBuyUpdate(event: IpcMainEvent, eventId: string, stockBuyForm: StockBuyForm) {
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
    const result = await CodeService.findCodeAll();
    event.reply(eventId, result);
  }

  private static async codeUpdateOrder(event: IpcMainEvent, eventId: string, updateInfo: { codeItemSeq: number; orderNo: number }[]) {
    await CodeService.updateCodeItemOrder(updateInfo);
    event.reply(eventId, true);
  }

  private static async codeSave(event: IpcMainEvent, eventId: string, codeForm: CodeFrom) {
    await CodeService.saveCodeItem(codeForm);
    event.reply(eventId, true);
  }

  private static async codeUpdate(event: IpcMainEvent, eventId: string, codeForm: CodeFrom) {
    await CodeService.updateCode(codeForm);
    event.reply(eventId, true);
  }

  private static async codeDelete(event: IpcMainEvent, eventId: string, codeItemSeq: number) {
    await CodeService.deleteCodeItem(codeItemSeq);
    event.reply(eventId, true);
  }

  // --- Favorite ---
  private static async favoriteLoad(event: IpcMainEvent, eventId: string) {
    const result = await FavoriteService.findFavoriteAll();
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
    await FavoriteService.updateFavoriteOrder(updateInfo);
    event.reply(eventId, true);
  }

  private static async favoriteSave(event: IpcMainEvent, eventId: string, favoriteForm: any) {
    await FavoriteService.saveFavorite(favoriteForm);
    event.reply(eventId, true);
  }

  private static async favoriteUpdate(event: IpcMainEvent, eventId: string, favoriteForm: any) {
    await FavoriteService.updateFavorite(favoriteForm);
    event.reply(eventId, true);
  }

  private static async favoriteDelete(event: IpcMainEvent, eventId: string, favoriteSeq: number) {
    await FavoriteService.deleteFavorite(favoriteSeq);
    event.reply(eventId, true);
  }

  // --- Transaction ---
  private static async transactionGet(event: IpcMainEvent, eventId: string, transactionSeq: number) {
    const result = await TransactionService.getTransaction(transactionSeq);
    event.reply(eventId, result);
  }

  private static async transactionList(event: IpcMainEvent, eventId: string, condition: ResSearchModel) {
    const result = await TransactionService.findTransactionList(condition);
    event.reply(eventId, result);
  }

  private static async transactionSave(event: IpcMainEvent, eventId: string, transactionForm: TransactionForm) {
    await TransactionService.saveTransaction(transactionForm);
    event.reply(eventId, true);
  }

  private static async transactionUpdate(event: IpcMainEvent, eventId: string, transactionForm: TransactionForm) {
    await TransactionService.updateTransaction(transactionForm);
    event.reply(eventId, true);
  }

  private static async transactionDelete(event: IpcMainEvent, eventId: string, transactionSeq: number) {
    await TransactionService.deleteTransaction(transactionSeq);
    event.reply(eventId, true);
  }

  // --- Trade ---
  private static async tradeGet(event: IpcMainEvent, eventId: string, tradeSeq: number) {
    const result = await TradeService.getTrade(tradeSeq);
    event.reply(eventId, result);
  }

  private static async tradeList(event: IpcMainEvent, eventId: string, condition: ResSearchModel) {
    const result = await TradeService.findTradeList(condition);
    event.reply(eventId, result);
  }

  private static async tradeSave(event: IpcMainEvent, eventId: string, tradeForm: TradeForm) {
    await TradeService.saveTrade(tradeForm);
    event.reply(eventId, true);
  }

  private static async tradeUpdate(event: IpcMainEvent, eventId: string, tradeForm: TradeForm) {
    await TradeService.updateTrade(tradeForm);
    event.reply(eventId, true);
  }

  private static async tradeDelete(event: IpcMainEvent, eventId: string, tradeSeq: number) {
    await TradeService.deleteTrade(tradeSeq);
    event.reply(eventId, true);
  }

  // --- Exchange ---
  private static async exchangeGet(event: IpcMainEvent, eventId: string, exchangeSeq: number) {
    const result = await ExchangeService.getExchange(exchangeSeq);
    event.reply(eventId, result);
  }

  private static async exchangeList(event: IpcMainEvent, eventId: string, condition: ResSearchModel) {
    const result = await ExchangeService.findExchangeList(condition);
    event.reply(eventId, result);
  }

  private static async exchangeSave(event: IpcMainEvent, eventId: string, exchangeForm: ExchangeForm) {
    await ExchangeService.saveExchange(exchangeForm);
    event.reply(eventId, true);
  }

  private static async exchangeUpdate(event: IpcMainEvent, eventId: string, exchangeForm: ExchangeForm) {
    await ExchangeService.updateExchange(exchangeForm);
    event.reply(eventId, true);
  }

  private static async exchangeDelete(event: IpcMainEvent, eventId: string, exchangeSeq: number) {
    await ExchangeService.deleteExchange(exchangeSeq);
    event.reply(eventId, true);
  }

  // --- Memo ---
  private static async memoGet(event: IpcMainEvent, eventId: string, memoSeq: number) {
    const result = await MemoService.getMemo(memoSeq);
    event.reply(eventId, result);
  }

  private static async memoGetDate(event: IpcMainEvent, eventId: string, date: Date) {
    const result = await MemoService.getMemoSeqForDate(date);
    event.reply(eventId, result);
  }

  private static async memoList(event: IpcMainEvent, eventId: string, condition: ResSearchModel) {
    const result = await MemoService.findMemoList(condition);
    event.reply(eventId, result);
  }

  private static async memoSave(event: IpcMainEvent, eventId: string, memoForm: MemoForm) {
    await MemoService.saveMemo(memoForm);
    event.reply(eventId, true);
  }

  private static async memoUpdate(event: IpcMainEvent, eventId: string, memoForm: MemoForm) {
    await MemoService.updateMemo(memoForm);
    event.reply(eventId, true);
  }

  private static async memoDelete(event: IpcMainEvent, eventId: string, memoSeq: number) {
    await MemoService.deleteMemo(memoSeq);
    event.reply(eventId, true);
  }
}
