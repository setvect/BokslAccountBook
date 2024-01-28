// renderer process 전용 모델
import { Currency, ExchangeKind, TradeKind, TransactionKind } from '../../common/CommonType';

export const TransactionKindProperties = {
  [TransactionKind.SPENDING]: { label: '지출', color: 'account-spending' },
  [TransactionKind.INCOME]: { label: '수입', color: 'account-income' },
  [TransactionKind.TRANSFER]: { label: '이체', color: 'account-transfer' },
};

export const TradeKindProperties = {
  [TradeKind.BUY]: { label: '주식 매수', color: 'account-buy' },
  [TradeKind.SELL]: { label: '주식 매도', color: 'account-sell' },
};
export const ExchangeKindProperties = {
  [ExchangeKind.EXCHANGE_BUY]: { label: '원화 매수', color: 'account-exchange-buy' },
  [ExchangeKind.EXCHANGE_SELL]: { label: '원화 매도', color: 'account-exchange-sell' },
};

export enum AccountType {
  SPENDING = 'SPENDING', // 지출
  INCOME = 'INCOME', // 수입
  TRANSFER = 'TRANSFER', // 이체
  BUY = 'BUY', // 매수
  SELL = 'SELL', // 매도
  EXCHANGE_BUY = 'EXCHANGE_BUY', // 환전 - 원화 매수(예: 매도 통화(USD)를 원화(KRW, 고정)로 환전)
  EXCHANGE_SELL = 'EXCHANGE_SELL', // 환전 - 원화 매도(예: 매도 원화(KRW, 고정)를 통화(USD)로 환전)
  MEMO = 'MEMO', // 메모
}

export const AccountTypeProperties = {
  [AccountType.SPENDING]: { label: '지출', order: 1 },
  [AccountType.INCOME]: { label: '수입', order: 2 },
  [AccountType.TRANSFER]: { label: '이체', order: 3 },
  [AccountType.BUY]: { label: '주식 매수', order: 4 },
  [AccountType.SELL]: { label: '주식 매도', order: 5 },
  [AccountType.EXCHANGE_BUY]: { label: '원화 매수', order: 6 },
  [AccountType.EXCHANGE_SELL]: { label: '원화 매도', order: 7 },
  [AccountType.MEMO]: { label: '메모', order: 8 },
};

// decimalPlace: 소수점 자리수
export const CurrencyProperties = {
  [Currency.KRW]: { name: '원', symbol: '₩', decimalPlace: 0, order: 1 },
  [Currency.USD]: { name: '달러', symbol: '$', decimalPlace: 2, order: 2 },
  [Currency.JPY]: { name: '엔', symbol: '¥', decimalPlace: 0, order: 3 },
  // [Currency.EUR]: { name: '유로', symbol: '€' },
  // [Currency.CNY]: { name: '위안', symbol: '¥' },
};

export interface OptionNumberType {
  value: number;
  label: string;
}

export interface OptionStringType {
  value: string;
  label: string;
}

export interface OptionCurrencyType {
  value: Currency;
  label: string;
}

// 통화 단위로 합산
export type CurrencySumModel = {
  currency: Currency;
  amount: number;
};
