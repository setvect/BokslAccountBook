import { ipcMain, IpcMainEvent } from 'electron';
import log from 'electron-log';
import { IPC_CHANNEL } from '../common/CommonType';
import CategoryService from './service/CategoryService';
import { ResCategoryModel } from '../common/ResModel';

export default class IpcHandler {
  static registerHandlers() {
    log.info('IpcHandler.registerHandlers()');
    ipcMain.on(IPC_CHANNEL.ipcExample, async (event, arg) => this.ipcExample(event, arg));
    ipcMain.on(IPC_CHANNEL.loadCategory, async (event, arg) => this.loadCategory(event));
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

    event.reply(IPC_CHANNEL.loadCategory, response);
  }
}
