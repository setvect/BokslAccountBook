import { ipcMain, IpcMainEvent } from 'electron';
import log from 'electron-log';
import { IPC_CHANNEL } from '../common/CommonType';
import CategoryService from './service/CategoryService';
import { ResErrorModel, ResSearchModel } from '../common/ResModel';
import UserService from './service/UserService';
import Constant from '../common/Constant';
import CodeService from './service/CodeService';
import { CategoryFrom, CodeFrom, StockBuyForm, StockForm, TradeForm, TransactionForm } from '../common/ReqModel';
import AccountService from './service/AccountService';
import StockService from './service/StockService';
import StockBuyService from './service/StockBuyService';
import FavoriteService from './service/FavoriteService';
import TransactionService from './service/TransactionService';
import TradeService from './service/TradeService';

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
    ipcMain.on(IPC_CHANNEL.ipcExample, async (event, arg) => this.ipcExample(event, arg));
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
  }

  private static ipcExample(event: IpcMainEvent, arg: string) {
    const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
    console.log(msgTemplate(arg));
    event.reply(IPC_CHANNEL.ipcExample, msgTemplate('pong'));
  }

  //  --- CategoryList ---
  private static async categoryLoad(event: IpcMainEvent) {
    log.info('IpcHandler.categoryLoad()');
    const categoryList = await CategoryService.findCategoryAll();

    event.reply(IPC_CHANNEL.CallCategoryLoad, categoryList);
  }

  private static async categoryUpdateOrder(
    event: IpcMainEvent,
    updateInfo: {
      categorySeq: number;
      orderNo: number;
    }[],
  ) {
    await CategoryService.updateCategoryOrder(updateInfo);
    event.reply(IPC_CHANNEL.CallCategoryUpdateOrder, true);
  }

  private static async categorySave(event: IpcMainEvent, categoryForm: CategoryFrom) {
    await CategoryService.saveCategory(categoryForm);
    event.reply(IPC_CHANNEL.CallCategorySave, true);
  }

  private static async categoryUpdate(event: IpcMainEvent, categoryForm: CategoryFrom) {
    await CategoryService.updateCategory(categoryForm);
    event.reply(IPC_CHANNEL.CallCategoryUpdate, true);
  }

  private static async categoryDelete(event: IpcMainEvent, categorySeq: number) {
    await CategoryService.deleteCategory(categorySeq);
    event.reply(IPC_CHANNEL.CallCategoryDelete, true);
  }

  // --- Account ---
  private static async accountLoad(event: IpcMainEvent) {
    const accountList = await AccountService.findAccountAll();
    event.reply(IPC_CHANNEL.CallAccountLoad, accountList);
  }

  private static async accountSave(event: IpcMainEvent, accountForm: any) {
    await AccountService.saveAccount(accountForm);
    event.reply(IPC_CHANNEL.CallAccountSave, true);
  }

  private static async accountUpdate(event: IpcMainEvent, accountForm: any) {
    await AccountService.updateAccount(accountForm);
    event.reply(IPC_CHANNEL.CallAccountUpdate, true);
  }

  private static async accountDelete(event: IpcMainEvent, accountSeq: number) {
    await AccountService.deleteAccount(accountSeq);
    event.reply(IPC_CHANNEL.CallAccountDelete, true);
  }

  // --- Stock ---
  private static async stockLoad(event: IpcMainEvent) {
    const stockList = await StockService.findStockAll();
    event.reply(IPC_CHANNEL.CallStockLoad, stockList);
  }

  private static async stockSave(event: IpcMainEvent, stockForm: StockForm) {
    await StockService.saveStock(stockForm);
    event.reply(IPC_CHANNEL.CallStockSave, true);
  }

  private static async stockUpdate(event: IpcMainEvent, stockForm: StockForm) {
    await StockService.updateStock(stockForm);
    event.reply(IPC_CHANNEL.CallStockUpdate, true);
  }

  private static async stockDelete(event: IpcMainEvent, stockSeq: number) {
    await StockService.deleteStock(stockSeq);
    event.reply(IPC_CHANNEL.CallStockDelete, true);
  }

  // --- StockBuy ---

  private static async stockBuyLoad(event: IpcMainEvent) {
    const stockBuyList = await StockBuyService.findStockAll();
    event.reply(IPC_CHANNEL.CallStockBuyLoad, stockBuyList);
  }

  private static async stockBuySave(event: IpcMainEvent, stockBuyForm: StockBuyForm) {
    await StockBuyService.saveStockBuy(stockBuyForm);
    event.reply(IPC_CHANNEL.CallStockBuySave, true);
  }

  private static async stockBuyUpdate(event: IpcMainEvent, stockBuyForm: StockBuyForm) {
    await StockBuyService.updateStockBuy(stockBuyForm);
    event.reply(IPC_CHANNEL.CallStockBuyUpdate, true);
  }

  private static async stockBuyDelete(event: IpcMainEvent, stockBuySeq: number) {
    await StockBuyService.deleteStockBuy(stockBuySeq);
    event.reply(IPC_CHANNEL.CallStockBuyDelete, true);
  }

  // --- User ---

  private static async userCheckPassword(event: IpcMainEvent, password: string) {
    const pass = await UserService.checkPassword(Constant.DEFAULT_USER.userId, password);
    event.reply(IPC_CHANNEL.CallUserCheckPassword, pass);
  }

  private static async userChangePassword(event: IpcMainEvent, args: any) {
    await UserService.changePassword(Constant.DEFAULT_USER.userId, args[0], args[1]);
    event.reply(IPC_CHANNEL.CallUserChangePassword, true);
  }

  // --- CodeList ---
  private static async codeLoad(event: IpcMainEvent) {
    const result = await CodeService.findCodeAll();
    event.reply(IPC_CHANNEL.CallCodeLoad, result);
  }

  private static async codeUpdateOrder(event: IpcMainEvent, updateInfo: { codeItemSeq: number; orderNo: number }[]) {
    await CodeService.updateCodeItemOrder(updateInfo);
    event.reply(IPC_CHANNEL.CallCodeUpdateOrder, true);
  }

  private static async codeSave(event: IpcMainEvent, codeForm: CodeFrom) {
    await CodeService.saveCodeItem(codeForm);
    event.reply(IPC_CHANNEL.CallCodeSave, true);
  }

  private static async codeUpdate(event: IpcMainEvent, codeForm: CodeFrom) {
    await CodeService.updateCode(codeForm);
    event.reply(IPC_CHANNEL.CallCodeUpdate, true);
  }

  private static async codeDelete(event: IpcMainEvent, codeItemSeq: number) {
    await CodeService.deleteCodeItem(codeItemSeq);
    event.reply(IPC_CHANNEL.CallCodeDelete, true);
  }

  // --- Favorite ---
  private static async favoriteLoad(event: IpcMainEvent) {
    const result = await FavoriteService.findFavoriteAll();
    event.reply(IPC_CHANNEL.CallFavoriteLoad, result);
  }

  private static async favoriteUpdateOrder(
    event: IpcMainEvent,
    updateInfo: {
      favoriteSeq: number;
      orderNo: number;
    }[],
  ) {
    await FavoriteService.updateFavoriteOrder(updateInfo);
    event.reply(IPC_CHANNEL.CallFavoriteUpdateOrder, true);
  }

  private static async favoriteSave(event: IpcMainEvent, favoriteForm: any) {
    await FavoriteService.saveFavorite(favoriteForm);
    event.reply(IPC_CHANNEL.CallFavoriteSave, true);
  }

  private static async favoriteUpdate(event: IpcMainEvent, favoriteForm: any) {
    await FavoriteService.updateFavorite(favoriteForm);
    event.reply(IPC_CHANNEL.CallFavoriteUpdate, true);
  }

  private static async favoriteDelete(event: IpcMainEvent, favoriteSeq: number) {
    await FavoriteService.deleteFavorite(favoriteSeq);
    event.reply(IPC_CHANNEL.CallFavoriteDelete, true);
  }

  // --- Transaction ---
  private static async transactionGet(event: IpcMainEvent, transactionSeq: number) {
    const result = await TransactionService.getTransaction(transactionSeq);
    event.reply(IPC_CHANNEL.CallTransactionGet, result);
  }

  private static async transactionList(event: IpcMainEvent, condition: ResSearchModel) {
    const result = await TransactionService.findTransactionList(condition);
    event.reply(IPC_CHANNEL.CallTransactionList, result);
  }

  private static async transactionSave(event: IpcMainEvent, transactionForm: TransactionForm) {
    await TransactionService.saveTransaction(transactionForm);
    event.reply(IPC_CHANNEL.CallTransactionSave, true);
  }

  private static async transactionUpdate(event: IpcMainEvent, transactionForm: TransactionForm) {
    await TransactionService.updateTransaction(transactionForm);
    event.reply(IPC_CHANNEL.CallTransactionUpdate, true);
  }

  private static async transactionDelete(event: IpcMainEvent, transactionSeq: number) {
    await TransactionService.deleteTransaction(transactionSeq);
    event.reply(IPC_CHANNEL.CallTransactionDelete, true);
  }

  // --- Trade ---
  private static async tradeGet(event: IpcMainEvent, tradeSeq: number) {
    const result = await TradeService.getTrade(tradeSeq);
    event.reply(IPC_CHANNEL.CallTradeGet, result);
  }

  private static async tradeList(event: IpcMainEvent, condition: ResSearchModel) {
    const result = await TradeService.findTradeList(condition);
    event.reply(IPC_CHANNEL.CallTradeList, result);
  }

  private static async tradeSave(event: IpcMainEvent, tradeForm: TradeForm) {
    await TradeService.saveTrade(tradeForm);
    event.reply(IPC_CHANNEL.CallTradeSave, true);
  }

  private static async tradeUpdate(event: IpcMainEvent, tradeForm: TradeForm) {
    await TradeService.updateTrade(tradeForm);
    event.reply(IPC_CHANNEL.CallTradeUpdate, true);
  }

  private static async tradeDelete(event: IpcMainEvent, tradeSeq: number) {
    await TradeService.deleteTrade(tradeSeq);
    event.reply(IPC_CHANNEL.CallTradeDelete, true);
  }

  // --- Exchange ---
  private static async exchangeGet(event: IpcMainEvent, exchangeSeq: number) {
    const result = await TradeService.getTrade(exchangeSeq);
    event.reply(IPC_CHANNEL.CallExchangeGet, result);
  }

  private static async exchangeList(event: IpcMainEvent, condition: ResSearchModel) {
    const result = await TradeService.findTradeList(condition);
    event.reply(IPC_CHANNEL.CallExchangeList, result);
  }

  private static async exchangeSave(event: IpcMainEvent, exchangeForm: TradeForm) {
    await TradeService.saveTrade(exchangeForm);
    event.reply(IPC_CHANNEL.CallExchangeSave, true);
  }

  private static async exchangeUpdate(event: IpcMainEvent, exchangeForm: TradeForm) {
    await TradeService.updateTrade(exchangeForm);
    event.reply(IPC_CHANNEL.CallExchangeUpdate, true);
  }

  private static async exchangeDelete(event: IpcMainEvent, exchangeSeq: number) {
    await TradeService.deleteTrade(exchangeSeq);
    event.reply(IPC_CHANNEL.CallExchangeDelete, true);
  }
}
