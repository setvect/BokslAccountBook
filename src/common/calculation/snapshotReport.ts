import { Currency, ExchangeRateModel } from '../CommonType';
import { calcYield } from '../CommonUtil';
import { ResSnapshotModel, ResStockBuyModel, ResStockModel } from '../ResModel';

export interface Valuation {
  buyAmount: number;
  evaluateAmount: number;
  profit: number;
  profitRate: number;
}
export interface GroupValuation extends Valuation {
  code: number;
}
export interface HoldingValuation extends Valuation {
  stockBuySeq: number;
  stockSeq: number;
  accountSeq: number;
  stock: ResStockModel;
  buyKrw: number;
  evaluateKrw: number;
}

/** Historical snapshots used 1 when a foreign rate was absent. Preserve that rule explicitly. */
export function snapshotRate(currency: Currency, rates: ExchangeRateModel[]): number {
  return rates.find((rate) => rate.currency === currency)?.rate || 1;
}
export function valuation(buyAmount: number, evaluateAmount: number): Valuation {
  return { buyAmount, evaluateAmount, profit: evaluateAmount - buyAmount, profitRate: calcYield(buyAmount, evaluateAmount) };
}
export function portion(amount: number, total: number): number {
  return total === 0 ? 0 : amount / total;
}
export function soldProfit(snapshot: ResSnapshotModel, stocks: ResStockModel[]): number {
  const stockById = new Map(stocks.map((stock) => [stock.stockSeq, stock]));
  return snapshot.tradeList.reduce((sum, trade) => {
    const stock = stockById.get(trade.stockSeq);
    if (!stock) throw new Error(`스냅샷의 종목 정보를 찾을 수 없습니다: ${trade.stockSeq}`);
    return sum + trade.sellGains * snapshotRate(stock.currency, snapshot.exchangeRateList);
  }, 0);
}
export function buildSnapshotReport(snapshot: ResSnapshotModel, stocks: ResStockModel[], holdings: ResStockBuyModel[]) {
  const stockById = new Map(stocks.map((stock) => [stock.stockSeq, stock]));
  const holdingById = new Map(holdings.map((holding) => [holding.stockBuySeq, holding]));
  const positions: HoldingValuation[] = snapshot.stockEvaluateList.map((evaluation) => {
    const holding = holdingById.get(evaluation.stockBuySeq);
    const stock = holding && stockById.get(holding.stockSeq);
    if (!holding || !stock) throw new Error(`스냅샷의 보유종목 정보를 찾을 수 없습니다: ${evaluation.stockBuySeq}`);
    const rate = snapshotRate(stock.currency, snapshot.exchangeRateList);
    return {
      ...valuation(evaluation.buyAmount, evaluation.evaluateAmount),
      stockBuySeq: evaluation.stockBuySeq,
      stockSeq: stock.stockSeq,
      accountSeq: holding.accountSeq,
      stock,
      buyKrw: evaluation.buyAmount * rate,
      evaluateKrw: evaluation.evaluateAmount * rate,
    };
  });
  const groupStocks = (key: 'stockTypeCode' | 'nationCode'): GroupValuation[] => {
    const groups = new Map<number, { buy: number; evaluated: number }>();
    positions.forEach((position) => {
      const code = position.stock[key];
      const values = groups.get(code) ?? { buy: 0, evaluated: 0 };
      values.buy += position.buyKrw;
      values.evaluated += position.evaluateKrw;
      groups.set(code, values);
    });
    return [...groups].map(([code, values]) => ({ code, ...valuation(values.buy, values.evaluated) }));
  };
  const assets: GroupValuation[] = snapshot.assetGroupList.map((group) => ({
    code: group.accountType,
    ...valuation(group.totalAmount, group.evaluateAmount),
  }));
  const totals = valuation(
    assets.reduce((sum, value) => sum + value.buyAmount, 0),
    assets.reduce((sum, value) => sum + value.evaluateAmount, 0),
  );
  const stockTotals = valuation(
    positions.reduce((sum, value) => sum + value.buyKrw, 0),
    positions.reduce((sum, value) => sum + value.evaluateKrw, 0),
  );
  const usedCurrencies = new Set(positions.map((position) => position.stock.currency));
  const missingRates = [...usedCurrencies].filter(
    (currency) => currency !== Currency.KRW && !snapshot.exchangeRateList.some((rate) => rate.currency === currency && rate.rate > 0),
  );
  return { assets, totals, positions, stockTypes: groupStocks('stockTypeCode'), stockNations: groupStocks('nationCode'), stockTotals, missingRates };
}
export type SnapshotReport = ReturnType<typeof buildSnapshotReport>;
export interface ValueComparison<T extends Valuation> {
  key: number;
  before: T | undefined;
  after: T | undefined;
  change: Valuation;
}
export function compareValuations<T extends Valuation>(before: T[], after: T[], key: (item: T) => number): ValueComparison<T>[] {
  const oldMap = new Map(before.map((item) => [key(item), item]));
  const newMap = new Map(after.map((item) => [key(item), item]));
  return [...new Set([...oldMap.keys(), ...newMap.keys()])].map((id) => {
    const oldValue = oldMap.get(id);
    const newValue = newMap.get(id);
    return {
      key: id,
      before: oldValue,
      after: newValue,
      change: {
        buyAmount: (newValue?.buyAmount ?? 0) - (oldValue?.buyAmount ?? 0),
        evaluateAmount: (newValue?.evaluateAmount ?? 0) - (oldValue?.evaluateAmount ?? 0),
        profit: (newValue?.profit ?? 0) - (oldValue?.profit ?? 0),
        profitRate: (newValue?.profitRate ?? 0) - (oldValue?.profitRate ?? 0),
      },
    };
  });
}
