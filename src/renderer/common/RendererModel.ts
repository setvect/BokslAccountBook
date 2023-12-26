// renderer process 전용 모델
import { Currency, CurrencyAmountModel, TradeKind, TransactionKind } from '../../common/CommonType';

export const TransactionKindProperties = {
  [TransactionKind.SPENDING]: { label: '지출', color: 'account-spending' },
  [TransactionKind.INCOME]: { label: '수입', color: 'account-income' },
  [TransactionKind.TRANSFER]: { label: '이체', color: 'account-transfer' },
};

export const TradeKindProperties = {
  [TradeKind.BUY]: { label: '매수', color: 'account-buy' },
  [TradeKind.SELL]: { label: '매도', color: 'account-sell' },
};

export enum AccountType {
  EXPENSE = 'EXPENSE', // 지출
  INCOME = 'INCOME', // 수입
  TRANSFER = 'TRANSFER', // 이체
  BUY = 'BUY', // 매수
  SELL = 'SELL', // 매도
  EXCHANGE_BUY = 'EXCHANGE_BUY', // 환전 - 원화 매수(예: 매도 통화(USD)를 원화(KRW, 고정)로 환전)
  EXCHANGE_SELL = 'EXCHANGE_SELL', // 환전 - 원화 매도(예: 매도 원화(KRW, 고정)를 통화(USD)로 환전)
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

// decimalPlace: 소수점 자리수
export const CurrencyProperties = {
  [Currency.KRW]: { name: '원', symbol: '₩', decimalPlace: 0 },
  [Currency.USD]: { name: '달러', symbol: '$', decimalPlace: 2 },
  [Currency.JPY]: { name: '엔', symbol: '¥', decimalPlace: 0 },
  // [Currency.EUR]: { name: '유로', symbol: '€' },
  // [Currency.CNY]: { name: '위안', symbol: '¥' },
};

// 거래내역 입력폼
export type TransactionForm = {
  transactionSeq: number; // 일련번호
  transactionDate: Date; // 거래일자
  categorySeq: number; // 항목
  kind: TransactionKind; // 유형
  note: string; // 메모
  currency: Currency; // 통화
  amount: number; // 금액
  payAccount: number; // 지출계좌
  receiveAccount: number; // 수입계좌
  attribute: number; // 속성
  fee: number; // 수수료
};

// 자주쓰는 거래내역 입력폼
export type FavoriteForm = {
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
};

// 주식 거래 입력폼
export type TradeForm = {
  tradeSeq: number; // 일련번호
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

// 환전 입력폼
export type ExchangeForm = {
  exchangeSeq: number; // 일련번호
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
export type MemoForm = {
  memoDate: Date; // 거래일자
  note: string; // 메모
};

export type CategoryFrom = {
  categorySeq: number;
  name: string;
};

// 계좌 입력폼
export type AccountForm = {
  accountSeq: number; // 일련번호
  name: string; // 이름
  accountNumber: string; // 계좌번호
  assetType: number; // 자산종류
  accountType: number; // 계좌성격
  stockF: boolean; // 주식계좌여부
  balance: CurrencyAmountModel[]; // 잔고
  interestRate?: string; // 이율
  term?: string; // 계약기간
  expDate?: string; // 만기일
  monthlyPay?: string; // 월 납입액
  transferDate?: string; // 이체일
  note?: string; // 메모 내용
  enableF?: boolean; // 사용여부
};

// 주식 종목 입력폼
export type StockForm = {
  stockSeq: number; // 일련번호
  name: string; // 종목명
  currency: Currency; // 매매 통화
  stockTypeCode: number; // 종목유형
  nationCode: number; // 상장국가
  link: string; // 상세정보 링크
  note?: string; // 메모
  enableF: boolean; // 사용여부
};

// 주식 매수 종목 입력폼
export type StockBuyForm = {
  stockBuySeq: number; // 일련번호
  stockSeq: number; // 주식 종목 일련번호
  accountSeq: number; // 계좌 일련번호
  purchaseAmount: number; // 매수금액
  quantity: number; // 수량
};

// 주식 자산 평가 모델
export type StockEvaluateModel = {
  stockBuySeq: number; // 주식 종목 일련번호
  buyAmount: number; // 매수금액
  evaluateAmount: number; // 평가금액
};

// 자산 스냅샷 API 응답값
export type AssetSnapshotForm = {
  assetSnapshotSeq: number; // 일련번호
  note: string; // 설명
  exchangeRate: CurrencyAmountModel[]; // KRW 기준 다른 통화 환율
  stockEvaluate: StockEvaluateModel[];
  stockSellCheckDate: Date; // 메도 체크 시작일
  regDate: Date; // 등록일
};
