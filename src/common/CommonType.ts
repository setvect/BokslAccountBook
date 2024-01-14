// eslint-disable-next-line import/prefer-default-export
export enum IPC_CHANNEL {
  ipcExample = 'ipcExample',
  PageAboutBoksl = 'PageAboutBoksl',
  PageChangePassword = 'PageChangePassword',

  CallUserCheckPassword = 'CallUserCheckPassword',
  CallUserChangePassword = 'CallUserChangePassword',

  CallCategoryLoad = 'CallCategoryLoad',
  CallCategoryUpdateOrder = 'CallCategoryUpdateOrder',
  CallCategorySave = 'CallCategorySave',
  CallCategoryUpdate = 'CallCategoryUpdate',
  CallCategoryDelete = 'CallCategoryDelete',

  CallAccountLoad = 'CallAccountLoad',
  CallAccountSave = 'CallAccountSave',
  CallAccountUpdate = 'CallAccountUpdate',
  CallAccountDelete = 'CallAccountDelete',

  CallStockLoad = 'CallStockLoad',
  CallStockSave = 'CallStockSave',
  CallStockUpdate = 'CallStockUpdate',
  CallStockDelete = 'CallStockDelete',

  CallStockBuyLoad = 'CallStockBuyLoad',
  CallStockBuySave = 'CallStockBuySave',
  CallStockBuyUpdate = 'CallStockBuyUpdate',
  CallStockBuyDelete = 'CallStockBuyDelete',

  CallCodeLoad = 'CallCodeLoad',
  CallCodeUpdateOrder = 'CallCodeUpdateOrder',
  CallCodeSave = 'CallCodeSave',
  CallCodeUpdate = 'CallCodeUpdate',
  CallCodeDelete = 'CallCodeDelete',

  CallFavoriteLoad = 'CallFavoriteLoad',
  CallFavoriteUpdateOrder = 'CallFavoriteUpdateOrder',
  CallFavoriteSave = 'CallFavoriteSave',
  CallFavoriteUpdate = 'CallFavoriteUpdate',
  CallFavoriteDelete = 'CallFavoriteDelete',

  CallTransactionGet = 'CallTransactionGet',
  CallTransactionList = 'CallTransactionList',
  CallTransactionMonthlyFinancialSummary = 'CallTransactionMonthlyFinancialSummary',
  CallTransactionMonthlyAmountSum = 'CallTransactionMonthlyAmountSum',
  CallTransactionSave = 'CallTransactionSave',
  CallTransactionUpdate = 'CallTransactionUpdate',
  CallTransactionDelete = 'CallTransactionDelete',

  CallTradeGet = 'CallTradeGet',
  CallTradeList = 'CallTradeList',
  CallTradeMonthlyAmountSum = 'CallTradeMonthlyAmountSum',
  CallTradeSave = 'CallTradeSave',
  CallTradeUpdate = 'CallTradeUpdate',
  CallTradeDelete = 'CallTradeDelete',

  CallExchangeGet = 'CallExchangeGet',
  CallExchangeList = 'CallExchangeList',
  CallExchangeSave = 'CallExchangeSave',
  CallExchangeUpdate = 'CallExchangeUpdate',
  CallExchangeDelete = 'CallExchangeDelete',

  CallMemoGet = 'CallMemoGet',
  CallMemoSeqGetDate = 'CallMemoSeqGetDate',
  CallMemoList = 'CallMemoList',
  CallMemoSave = 'CallMemoSave',
  CallMemoUpdate = 'CallMemoUpdate',
  CallMemoDelete = 'CallMemoDelete',

  CallAssetTrend = 'CallAssetTrend',

  CallStoreExchangeRateGet = 'CallStoreExchangeRateGet',
  CallStoreExchangeRateSave = 'CallStoreExchangeRateSave',

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
}

export type CurrencyAmountModel = {
  currency: Currency;
  amount: number;
};

export type ExchangeRateModel = {
  currency: Currency;
  rate: number;
};

export enum ExchangeKind {
  EXCHANGE_BUY = 'EXCHANGE_BUY', // 환전 - 원화 매수(예: 매도 통화(USD)를 원화(KRW, 고정)로 환전)
  EXCHANGE_SELL = 'EXCHANGE_SELL', // 환전 - 원화 매도(예: 매도 원화(KRW, 고정)를 통화(USD)로 환전)
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
