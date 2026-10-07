import { contextBridge, ipcRenderer } from 'electron';
import type { ElectronHandler } from '../main/preload';
import { IPC_CHANNEL } from '../common/CommonType';
import { NOTIFICATION_CHANNELS, REQUEST_CHANNELS, RequestChannel, NotificationChannel } from '../common/ipc/Contract';
import '../main/preload';

jest.mock('electron', () => ({
  contextBridge: { exposeInMainWorld: jest.fn() },
  ipcRenderer: { invoke: jest.fn().mockResolvedValue({ ok: true, value: undefined }), on: jest.fn(), removeListener: jest.fn() },
}));

const bridge = (contextBridge.exposeInMainWorld as jest.Mock).mock.calls[0][1] as ElectronHandler;

it('exposes only request and notification APIs', () => {
  expect(Object.keys(bridge.ipcRenderer).sort()).toEqual(['on', 'request']);
});

it.each(REQUEST_CHANNELS)('forwards allowed request %s', async (channel) => {
  // Dynamic protocol test; payload validation belongs to the main request handler.
  await bridge.ipcRenderer.request(channel);
  expect(ipcRenderer.invoke).toHaveBeenLastCalledWith(channel);
});

it('rejects unknown and notification channels as requests', async () => {
  await expect(bridge.ipcRenderer.request('arbitrary' as RequestChannel)).rejects.toThrow('허용되지 않은 요청');
  await expect(bridge.ipcRenderer.request(IPC_CHANNEL.FindOpen as unknown as RequestChannel)).rejects.toThrow('허용되지 않은 요청');
});

it.each(NOTIFICATION_CHANNELS)('removes exactly the registered notification listener for %s', (channel) => {
  const callback = jest.fn();
  const unsubscribe = bridge.ipcRenderer.on(channel, callback);
  const [, subscription] = (ipcRenderer.on as jest.Mock).mock.calls.at(-1);
  subscription({}, 'payload');
  expect(callback).toHaveBeenCalledWith('payload');
  unsubscribe();
  expect(ipcRenderer.removeListener).toHaveBeenLastCalledWith(channel, subscription);
});

it('rejects request channels as notifications', () => {
  expect(() => bridge.ipcRenderer.on(IPC_CHANNEL.CallAccountSave as unknown as NotificationChannel, jest.fn())).toThrow('허용되지 않은 알림');
});
