import log from 'electron-log';
import { ipcMain } from 'electron';
import { IPC_CHANNEL } from '../../common/CommonType';
import { RequestArgs, ResponseValue } from '../../common/ipc/Contract';
import CategoryService from '../service/CategoryService';
import createRequestHandler from './createRequestHandler';
import parseRequest from './parseRequest';

type CategoryChannel =
  | IPC_CHANNEL.CallCategoryLoad
  | IPC_CHANNEL.CallCategorySave
  | IPC_CHANNEL.CallCategoryUpdate
  | IPC_CHANNEL.CallCategoryUpdateOrder
  | IPC_CHANNEL.CallCategoryDelete;

export default function registerCategoryHandlers() {
  function register<C extends CategoryChannel>(channel: C, handler: (...args: RequestArgs<C>) => Promise<ResponseValue<C>>) {
    ipcMain.handle(
      channel,
      createRequestHandler<C>(
        (args) => parseRequest(channel, args),
        handler,
        (error) => log.error(channel, error),
      ),
    );
  }
  register(IPC_CHANNEL.CallCategoryLoad, () => CategoryService.findAll());
  register(IPC_CHANNEL.CallCategorySave, (value) => CategoryService.save(value));
  register(IPC_CHANNEL.CallCategoryUpdate, (value) => CategoryService.update(value));
  register(IPC_CHANNEL.CallCategoryUpdateOrder, (value) => CategoryService.updateOrder(value));
  register(IPC_CHANNEL.CallCategoryDelete, (id) => CategoryService.delete(id));
}
