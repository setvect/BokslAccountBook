import { Currency, ExchangeRateModel, CurrencyAmountModel } from '../CommonType';
import { ResStockEvaluateModel } from '../ResModel';

export interface SnapshotAccountInput {
  accountType: number;
  balances: CurrencyAmountModel[];
  holdings: { stockBuySeq: number; currency: Currency }[];
}

/** Preserve per-account KRW rounding; no database or renderer state is accessed. */
export default function calculateSnapshotAssets(
  accounts: SnapshotAccountInput[],
  evaluations: ResStockEvaluateModel[],
  exchangeRates: ExchangeRateModel[],
): { accountType: number; totalAmount: number; evaluateAmount: number }[] {
  const rates = new Map(exchangeRates.map(({ currency, rate }) => [currency, rate]));
  const groups = new Map<number, { accountType: number; totalAmount: number; evaluateAmount: number }>();
  accounts.forEach((account) => {
    const rate = (currency: Currency) => rates.get(currency) || 1;
    const cash = Math.round(account.balances.reduce((sum, balance) => sum + balance.amount * rate(balance.currency), 0));
    const holdings = new Map(account.holdings.map((holding) => [holding.stockBuySeq, holding.currency]));
    const stockValue = (field: 'buyAmount' | 'evaluateAmount') =>
      Math.round(
        evaluations.reduce((sum, evaluation) => {
          const currency = holdings.get(evaluation.stockBuySeq);
          return currency ? sum + evaluation[field] * rate(currency) : sum;
        }, 0),
      );
    const group = groups.get(account.accountType) ?? { accountType: account.accountType, totalAmount: 0, evaluateAmount: 0 };
    group.totalAmount += cash + stockValue('buyAmount');
    group.evaluateAmount += cash + stockValue('evaluateAmount');
    groups.set(account.accountType, group);
  });
  return [...groups.values()];
}
