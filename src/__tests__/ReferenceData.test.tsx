/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import { Currency, IPC_CHANNEL } from '../common/CommonType';
import { ResAccountModel } from '../common/ResModel';
import createListStore from '../renderer/state/createListStore';
import { accounts, holdings, categories, stocks, useReferenceData } from '../renderer/state/referenceData';
import accountOptions from '../renderer/mapper/accountOptions';
import AccountMapper from '../renderer/mapper/AccountMapper';
import IpcCaller from '../renderer/common/IpcCaller';
import { showWarnDialog } from '../renderer/components/util/util';

jest.mock('../renderer/components/util/util', () => ({ showWarnDialog: jest.fn() }));

const account: ResAccountModel = {
  accountSeq: 1,
  name: 'cash',
  assetType: 1,
  accountType: 1,
  accountNumber: '',
  balance: [{ currency: Currency.KRW, amount: 100 }],
  stockBuyPrice: [],
  interestRate: '',
  term: '',
  monthlyPay: '',
  expDate: '',
  transferDate: '',
  note: '',
  stockF: false,
  enableF: true,
  deleteF: false,
};
beforeEach(() => {
  jest.clearAllMocks();
  window.electron = { ipcRenderer: { on: jest.fn(), request: jest.fn() } };
});
it('keeps the newest refresh when reads finish out of order, and retains data after failures', async () => {
  let complete!: (value: number[]) => void;
  const fetch = jest
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise<number[]>((resolve) => {
          complete = resolve;
        }),
    )
    .mockResolvedValueOnce([2])
    .mockRejectedValueOnce(new Error('failed'));
  const notify = jest.fn();
  const store = createListStore<number>(fetch, notify);
  const first = store.load();
  await store.load();
  complete([1]);
  await first;
  expect(store.getSnapshot()).toEqual([2]);
  expect(notify).toHaveBeenCalledTimes(1);
  await expect(store.load()).rejects.toThrow('failed');
  expect(store.getSnapshot()).toEqual([2]);
});
it('refreshes account balances after mutations and notifies mounted consumers', async () => {
  jest.mocked(window.electron.ipcRenderer.request).mockResolvedValueOnce({ ok: true, value: [account] });
  await accounts.load();
  const { result, unmount } = renderHook(useReferenceData);
  const revision = result.current;
  const updated = { ...account, name: 'updated', balance: [{ currency: Currency.KRW, amount: 120 }] };
  jest
    .mocked(window.electron.ipcRenderer.request)
    .mockResolvedValueOnce({ ok: true, value: undefined })
    .mockResolvedValueOnce({ ok: true, value: [updated] });
  await act(async () => IpcCaller.deleteTransaction(7));
  expect(window.electron.ipcRenderer.request).toHaveBeenLastCalledWith(IPC_CHANNEL.CallAccountLoad);
  expect(result.current).toBeGreaterThan(revision);
  expect(AccountMapper.getList()).toEqual([updated]);
  expect(AccountMapper.getOptionBalanceList()[0].label).toBe('updated: ₩120');
  expect(AccountMapper.getBalanceAmount(1, Currency.KRW)).toBe(120);
  unmount();
});
it('refreshes both cash and holdings after a trade, and the matching category/stock stores', async () => {
  const bridge = jest.mocked(window.electron.ipcRenderer.request);
  bridge.mockResolvedValue({ ok: true, value: [] });
  await IpcCaller.deleteTrade(7);
  expect(bridge).toHaveBeenCalledWith(IPC_CHANNEL.CallAccountLoad);
  expect(bridge).toHaveBeenCalledWith(IPC_CHANNEL.CallStockBuyLoad);
  expect(holdings.getSnapshot()).toEqual([]);
  await IpcCaller.deleteCategory(1);
  expect(bridge).toHaveBeenCalledWith(IPC_CHANNEL.CallCategoryLoad);
  expect(categories.getSnapshot()).toEqual([]);
  await IpcCaller.deleteStock(1);
  expect(bridge).toHaveBeenCalledWith(IPC_CHANNEL.CallStockLoad);
  expect(stocks.getSnapshot()).toEqual([]);
});
it('does not turn a successful write into a retryable failure when refresh fails', async () => {
  jest
    .mocked(window.electron.ipcRenderer.request)
    .mockResolvedValueOnce({ ok: true, value: undefined })
    .mockResolvedValueOnce({ ok: false, error: { code: 'SERVICE_ERROR', message: 'load failed' } });
  await expect(IpcCaller.deleteTransaction(7)).resolves.toBeUndefined();
  expect(showWarnDialog).toHaveBeenCalledTimes(1);
  expect(window.electron.ipcRenderer.request).toHaveBeenCalledTimes(2);
});
it('projects account options without loading global data', () => {
  expect(accountOptions([account], true, Currency.USD)).toEqual([{ value: 1, label: 'cash: $0.00' }]);
  expect(accountOptions([{ ...account, accountNumber: '123' }], false, Currency.KRW)).toEqual([{ value: 1, label: 'cash(123)' }]);
});
