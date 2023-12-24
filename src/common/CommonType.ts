// eslint-disable-next-line import/prefer-default-export
export enum IPC_CHANNEL {
  ipcExample = 'ipcExample',
  aboutBoksl = 'aboutBoksl',
  changePassword = 'changePassword',
  loadCategory = 'loadCategory',
}

export enum TransactionKind {
  SPENDING = 'SPENDING',
  INCOME = 'INCOME',
  TRANSFER = 'TRANSFER',
}

export enum Currency {
  KRW = 'KRW',
  USD = 'USD',
  JPY = 'JPY',
  // 환종이 추가 될 경우 추가함.
  // EUR = 'EUR',
  // CNY = 'CNY',
}

export type CurrencyAmountModel = {
  currency: Currency;
  amount: number;
};

export enum ExchangeKind {
  BUY = 'BUY', // 환전 - 원화 매수(예: 매도 통화(USD)를 원화(KRW, 고정)로 환전)
  SELL = 'SELL', // 환전 - 원화 매도(예: 매도 원화(KRW, 고정)를 통화(USD)로 환전)
}

export enum TradeKind {
  BUY = 'BUY',
  SELL = 'SELL',
}
