import { ExchangeKind, TradeKind, TransactionKind } from '../../common/CommonType';

export interface TransactionModalHandle {
  openTransactionModal: (kind: TransactionKind, transactionSeq: number, selectDate: Date | null) => void;
  hideTransactionModal: () => void;
}
export interface ExchangeModalHandle {
  openExchangeModal: (kind: ExchangeKind, exchangeSeq: number, selectDate: Date | null) => void;
  hideExchangeModal: () => void;
}
export interface TradeModalHandle {
  openTradeModal: (kind: TradeKind, tradeSeq: number, selectDate: Date | null) => void;
  hideTradeModal: () => void;
}
export interface LedgerModalProps {
  onSubmit: () => void;
}
