export enum Kind {
  INCOME = 'INCOME',
  SPENDING = 'SPENDING',
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

export enum ActionType {
  ADD = 'ADD',
  EDIT = 'EDIT',
}

// 거래내역 입력폼
export type TransactionModalForm = {
  transactionDate: Date; // 거래일자
  categorySeq: number; // 항목
  kind: Kind; // 유형: INCOME, SPENDING, TRANSFER
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
  kind: Kind;
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
