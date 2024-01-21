// renderer process가 main process에게 받는 데이터의 형식을 정의

import { CodeKind, Currency, CurrencyAmountModel, ExchangeKind, ExchangeRateModel, TradeKind, TransactionKind } from './CommonType';

export type ResFavoriteModel = {
  favoriteSeq: number;
  title: string;
  categorySeq: number;
  kind: TransactionKind;
  note: string;
  currency: Currency;
  amount: number;
  payAccount: number;
  receiveAccount: number;
  attribute: number;
  orderNo: number;
};

// API 응답값
export type ResTradeModel = {
  tradeSeq: number;
  kind: TradeKind;
  note: string;
  stockSeq: number;
  quantity: number;
  price: number;
  sellGains: number;
  tax: number;
  fee: number;
  accountSeq: number;
  tradeDate: Date;
};

export type ResTransactionModel = {
  transactionSeq: number;
  categorySeq: number;
  kind: TransactionKind;
  payAccount?: number;
  receiveAccount?: number;
  attribute: number;
  currency: Currency;
  amount: number;
  transactionDate: Date;
  note: string;
  fee: number;
};

export type ResExchangeModel = {
  exchangeSeq: number;
  kind: ExchangeKind;
  note: string;
  sellCurrency: Currency;
  sellAmount: number;
  buyCurrency: Currency;
  buyAmount: number;
  fee: number;
  accountSeq: number;
  exchangeDate: Date;
};

export type ResMemoModal = {
  memoSeq: number;
  note: string;
  memoDate: Date;
  deleteF: boolean;
};

export type ResAccountModel = {
  accountSeq: number;
  assetType: number;
  accountType: number;
  name: string;
  balance: CurrencyAmountModel[];
  stockBuyPrice: CurrencyAmountModel[];
  interestRate: string;
  term: string;
  accountNumber: string;
  monthlyPay: string;
  expDate: string;
  transferDate: string;
  note: string;
  stockF: boolean;
  enableF: boolean;
  deleteF: boolean;
};

// 주식 종목 API 응답값
export type ResStockModel = {
  stockSeq: number; // 일련번호
  name: string; // 종목명
  currency: Currency; // 매매 통화
  stockTypeCode: number; // 종목유형
  nationCode: number; // 상장국가
  link: string; // 상세정보 링크
  note?: string; // 메모
  enableF: boolean; // 사용여부
  deleteF: boolean; // 삭제여부
};

// 매수 주식 목록 API 응답값
export type ResStockBuyModel = {
  stockBuySeq: number; // 일련번호
  stockSeq: number; // 주식 종목 일련번호
  accountSeq: number; // 계좌 일련번호
  buyAmount: number; // 매수금액
  quantity: number; // 수량
  deleteF: boolean; // 삭제여부
};

export type ResCategoryModel = {
  categorySeq: number;
  kind: TransactionKind;
  name: string;
  parentSeq: number;
  orderNo: number;
  deleteF: boolean;
};

export type ResErrorModel = {
  message: string;
};

export type ResCodeValueModel = {
  codeSeq: number;
  name: string;
  orderNo: number;
  deleteF: boolean;
};

export type ResCodeModel = {
  code: CodeKind;
  name: string;
  deleteF: boolean;
  subCodeList: ResCodeValueModel[];
};

export type ResTransactionSummary = {
  transactionDate: Date;
  parentSeq: number;
  amount: number;
};

export type ResTransactionSum = {
  transactionDate: Date;
  kind: TransactionKind;
  amount: number;
  fee: number;
};

export type ResTradeSum = {
  tradeDate: Date;
  kind: TradeKind;
  amount: number;
};

export type ResSellGainsSum = {
  tradeDate: Date;
  amount: number;
  tax: number;
  fee: number;
};

export type ResAssetTrend = {
  tradeDate: Date;
  amount: number;
};

export type ResSnapshotModel = {
  snapshotSeq: number;
  note: string;
  stockSellCheckDate?: Date;
  regDate: Date;
  deleteF: boolean;
  exchangeRateList: ExchangeRateModel[];
  assetGroupList: ResAssetGroupModel[];
  stockEvaluateList: ResStockEvaluateModel[];
  tradeList: ResTradeModel[]; // stockSellCheckDate 이후의 매도 내역
};

export type ResAssetGroupModel = {
  assetGroupSeq: number;
  accountType: number;
  totalAmount: number;
  evaluateAmount: number;
};

export type ResStockEvaluateModel = {
  stockBuySeq: number;
  buyAmount: number;
  evaluateAmount: number;
};

export type ResPageModel<T> = {
  list: T[];
  // 한페이지 당 보여줄 데이터 수
  pagePerSize: number;
  total: number;
};
