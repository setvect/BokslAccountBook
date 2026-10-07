import { Currency, TransactionKind } from '../../common/CommonType';

export interface BalanceChange {
  accountSeq: number;
  currency: Currency;
  amount: number;
}

type TransactionInput = {
  kind: TransactionKind;
  payAccount?: number;
  receiveAccount?: number;
  currency: Currency;
  amount: number;
  fee: number;
};

type ExchangeInput = {
  accountSeq: number;
  sellCurrency: Currency;
  sellAmount: number;
  buyCurrency: Currency;
  buyAmount: number;
  fee: number;
};

function change(accountSeq: number | undefined, currency: Currency, amount: number): BalanceChange {
  if (!accountSeq || !Number.isInteger(accountSeq) || accountSeq < 1) throw new Error('계좌를 선택해 주세요.');
  if (!Number.isFinite(amount)) throw new Error('금액은 유한한 숫자여야 합니다.');
  if (!Object.values(Currency).includes(currency)) throw new Error('통화가 올바르지 않습니다.');
  return { accountSeq, currency, amount };
}

/** Signed amounts are preserved (including reversals/refunds); no rounding is applied. */
export function transactionBalanceChanges(input: TransactionInput): BalanceChange[] {
  switch (input.kind) {
    case TransactionKind.SPENDING:
      return [change(input.payAccount, input.currency, -(input.amount + input.fee))];
    case TransactionKind.INCOME:
      return [change(input.receiveAccount, input.currency, input.amount - input.fee)];
    case TransactionKind.TRANSFER:
      return [change(input.payAccount, input.currency, -input.amount - input.fee), change(input.receiveAccount, input.currency, input.amount)];
    default:
      throw new Error('거래 유형을 찾을 수 없습니다.');
  }
}

export function exchangeBalanceChanges(input: ExchangeInput): BalanceChange[] {
  return [
    change(input.accountSeq, input.sellCurrency, -input.sellAmount),
    change(input.accountSeq, input.buyCurrency, input.buyAmount),
    change(input.accountSeq, Currency.KRW, -input.fee),
  ];
}

export function reverseBalanceChanges(changes: BalanceChange[]): BalanceChange[] {
  return changes.map((item) => ({ ...item, amount: -item.amount }));
}
