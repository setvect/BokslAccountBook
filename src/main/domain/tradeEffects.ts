import { TradeKind } from '../../common/CommonType';

type TradeInput = { kind: TradeKind; quantity: number; price: number; fee: number; tax: number };
type Holding = { quantity: number; buyAmount: number };
export interface TradeEffect {
  cash: number;
  quantity: number;
  cost: number;
  sellGains: number;
}

export function calculateTradeEffect(trade: TradeInput, holding: Holding): TradeEffect {
  if (!Number.isFinite(trade.quantity) || trade.quantity <= 0) throw new Error('매매 수량은 0보다 커야 합니다.');
  if (![trade.price, trade.fee, trade.tax].every(Number.isFinite) || trade.price < 0) throw new Error('매매 금액이 올바르지 않습니다.');
  const gross = trade.price * trade.quantity;
  if (!Number.isFinite(gross)) throw new Error('매매 금액이 너무 큽니다.');
  switch (trade.kind) {
    case TradeKind.BUY:
      return { cash: -(gross + trade.fee + trade.tax), quantity: trade.quantity, cost: gross, sellGains: 0 };
    case TradeKind.SELL: {
      const remaining = normalizeQuantity(holding.quantity, -trade.quantity);
      if (remaining < 0) throw new Error('매도 수량이 매수 수량보다 많습니다.');
      const cost = remaining === 0 ? holding.buyAmount : (holding.buyAmount / holding.quantity) * trade.quantity;
      return { cash: gross - trade.fee - trade.tax, quantity: -trade.quantity, cost: -cost, sellGains: gross - cost };
    }
    default:
      throw new Error('매매 유형을 찾을 수 없습니다.');
  }
}

/** Reverse the cost recorded with the original sale, not today's average price. */
export function reverseTradeEffect(trade: TradeInput & { sellGains: number }): TradeEffect {
  const gross = trade.price * trade.quantity;
  switch (trade.kind) {
    case TradeKind.BUY:
      return { cash: gross + trade.fee + trade.tax, quantity: -trade.quantity, cost: -gross, sellGains: 0 };
    case TradeKind.SELL:
      return { cash: -(gross - trade.fee - trade.tax), quantity: trade.quantity, cost: gross - trade.sellGains, sellGains: 0 };
    default:
      throw new Error('매매 유형을 찾을 수 없습니다.');
  }
}

/** Remove only floating-point cancellation noise, not meaningful fractional shares. */
export function normalizeQuantity(current: number, delta: number): number {
  const result = current + delta;
  const tolerance = Number.EPSILON * Math.max(1, Math.abs(current), Math.abs(delta)) * 8;
  return Math.abs(result) <= tolerance ? 0 : result;
}
