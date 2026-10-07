import { ipcMain } from 'electron';
import { IPC_CHANNEL, TransactionKind } from '../common/CommonType';
import AppDataSource from '../main/config/AppDataSource';
import registerCategoryHandlers from '../main/ipc/categoryHandlers';
import { IpcResult } from '../common/ipc/Contract';
import { CategoryEntity } from '../main/entity/Entity';

jest.mock('electron', () => ({ ipcMain: { handle: jest.fn() } }));
jest.mock('electron-log', () => ({ info: jest.fn(), error: jest.fn() }));

describe('category IPC with SQLite', () => {
  const handlers = new Map<string, (event: unknown, ...args: unknown[]) => Promise<IpcResult<unknown>>>();
  beforeAll(async () => {
    (ipcMain.handle as jest.Mock).mockImplementation((channel, handler) => handlers.set(channel, handler));
    registerCategoryHandlers();
    await AppDataSource.initialize();
  });
  afterAll(async () => AppDataSource.destroy());

  it('registers all five category request handlers', () => {
    expect(handlers.size).toBe(5);
  });

  it('saves, loads, updates, orders and deletes through the request boundary', async () => {
    const call = (channel: IPC_CHANNEL, ...args: unknown[]) => handlers.get(channel)!(null, ...args);
    const form = { categorySeq: 0, parentSeq: 0, kind: TransactionKind.SPENDING, name: '식비' };
    expect(await call(IPC_CHANNEL.CallCategorySave, form)).toEqual({ ok: true, value: undefined });
    const [saved] = await AppDataSource.manager.find(CategoryEntity);
    expect(await call(IPC_CHANNEL.CallCategoryLoad)).toMatchObject({ ok: true, value: [{ name: '식비' }] });
    expect(await call(IPC_CHANNEL.CallCategoryUpdate, { ...form, categorySeq: saved.categorySeq, name: '외식' })).toMatchObject({ ok: true });
    expect(await call(IPC_CHANNEL.CallCategoryUpdateOrder, [{ categorySeq: saved.categorySeq, orderNo: 10 }])).toMatchObject({ ok: true });
    expect(await call(IPC_CHANNEL.CallCategoryDelete, saved.categorySeq)).toMatchObject({ ok: true });
    expect(await AppDataSource.manager.findOneByOrFail(CategoryEntity, { categorySeq: saved.categorySeq })).toMatchObject({
      name: '외식',
      orderNo: 10,
      deleteF: true,
    });
  });

  it('rejects malformed payloads before writing', async () => {
    const before = await AppDataSource.manager.count(CategoryEntity);
    expect(await handlers.get(IPC_CHANNEL.CallCategorySave)!(null, { name: 'missing fields' })).toMatchObject({
      ok: false,
      error: { code: 'INVALID_REQUEST' },
    });
    expect(await handlers.get(IPC_CHANNEL.CallCategoryDelete)!(null, -1)).toMatchObject({ ok: false, error: { code: 'INVALID_REQUEST' } });
    expect(await AppDataSource.manager.count(CategoryEntity)).toBe(before);
  });
});
