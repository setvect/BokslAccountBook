// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { IpcResult, RequestArgs, RequestChannel, ResponseValue } from '../common/ipc/Contract';
import { IPC_CHANNEL } from '../common/CommonType';

const electronHandler = {
  ipcRenderer: {
    request<C extends RequestChannel>(channel: C, ...args: RequestArgs<C>): Promise<IpcResult<ResponseValue<C>>> {
      if (!channel.startsWith('Call')) return Promise.reject(new Error('허용되지 않은 요청 채널입니다.'));
      return ipcRenderer.invoke(channel, ...args);
    },
    sendMessage(channel: IPC_CHANNEL, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: IPC_CHANNEL, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) => func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: string, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
