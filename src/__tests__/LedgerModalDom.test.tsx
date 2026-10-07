/** @jest-environment jsdom */
import { createRef } from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { Currency, ExchangeKind, TradeKind, TransactionKind } from '../common/CommonType';
import { TransactionModalHandle, ExchangeModalHandle, TradeModalHandle } from '../renderer/forms/ledgerModalTypes';
import TransactionModal from '../renderer/components/common/TransactionModal';
import ExchangeModal from '../renderer/components/common/ExchangeModal';
import TradeModal from '../renderer/components/common/TradeModal';
import IpcCaller from '../renderer/common/IpcCaller';

jest.mock('../renderer/common/IpcCaller', () => ({
  __esModule: true,
  default: {
    getTransaction: jest.fn(),
    updateTransaction: jest.fn(),
    getExchange: jest.fn(),
    updateExchange: jest.fn(),
    getTrade: jest.fn(),
    updateTrade: jest.fn(),
  },
}));
jest.mock('../renderer/mapper/AccountMapper', () => ({
  __esModule: true,
  default: { getOptionBalanceList: () => [], getStockOptionList: () => [], getBalanceAmount: () => 1000 },
}));
jest.mock('../renderer/mapper/StockMapper', () => ({
  __esModule: true,
  default: { getStock: () => ({ currency: 'USD' }), getOptionBalanceList: () => [] },
}));
jest.mock('../renderer/mapper/CategoryMapper', () => ({ __esModule: true, default: { getPathText: () => '분류', getList: () => [] } }));
// Date-picker locale resolution differs between Jest's CJS and the renderer bundler.
jest.mock('../renderer/components/common/part/MyDatePicker', () => () => null);
const onSubmit = jest.fn();
beforeEach(() => jest.clearAllMocks());
it('submits a real transaction dialog through its DOM-scoped keyboard listener', async () => {
  jest.mocked(IpcCaller.getTransaction).mockResolvedValue({
    transactionSeq: 1,
    transactionDate: new Date(),
    kind: TransactionKind.SPENDING,
    categorySeq: 1,
    note: 'test',
    currency: Currency.KRW,
    amount: 100,
    payAccount: 1,
    receiveAccount: 0,
    attribute: 1,
    fee: 0,
  });
  const ref = createRef<TransactionModalHandle>();
  render(<TransactionModal ref={ref} onSubmit={onSubmit} />);
  await act(async () => ref.current!.openTransactionModal(TransactionKind.SPENDING, 1, null));
  fireEvent.keyDown(window, { key: 'Enter', metaKey: true });
  await waitFor(() => expect(IpcCaller.updateTransaction).toHaveBeenCalledTimes(1));
  expect(onSubmit).toHaveBeenCalledTimes(1);
});
it('submits a real exchange dialog through its DOM-scoped keyboard listener', async () => {
  jest.mocked(IpcCaller.getExchange).mockResolvedValue({
    exchangeSeq: 1,
    exchangeDate: new Date(),
    kind: ExchangeKind.EXCHANGE_BUY,
    accountSeq: 1,
    note: 'test',
    sellCurrency: Currency.USD,
    sellAmount: 1,
    buyCurrency: Currency.KRW,
    buyAmount: 1300,
    fee: 0,
  });
  const ref = createRef<ExchangeModalHandle>();
  render(<ExchangeModal ref={ref} onSubmit={onSubmit} />);
  await act(async () => ref.current!.openExchangeModal(ExchangeKind.EXCHANGE_BUY, 1, null));
  fireEvent.keyDown(window, { key: 'Enter', metaKey: true });
  await waitFor(() => expect(IpcCaller.updateExchange).toHaveBeenCalledTimes(1));
});
it('submits a real trade dialog through its DOM-scoped keyboard listener', async () => {
  jest.mocked(IpcCaller.getTrade).mockResolvedValue({
    tradeSeq: 1,
    tradeDate: new Date(),
    kind: TradeKind.BUY,
    stockSeq: 1,
    accountSeq: 1,
    note: 'test',
    quantity: 1,
    price: 10,
    tax: 0,
    fee: 0,
    sellGains: 0,
  });
  const ref = createRef<TradeModalHandle>();
  render(<TradeModal ref={ref} onSubmit={onSubmit} />);
  await act(async () => ref.current!.openTradeModal(TradeKind.BUY, 1, null));
  fireEvent.keyDown(window, { key: 'Enter', metaKey: true });
  await waitFor(() => expect(IpcCaller.updateTrade).toHaveBeenCalledTimes(1));
});
