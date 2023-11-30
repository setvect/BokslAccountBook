export enum TransactionKind {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
  TRANSFER = 'TRANSFER',
}

export const TransactionKindProperties = {
  [TransactionKind.EXPENSE]: { label: '지출', color: 'account-expense' },
  [TransactionKind.INCOME]: { label: '수입', color: 'account-income' },
  [TransactionKind.TRANSFER]: { label: '이체', color: 'account-transfer' },
};

export enum TradeKind {
  BUY = 'BUY',
  SELL = 'SELL',
}
export const TradeKindProperties = {
  [TradeKind.BUY]: { label: '매수', color: 'account-buy' },
  [TradeKind.SELL]: { label: '매도', color: 'account-sell' },
};

export enum ExchangeKind {
  BUY = 'BUY',
  SELL = 'SELL',
}

export interface OptionType {
  value: number;
  label: string;
}

export enum AccountType {
  EXPENSE = 'EXPENSE', // 지출
  INCOME = 'INCOME', // 수입
  TRANSFER = 'TRANSFER', // 이체
  BUY = 'BUY', // 매수
  SELL = 'SELL', // 매도
  EXCHANGE_BUY = 'EXCHANGE_BUY', // 환전 - 원화 매수
  EXCHANGE_SELL = 'EXCHANGE_SELL', // 환전 - 원화 매도
  MEMO = 'MEMO', // 메모
}

export const AccountTypeProperties = {
  [AccountType.EXPENSE]: { label: '지출' },
  [AccountType.INCOME]: { label: '수입' },
  [AccountType.TRANSFER]: { label: '이체' },
  [AccountType.BUY]: { label: '매수' },
  [AccountType.SELL]: { label: '매도' },
  [AccountType.EXCHANGE_BUY]: { label: '환전 - 원화 매수' },
  [AccountType.EXCHANGE_SELL]: { label: '환전 - 원화 매도' },
  [AccountType.MEMO]: { label: '메모' },
};

export enum ActionType {
  ADD = 'ADD',
  EDIT = 'EDIT',
}

// 거래내역 입력폼
export type TransactionModalForm = {
  transactionDate: Date; // 거래일자
  categorySeq: number; // 항목
  kind: TransactionKind; // 유형
  note: string; // 메모
  money: number; // 금액
  payAccount: number; // 지출계좌
  receiveAccount: number; // 수입계좌
  attribute: string; // 속성
  fee: number; // 수수료
};

// 자주쓰는 거래내역 입력폼
export type FavoriteModalForm = {
  title: string;
  categorySeq: number;
  kind: TransactionKind;
  note: string;
  money: number;
  payAccount: number;
  receiveAccount: number;
  attribute: string;
};

// 주식 거래 입력폼
export type TradeModalForm = {
  tradeDate: Date; // 거래일자
  accountSeq: number; // 거래계좌
  stockSeq: number; // 종목
  note: string; // 메모
  kind: TradeKind; // 유형: BUYING, SELL
  quantity: number; // 수량
  price: number; // 단가
  tax: number; // 거래세
  fee: number; // 수수료
};

export enum Currency {
  KRW = 'KRW',
  USD = 'USD',
  JPY = 'JPY',
  // 환종이 추가 될 경우 추가함.
  // EUR = 'EUR',
  // CNY = 'CNY',
}

export const CurrencyProperties = {
  [Currency.KRW]: { name: '원', symbol: '₩' },
  [Currency.USD]: { name: '달러', symbol: '$' },
  [Currency.JPY]: { name: '엔', symbol: '¥' },
  // [Currency.EUR]: { name: '유로', symbol: '€' },
  // [Currency.CNY]: { name: '위안', symbol: '¥' },
};

// 환전 입력폼
export type ExchangeModalForm = {
  exchangeDate: Date; // 거래일자
  accountSeq: number; // 거래계좌
  note: string; // 메모
  currencyToSellCode: Currency; // 매도 통화 코드
  currencyToSellPrice: number; // 매도 금액
  currencyToBuyCode: Currency; // 매수 코드
  currencyToBuyPrice: number; // 매수 금액
  fee: number; // 수수료 (원화에서 차감)
};

// 메모 입력폼
export type MemoModalForm = {
  memoDate: Date; // 거래일자
  note: string; // 메모
};

// API 응답값
export type ResTradeModel = {
  id: number;
  type: TradeKind;
  memo: string;
  item: string;
  quantity: number;
  price: number;
  total: number;
  profitLossAmount?: number | null; // 손익금
  returnRate?: number | null; // 수익률
  tax: number;
  fee: number;
  account: string;
  date: string;
};

export type ResTransactionModel = {
  id: number;
  type: TransactionKind;
  memo: string;
  categoryMain: string;
  categorySub: string;
  price: number;
  fee: number;
  payAccount?: string | null;
  receiveAccount?: string | null;
  date: string;
};

export type ResExchangeModel = {
  id: number;
  type: ExchangeKind;
  memo: string;
  currencyToSell: Currency;
  currencyToSellPrice: number;
  currencyToBuy: Currency;
  currencyToBuyPrice: number;
  exchangeRate: number;
  fee: number;
  account: string;
  date: string;
};
