export enum TransactionKind {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
  TRANSFER = 'TRANSFER',
}
export enum TradeKind {
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
  EXCHANGE = 'EXCHANGE', // 환전
  MEMO = 'MEMO', // 메모
}

export const AccountProperties = {
  [AccountType.EXPENSE]: { color: '#00bb33' },
  [AccountType.INCOME]: { color: '#ff99cc' },
  [AccountType.TRANSFER]: { color: '#66ccff' },
  [AccountType.BUY]: { color: '#f51818' },
  [AccountType.SELL]: { color: '#1b61d1' },
  [AccountType.EXCHANGE]: { color: '#add8e6' },
  [AccountType.MEMO]: { color: 'grey' },
};

export enum ActionType {
  ADD = 'ADD',
  EDIT = 'EDIT',
}

// 거래내역 입력폼
export type TransactionModalForm = {
  transactionDate: Date; // 거래일자
  categorySeq: number; // 항목
  kind: TransactionKind; // 유형: INCOME, SPENDING, TRANSFER
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
  EUR = 'EUR',
  CNY = 'CNY',
}

export const CurrencyProperties = {
  [Currency.KRW]: { name: '원', symbol: '₩' },
  [Currency.USD]: { name: '달러', symbol: '$' },
  [Currency.JPY]: { name: '엔', symbol: '¥' },
  [Currency.EUR]: { name: '유로', symbol: '€' },
  [Currency.CNY]: { name: '위안', symbol: '¥' },
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
