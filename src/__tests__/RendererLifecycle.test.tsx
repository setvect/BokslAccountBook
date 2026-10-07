/** @jest-environment jsdom */
import { createRef, useRef } from 'react';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import useLatestRequest from '../renderer/hooks/useLatestRequest';
import useWindowKeydown from '../renderer/hooks/useWindowKeydown';
import AutoComplete from '../renderer/components/common/AutoComplete';
import TransactionCategoryModal, { TransactionCategoryModalHandle } from '../renderer/components/common/TransactionCategoryModal';
import { TransactionKind } from '../common/CommonType';
import IpcCaller from '../renderer/common/IpcCaller';

jest.mock('../renderer/common/IpcCaller', () => ({ __esModule: true, default: { getTransactionCategoryByNote: jest.fn() } }));
jest.mock('../renderer/state/referenceData', () => ({ useReferenceData: jest.fn() }));
jest.mock('../renderer/components/util/util', () => ({ showInfoDialog: jest.fn() }));
jest.mock('../renderer/mapper/CategoryMapper', () => ({
  __esModule: true,
  default: {
    getSubList: () => [
      { categorySeq: 2, name: 'coffee' },
      { categorySeq: 3, name: 'food' },
    ],
    getPathText: (seq: number) => `category ${seq}`,
    getList: (_kind: TransactionKind, parent?: number) => (parent ? [{ categorySeq: 2, name: 'coffee' }] : [{ categorySeq: 1, name: 'food' }]),
  },
}));
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return { promise, resolve, reject };
}
it('applies only the latest read, ignores cancelled failures, and stops after unmount', async () => {
  const first = deferred<string>();
  const second = deferred<string>();
  const third = deferred<string>();
  const apply = jest.fn();
  const load = jest.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise).mockReturnValueOnce(third.promise);
  const { result, unmount } = renderHook(() => useLatestRequest(load, apply));
  const one = result.current.run();
  const two = result.current.run();
  await act(async () => {
    second.resolve('new');
    await two;
  });
  await act(async () => {
    first.reject(new Error('old'));
    await one;
  });
  expect(apply.mock.calls).toEqual([['new']]);
  const three = result.current.run();
  unmount();
  await act(async () => {
    third.resolve('closed');
    await three;
  });
  expect(apply).toHaveBeenCalledTimes(1);
});
it('runs shortcuts only in the active dialog, reads current handlers, and removes listeners', () => {
  const first = jest.fn();
  const latest = jest.fn();
  function Dialog({ handler }: { handler: (event: KeyboardEvent) => void }) {
    const ref = useRef<HTMLDivElement>(null);
    useWindowKeydown(true, handler, ref);
    return <div ref={ref} className="modal show" />;
  }
  const view = render(<Dialog handler={first} />);
  fireEvent.keyDown(window, { key: 'Enter' });
  view.rerender(<Dialog handler={latest} />);
  const child = document.createElement('div');
  child.className = 'modal show';
  document.body.appendChild(child);
  fireEvent.keyDown(window, { key: 'Enter' });
  expect(first).toHaveBeenCalledTimes(1);
  expect(latest).not.toHaveBeenCalled();
  child.remove();
  fireEvent.keyDown(window, { key: 'Enter' });
  expect(latest).toHaveBeenCalledTimes(1);
  view.unmount();
  fireEvent.keyDown(window, { key: 'Enter' });
  expect(latest).toHaveBeenCalledTimes(1);
});
it('ignores older category suggestions and consumes selection keys without submitting the parent', async () => {
  const old = deferred<number[]>();
  const recent = deferred<number[]>();
  jest.mocked(IpcCaller.getTransactionCategoryByNote).mockReturnValueOnce(old.promise).mockReturnValueOnce(recent.promise);
  const select = jest.fn();
  const parent = jest.fn();
  window.addEventListener('keydown', parent);
  const view = render(<AutoComplete value="" kind={TransactionKind.SPENDING} onChange={() => undefined} onCategorySelect={select} />);
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'a' } });
  fireEvent.change(input, { target: { value: 'b' } });
  await act(async () => recent.resolve([3]));
  await act(async () => old.resolve([2]));
  expect(screen.queryByText('category 2')).toBeNull();
  fireEvent.keyDown(input, { key: 'ArrowDown' });
  fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true });
  expect(select).toHaveBeenCalledWith(3);
  expect(parent).not.toHaveBeenCalled();
  view.unmount();
  window.removeEventListener('keydown', parent);
});
it('resets category selection on each open and selects the current subcategory', async () => {
  const ref = createRef<TransactionCategoryModalHandle>();
  const select = jest.fn();
  render(<TransactionCategoryModal ref={ref} onSelect={select} />);
  act(() => ref.current!.openTransactionCategoryModal(TransactionKind.SPENDING));
  fireEvent.click(screen.getByText('food'));
  fireEvent.click(screen.getByText('coffee'));
  fireEvent.click(screen.getByText('저장'));
  expect(select).toHaveBeenCalledWith(2);
  act(() => ref.current!.openTransactionCategoryModal(TransactionKind.INCOME));
  expect(screen.queryByText('coffee')).toBeNull();
  fireEvent.click(screen.getByText('저장'));
  expect(select).toHaveBeenCalledTimes(1);
});
