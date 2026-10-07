/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import { createRef } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Currency } from '../common/CommonType';
import { ResSnapshotModel, ResStockBuyModel, ResStockModel } from '../common/ResModel';
import { buildSnapshotReport, compareValuations, portion, soldProfit, valuation } from '../common/calculation/snapshotReport';
import SnapshotComparisonTable from '../renderer/components/snapshot/SnapshotComparisonTable';
import SnapshotStockListInput from '../renderer/components/snapshot/SnapshotStockListInput';
import SnapshotReadModal, { SnapshotReadModelHandle } from '../renderer/components/snapshot/SnapshotReadModel';
import IpcCaller from '../renderer/common/IpcCaller';

jest.mock('../renderer/common/IpcCaller', () => ({ __esModule: true, default: { getSnapshot: jest.fn() } }));
jest.mock('../renderer/mapper/StockMapper', () => ({
  __esModule: true,
  default: { getStock: () => ({ stockSeq: 1, name: 'stock', currency: 'USD', stockTypeCode: 1, nationCode: 2 }) },
}));
jest.mock('../renderer/mapper/StockBuyMapper', () => ({
  __esModule: true,
  default: { getStockBuy: () => ({ stockBuySeq: 1, stockSeq: 1, accountSeq: 1 }) },
}));
jest.mock('../renderer/mapper/AccountMapper', () => ({
  __esModule: true,
  default: { getAccount: () => ({ name: 'account' }), getName: () => 'account' },
}));
jest.mock('../renderer/mapper/CodeMapper', () => ({ __esModule: true, default: { getValue: () => 'code' } }));
const stock: ResStockModel = {
  stockSeq: 1,
  name: 'stock',
  currency: Currency.USD,
  stockTypeCode: 1,
  nationCode: 2,
  link: '',
  enableF: true,
  deleteF: false,
};
const holding: ResStockBuyModel = { stockBuySeq: 1, stockSeq: 1, accountSeq: 1, buyAmount: 10, quantity: 0.1, deleteF: false };
const snapshot: ResSnapshotModel = {
  snapshotSeq: 1,
  note: 'snapshot',
  regDate: new Date(2026, 0, 2),
  deleteF: false,
  exchangeRateList: [{ currency: Currency.USD, rate: 1300 }],
  stockEvaluateList: [{ stockBuySeq: 1, buyAmount: 10, evaluateAmount: 11 }],
  assetGroupList: [{ assetGroupSeq: 1, accountType: 1, totalAmount: 13000, evaluateAmount: 14300 }],
  tradeList: [],
};
it('calculates stock groups, currency totals and yield from supplied data only', () => {
  const report = buildSnapshotReport(snapshot, [stock], [holding]);
  expect(report.totals).toEqual({ buyAmount: 13000, evaluateAmount: 14300, profit: 1300, profitRate: 0.1 });
  expect(report.stockTypes).toEqual([{ code: 1, ...report.totals }]);
  expect(report.stockNations).toEqual([{ code: 2, ...report.totals }]);
  expect(report.positions[0]).toMatchObject({ buyAmount: 10, evaluateAmount: 11, buyKrw: 13000, evaluateKrw: 14300 });
  expect(soldProfit(snapshot, [stock])).toBe(0);
  expect(report.missingRates).toEqual([]);
});
it('preserves the historical missing-rate fallback and reports it, including deleted reference rows', () => {
  const report = buildSnapshotReport({ ...snapshot, exchangeRateList: [] }, [{ ...stock, deleteF: true }], [{ ...holding, deleteF: true }]);
  expect(report.stockTotals.buyAmount).toBe(10);
  expect(report.missingRates).toEqual([Currency.USD]);
  expect(() => buildSnapshotReport(snapshot, [], [holding])).toThrow('보유종목');
  expect(portion(0, 0)).toBe(0);
});
it('compares added and removed positions without dropping either side', () => {
  const values = compareValuations([{ code: 1, ...valuation(100, 110) }], [{ code: 2, ...valuation(200, 240) }], (row) => row.code);
  expect(values[0]).toMatchObject({ key: 1, after: undefined, change: { buyAmount: -100, profit: -10 } });
  expect(values[1]).toMatchObject({ key: 2, before: undefined, change: { buyAmount: 200, profit: 40 } });
});
it('renders a ratio of 0.1 as 10.00% in the comparison', () => {
  const [values] = compareValuations([{ code: 1, ...valuation(100, 110) }], [{ code: 1, ...valuation(100, 120) }], (row) => row.code);
  render(<SnapshotComparisonTable title="comparison" rows={[{ id: 1, label: 'account', currency: Currency.KRW, detail: '', values }]} />);
  expect(screen.getByText('10.00%')).toBeInTheDocument();
  expect(screen.getByText('20.00%')).toBeInTheDocument();
});
it('uses the latest snapshot input callback and row after rerender', () => {
  const oldCallback = jest.fn();
  const newCallback = jest.fn();
  const { rerender } = render(
    <SnapshotStockListInput stockEvaluateList={[{ stockBuySeq: 1, buyAmount: 10, evaluateAmount: 10 }]} onUpdateValue={oldCallback} />,
  );
  rerender(<SnapshotStockListInput stockEvaluateList={[{ stockBuySeq: 1, buyAmount: 20, evaluateAmount: 20 }]} onUpdateValue={newCallback} />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '25' } });
  expect(newCallback).toHaveBeenLastCalledWith(0, { stockBuySeq: 1, buyAmount: 20, evaluateAmount: 25 });
  expect(oldCallback).not.toHaveBeenCalled();
});
it('keeps the newest read modal open when an older request resolves later', async () => {
  let resolveFirst!: (value: ResSnapshotModel) => void;
  jest
    .mocked(IpcCaller.getSnapshot)
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFirst = resolve;
        }),
    )
    .mockResolvedValueOnce({ ...snapshot, note: 'latest', stockEvaluateList: [] });
  const ref = createRef<SnapshotReadModelHandle>();
  render(<SnapshotReadModal ref={ref} />);
  act(() => ref.current!.openSnapshotReadModal(1));
  await act(async () => {
    ref.current!.openSnapshotReadModal(2);
  });
  await act(async () => resolveFirst({ ...snapshot, note: 'old', stockEvaluateList: [] }));
  expect(screen.getByRole('dialog')).toHaveTextContent('latest');
  expect(screen.getByRole('dialog')).not.toHaveTextContent('old');
});
