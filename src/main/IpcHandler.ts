import { ipcMain, IpcMainEvent } from 'electron';
import log from 'electron-log';
import { IPC_CHANNEL } from '../common/CommonType';
import CategoryService from './service/CategoryService';
import { ResCategoryModel, ResErrorModel } from '../common/ResModel';
import UserService from './service/UserService';
import Constant from '../common/Constant';
import CodeService from './service/CodeService';
import { CodeFrom, StockBuyForm, StockForm } from '../common/ReqModel';
import AccountService from './service/AccountService';
import StockService from './service/StockService';
import StockBuyService from './service/StockBuyService';

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
  }

  private static ipcExample(event: IpcMainEvent, arg: string) {
    const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
    console.log(msgTemplate(arg));
    event.reply(IPC_CHANNEL.ipcExample, msgTemplate('pong'));
  }

  //  --- Category ---
  private static async categoryLoad(event: IpcMainEvent) {
    log.info('IpcHandler.categoryLoad()');
    const categoryList = await CategoryService.findCategoryAll();

    const response: ResCategoryModel[] = categoryList.map((category) => {
      const { categorySeq, name, kind, parentSeq, orderNo } = category;
      return { categorySeq, name, kind, parentSeq, orderNo };
    });

    event.reply(IPC_CHANNEL.CallCategoryLoad, response);
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

  // --- Code ---
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
}
