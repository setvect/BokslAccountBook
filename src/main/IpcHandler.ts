import { ipcMain, IpcMainEvent } from 'electron';
import log from 'electron-log';
import { IPC_CHANNEL } from '../common/CommonType';
import CategoryService from './service/CategoryService';
import { ResCategoryModel, ResErrorModel } from '../common/ResModel';
import UserService from './service/UserService';
import Constant from '../common/Constant';
import CodeService from './service/CodeService';

function withTryCatch(handler: (event: IpcMainEvent, ...args: any[]) => Promise<void>) {
  return async (event: IpcMainEvent, ...args: any[]) => {
    try {
      await handler(event, ...args);
    } catch (error: any) {
      let resError: ResErrorModel;
      if (error instanceof Error) {
        log.error('Error message:', error.message);
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
    ipcMain.on(IPC_CHANNEL.CallLoadCategory, withTryCatch(this.loadCategory));
    ipcMain.on(IPC_CHANNEL.CallCheckPassword, withTryCatch(this.checkPassword));
    ipcMain.on(IPC_CHANNEL.CallChangePassword, withTryCatch(this.changePassword));
    ipcMain.on(IPC_CHANNEL.CallLoadCode, withTryCatch(this.loadCode));
  }

  private static ipcExample(event: IpcMainEvent, arg: string) {
    const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
    console.log(msgTemplate(arg));
    event.reply(IPC_CHANNEL.ipcExample, msgTemplate('pong'));
  }

  private static async loadCategory(event: IpcMainEvent) {
    log.info('IpcHandler.loadCategory()');
    const categoryList = await CategoryService.findCategoryAll();

    const response: ResCategoryModel[] = categoryList.map((category) => {
      const { categorySeq, name, kind, parentSeq, orderNo } = category;
      return { categorySeq, name, kind, parentSeq, orderNo };
    });

    event.reply(IPC_CHANNEL.CallLoadCategory, response);
  }

  private static async checkPassword(event: IpcMainEvent, password: string) {
    const pass = await UserService.checkPassword(Constant.DEFAULT_USER.userId, password);
    event.reply(IPC_CHANNEL.CallCheckPassword, pass);
  }

  private static async changePassword(event: IpcMainEvent, args: any) {
    await UserService.changePassword(Constant.DEFAULT_USER.userId, args[0], args[1]);
    event.reply(IPC_CHANNEL.CallChangePassword, true);
  }

  private static async loadCode(event: IpcMainEvent) {
    const result = await CodeService.findCategoryAll();
    event.reply(IPC_CHANNEL.CallLoadCode, result);
  }
}
