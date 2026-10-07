// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import {
  IpcResult,
  RequestArgs,
  RequestChannel,
  ResponseValue,
  REQUEST_CHANNELS,
  NOTIFICATION_CHANNELS,
  NotificationChannel,
} from '../common/ipc/Contract';

const electronHandler = {
  ipcRenderer: {
    request<C extends RequestChannel>(channel: C, ...args: RequestArgs<C>): Promise<IpcResult<ResponseValue<C>>> {
      if (!REQUEST_CHANNELS.includes(channel)) return Promise.reject(new Error('허용되지 않은 요청 채널입니다.'));
      return ipcRenderer.invoke(channel, ...args);
    },
    on(channel: NotificationChannel, func: (...args: unknown[]) => void) {
      if (!NOTIFICATION_CHANNELS.includes(channel)) throw new Error('허용되지 않은 알림 채널입니다.');
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) => func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
