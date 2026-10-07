import { ipcMain } from 'electron';
import { IPC_CHANNEL, AccountType, Currency, TransactionKind } from '../common/CommonType';
import { IpcResult, REQUEST_CHANNELS, RequestChannel } from '../common/ipc/Contract';
import IpcHandler from '../main/IpcHandler';
import AppDataSource from '../main/config/AppDataSource';
import { AccountEntity, BalanceEntity, TransactionEntity } from '../main/entity/Entity';
import parseRequest from '../main/ipc/parseRequest';

jest.mock('electron', () => ({ ipcMain: { handle: jest.fn() }, webContents: { getFocusedWebContents: jest.fn(() => null) } }));
jest.mock('electron-log', () => ({ info: jest.fn(), error: jest.fn() }));
jest.mock('../main/service/StoreService', () => ({
  __esModule: true,
  default: { getExchangeRate: () => [{ currency: 'KRW', rate: 1 }], saveCurrencyRate: jest.fn() },
}));

describe('all IPC request contracts', () => {
  const handlers = new Map<string, (event: unknown, ...args: unknown[]) => Promise<IpcResult<unknown>>>();
  const call = (channel: RequestChannel, ...args: unknown[]) => handlers.get(channel)!(null, ...args);

  beforeAll(async () => {
    (ipcMain.handle as jest.Mock).mockImplementation((channel, handler) => handlers.set(channel, handler));
    IpcHandler.registerHandlers();
    await AppDataSource.initialize();
  });
  afterAll(async () => AppDataSource.destroy());

  it('registers each request exactly once and excludes notification channels', () => {
    expect([...handlers.keys()].sort()).toEqual([...REQUEST_CHANNELS].sort());
    expect(ipcMain.handle).toHaveBeenCalledTimes(REQUEST_CHANNELS.length);
    expect(REQUEST_CHANNELS.length).toBe(Object.keys(IPC_CHANNEL).filter((name) => name.startsWith('Call')).length);
  });

  it.each(REQUEST_CHANNELS)('%s rejects malformed input on the same response', async (channel) => {
    expect(await call(channel, undefined)).toMatchObject({ ok: false, error: { code: 'INVALID_REQUEST' } });
  });

  it('preserves search Set and Date values without string coercion', () => {
    const search = { from: new Date(2026, 0, 1), to: new Date(2026, 0, 31), checkType: new Set([AccountType.SPENDING]), currency: Currency.KRW };
    expect(parseRequest(IPC_CHANNEL.CallTransactionList, [search])).toEqual([search]);
    expect(() => parseRequest(IPC_CHANNEL.CallTransactionList, [{ ...search, checkType: ['SPENDING'] }])).toThrow();
    expect(() => parseRequest(IPC_CHANNEL.CallTransactionList, [{ ...search, from: '2026-01-01' }])).toThrow();
  });

  it('executes account and transaction requests against SQLite and returns service failures', async () => {
    const account = {
      accountSeq: 0,
      name: 'IPC 계좌',
      accountNumber: '',
      assetType: 1,
      accountType: 1,
      stockF: false,
      balance: [{ currency: Currency.KRW, amount: 1000 }],
    };
    expect(await call(IPC_CHANNEL.CallAccountSave, account)).toMatchObject({ ok: true });
    const [savedAccount] = await AppDataSource.manager.find(AccountEntity);
    const transaction = {
      transactionSeq: 0,
      transactionDate: new Date(2026, 0, 1),
      kind: TransactionKind.SPENDING,
      categorySeq: 1,
      attribute: 1,
      payAccount: savedAccount.accountSeq,
      receiveAccount: 0,
      note: '테스트',
      currency: Currency.KRW,
      amount: 100,
      fee: 10,
    };
    expect(await call(IPC_CHANNEL.CallTransactionSave, transaction)).toMatchObject({ ok: true });
    const [saved] = await AppDataSource.manager.find(TransactionEntity);
    expect(await call(IPC_CHANNEL.CallTransactionGet, saved.transactionSeq)).toMatchObject({ ok: true, value: { amount: 100 } });
    expect((await AppDataSource.manager.find(BalanceEntity))[0].amount).toBe(890);
    expect(await call(IPC_CHANNEL.CallTransactionDelete, saved.transactionSeq)).toMatchObject({ ok: true });
    expect((await AppDataSource.manager.find(BalanceEntity))[0].amount).toBe(1000);
    expect(await call(IPC_CHANNEL.CallTransactionGet, saved.transactionSeq)).toMatchObject({ ok: false, error: { code: 'SERVICE_ERROR' } });
    expect(await call(IPC_CHANNEL.CallTransactionSave, { ...transaction, amount: Infinity })).toMatchObject({
      ok: false,
      error: { code: 'INVALID_REQUEST' },
    });
  });

  it('completes find requests even when no window has focus', async () => {
    expect(await call(IPC_CHANNEL.CallFindDocument, '검색')).toEqual({ ok: true, value: false });
  });
});
