import { CodeKind, Currency, CurrencyAmountModel, ExchangeKind, TradeKind, TransactionKind } from './CommonType';
import { AccountType, StockEvaluateModel } from '../renderer/common/RendererModel';

// TODO 타입 이름 변경을 고려 해보기. CodeFrom -> ReqCodeModel

export type CodeFrom = {
  codeItemSeq: number;
  codeMainId: CodeKind;
  name: string;
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
// 환전 입력폼
export type ExchangeForm = {
  exchangeSeq: number; // 일련번호
  kind: ExchangeKind; // 유형
  exchangeDate: Date; // 거래일자
  accountSeq: number; // 거래계좌
  note: string; // 메모
  sellCurrency: Currency; // 매도 통화 코드
  sellAmount: number; // 매도 금액
  buyCurrency: Currency; // 매수 코드
  buyAmount: number; // 매수 금액
  fee: number; // 수수료 (원화에서 차감)
};
// 메모 입력폼
export type MemoForm = {
  memoSeq: number; // 일련번호
  memoDate: Date; // 거래일자
  note: string; // 메모
};
export type CategoryFrom = {
  kind: TransactionKind;
  categorySeq: number;
  name: string;
  parentSeq: number;
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
  buyAmount: number; // 매수금액
  quantity: number; // 수량
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

// 거래 내역 검색 조건
export type ReqSearchModel = {
  note?: string;
  from: Date;
  to: Date;
  accountSeq?: number;
  checkType: Set<AccountType>;
  currency?: Currency;
};

export type ReqMonthlySummaryModel = {
  from: Date;
  to: Date;
  kind: TransactionKind;
  currency: Currency;
};
