export enum Kind {
  INCOME = 'INCOME',
  SPENDING = 'SPENDING',
  TRANSFER = 'TRANSFER',
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
