/** @jest-environment jsdom */
import { createRef } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Currency, ExchangeKind, TradeKind, TransactionKind } from '../common/CommonType';
import { ResTransactionModel } from '../common/ResModel';
import { newTransaction, newExchange, newTrade, exchangeFormSchema, tradeFormSchema, transactionFormSchema } from '../renderer/forms/ledgerForms';
import { TransactionModalHandle } from '../renderer/forms/ledgerModalTypes';
import useTransactionForm from '../renderer/hooks/useTransactionForm';
import useModalSession from '../renderer/hooks/useModalSession';
import IpcCaller from '../renderer/common/IpcCaller';
import AccountMapper from '../renderer/mapper/AccountMapper';

jest.mock('../renderer/common/IpcCaller', () => ({
  __esModule: true,
  default: { getTransaction: jest.fn(), saveTransaction: jest.fn(), updateTransaction: jest.fn() },
}));
jest.mock('../renderer/mapper/AccountMapper', () => ({ __esModule: true, default: { loadList: jest.fn() } }));
jest.mock('../renderer/mapper/CategoryMapper', () => ({ __esModule: true, default: { getPathText: (seq: number) => `category ${seq}` } }));
jest.mock('../renderer/components/util/util', () => ({ showWarnDialog: jest.fn() }));

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return { promise, resolve, reject };
}
const valid = {
  ...newTransaction(TransactionKind.SPENDING, new Date(2026, 0, 2)),
  note: 'coffee',
  amount: 10,
  payAccount: 1,
  categorySeq: 2,
  attribute: 3,
};
beforeEach(() => jest.resetAllMocks());
function transactionHook() {
  const ref = createRef<TransactionModalHandle>();
  const onSubmit = jest.fn();
  const hook = renderHook(() => useTransactionForm({ onSubmit }, ref));
  act(() => ref.current!.openTransactionModal(TransactionKind.SPENDING, 0, null));
  act(() => hook.result.current.reset(valid));
  return { ...hook, ref, onSubmit };
}
it('validates dates and required selection with the actual request types', async () => {
  const exchange = { ...newExchange(ExchangeKind.EXCHANGE_BUY, new Date()), accountSeq: 1, note: 'exchange', sellAmount: 1, buyAmount: 1300 };
  expect((await exchangeFormSchema.validate(exchange)).exchangeDate).toBeInstanceOf(Date);
  await expect(exchangeFormSchema.validate({ ...exchange, buyCurrency: Currency.USD })).rejects.toThrow('달라야');
  await expect(
    tradeFormSchema.validate({ ...newTrade(TradeKind.BUY, new Date()), accountSeq: 1, stockSeq: 1, note: 'buy', quantity: 0.1, price: 10 }),
  ).resolves.toMatchObject({ quantity: 0.1 });
  await expect(transactionFormSchema.validate({ ...valid, kind: TransactionKind.TRANSFER, receiveAccount: 1 })).rejects.toThrow('다르게');
  await expect(transactionFormSchema.validate({ ...valid, kind: TransactionKind.TRANSFER, receiveAccount: 0 })).rejects.toThrow('수입 계좌');
});
it('blocks double submissions through buttons and keyboard while preserving continuous entry', async () => {
  const pending = deferred<void>();
  jest.mocked(IpcCaller.saveTransaction).mockReturnValue(pending.promise);
  const { result, onSubmit } = transactionHook();
  act(() => {
    result.current.handleConfirmReInputClick();
    result.current.handleConfirmReInputClick();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true }));
  });
  await waitFor(() => expect(IpcCaller.saveTransaction).toHaveBeenCalledTimes(1));
  await act(async () => pending.resolve());
  await waitFor(() => expect(result.current.modal.saving).toBe(false));
  expect(result.current.modal.show).toBe(true);
  expect(result.current.getValues()).toMatchObject({ note: '', amount: 0, categorySeq: 2, payAccount: 1 });
  expect(onSubmit).toHaveBeenCalledTimes(1);
  expect(AccountMapper.loadList).toHaveBeenCalledTimes(1);
});
it('keeps entered values after a rejected save and allows a corrected retry', async () => {
  jest.mocked(IpcCaller.saveTransaction).mockRejectedValueOnce(new Error('save failed')).mockResolvedValueOnce(undefined);
  const { result } = transactionHook();
  act(() => result.current.handleConfirmClick());
  await waitFor(() => expect(result.current.modal.error).toBe('save failed'));
  expect(result.current.getValues('note')).toBe('coffee');
  expect(result.current.modal.show).toBe(true);
  act(() => result.current.handleConfirmClick());
  await waitFor(() => expect(result.current.modal.show).toBe(false));
  expect(IpcCaller.saveTransaction).toHaveBeenCalledTimes(2);
});
it('ignores out-of-order reads, reads after closing, and stale saves after another item opens', async () => {
  const first = deferred<ResTransactionModel>();
  const second = deferred<ResTransactionModel>();
  jest.mocked(IpcCaller.getTransaction).mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
  const { result, ref } = transactionHook();
  act(() => ref.current!.openTransactionModal(TransactionKind.SPENDING, 1, null));
  act(() => ref.current!.openTransactionModal(TransactionKind.SPENDING, 2, null));
  await act(async () => second.resolve({ ...valid, transactionSeq: 2, note: 'newest' }));
  await act(async () => first.resolve({ ...valid, transactionSeq: 1, note: 'old' }));
  expect(result.current.getValues('note')).toBe('newest');
  const saved = deferred<void>();
  jest.mocked(IpcCaller.updateTransaction).mockReturnValue(saved.promise);
  act(() => result.current.handleConfirmClick());
  await waitFor(() => expect(IpcCaller.updateTransaction).toHaveBeenCalledTimes(1));
  act(() => ref.current!.openTransactionModal(TransactionKind.INCOME, 0, null));
  await act(async () => saved.resolve());
  expect(result.current.modal.show).toBe(true);
  expect(result.current.getValues('kind')).toBe(TransactionKind.INCOME);
  const late = deferred<ResTransactionModel>();
  jest.mocked(IpcCaller.getTransaction).mockReturnValue(late.promise);
  act(() => ref.current!.openTransactionModal(TransactionKind.SPENDING, 3, null));
  act(() => ref.current!.hideTransactionModal());
  await act(async () => late.resolve({ ...valid, transactionSeq: 3, note: 'closed' }));
  expect(result.current.modal.show).toBe(false);
  expect(result.current.getValues('transactionSeq')).toBe(0);
});
it('uses the latest edited ID for shortcuts and removes keyboard listeners after unmount', async () => {
  jest.mocked(IpcCaller.getTransaction).mockResolvedValue({ ...valid, transactionSeq: 7 });
  const { ref, result, unmount } = transactionHook();
  act(() => ref.current!.openTransactionModal(TransactionKind.SPENDING, 7, null));
  await waitFor(() => expect(result.current.getValues('transactionSeq')).toBe(7));
  act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', metaKey: true, shiftKey: true })));
  expect(IpcCaller.updateTransaction).not.toHaveBeenCalled();
  act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', metaKey: true })));
  await waitFor(() => expect(IpcCaller.updateTransaction).toHaveBeenCalledTimes(1));
  unmount();
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', metaKey: true }));
  expect(IpcCaller.updateTransaction).toHaveBeenCalledTimes(1);
});
it('keeps an unsuccessful read disabled instead of submitting blank defaults', async () => {
  const { result } = renderHook(() => useModalSession());
  await act(async () => {
    await result.current.open(
      () => undefined,
      () => Promise.reject(new Error('read failed')),
    );
  });
  expect(result.current.error).toBe('read failed');
  expect(result.current.disabled).toBe(true);
  const save = jest.fn();
  await act(async () => result.current.submit(save));
  expect(save).not.toHaveBeenCalled();
});
