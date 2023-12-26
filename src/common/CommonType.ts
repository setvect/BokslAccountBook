// eslint-disable-next-line import/prefer-default-export
export enum IPC_CHANNEL {
  ipcExample = 'ipcExample',
  PageAboutBoksl = 'PageAboutBoksl',
  PageChangePassword = 'PageChangePassword',

  CallUserCheckPassword = 'CallUserCheckPassword',
  CallUserChangePassword = 'CallUserChangePassword',

  CallCategoryLoad = 'CallCategoryLoad',

  CallCodeLoad = 'CallCodeLoad',
  CallCodeUpdateOrder = 'CallCodeUpdateOrder',
  CallCodeSave = 'CallCodeSave',

  ErrorCommon = 'ErrorCommon',
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

/**
 * 코드 매핑을 위한 유틸리티
 */
export enum CodeKind {
  ASSET_TYPE = 'ASSET_TYPE',
  SPENDING_ATTR = 'SPENDING_ATTR',
  TRANSFER_ATTR = 'TRANSFER_ATTR',
  INCOME_ATTR = 'INCOME_ATTR',
  STOCK_TYPE = 'STOCK_TYPE',
  ACCOUNT_TYPE = 'ACCOUNT_TYPE',
  NATION_TYPE = 'NATION_TYPE',
}
