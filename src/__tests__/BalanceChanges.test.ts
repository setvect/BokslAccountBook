import { Currency, TransactionKind } from '../common/CommonType';
import { exchangeBalanceChanges, reverseBalanceChanges, transactionBalanceChanges } from '../main/domain/balanceChanges';

it('keeps decimal and signed refund amounts without rounding', () => {
  expect(transactionBalanceChanges({ kind: TransactionKind.INCOME, receiveAccount: 2, currency: Currency.USD, amount: 10.125, fee: 0.025 })).toEqual([
    { accountSeq: 2, currency: Currency.USD, amount: 10.1 },
  ]);
  expect(transactionBalanceChanges({ kind: TransactionKind.SPENDING, payAccount: 1, currency: Currency.KRW, amount: -100, fee: 0 })).toEqual([
    { accountSeq: 1, currency: Currency.KRW, amount: 100 },
  ]);
});

it('reverses every currency change while preserving the input', () => {
  const input = { accountSeq: 1, sellCurrency: Currency.USD, sellAmount: 10, buyCurrency: Currency.KRW, buyAmount: 13000, fee: 100 };
  const effects = exchangeBalanceChanges(input);
  expect(effects).toEqual([
    { accountSeq: 1, currency: Currency.USD, amount: -10 },
    { accountSeq: 1, currency: Currency.KRW, amount: 13000 },
    { accountSeq: 1, currency: Currency.KRW, amount: -100 },
  ]);
  expect(reverseBalanceChanges(reverseBalanceChanges(effects))).toEqual(effects);
  expect(input.fee).toBe(100);
});

it('rejects missing accounts and non-finite amounts before applying changes', () => {
  expect(() => transactionBalanceChanges({ kind: TransactionKind.SPENDING, currency: Currency.KRW, amount: 1, fee: 0 })).toThrow('계좌');
  expect(() =>
    transactionBalanceChanges({ kind: TransactionKind.INCOME, receiveAccount: 1, currency: Currency.KRW, amount: Infinity, fee: 0 }),
  ).toThrow('유한');
});
