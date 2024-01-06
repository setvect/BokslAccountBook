import React from 'react';
import _ from 'lodash';
import { ResTradeModel } from '../../../common/ResModel';
import { Currency, TradeKind } from '../../../common/CommonType';
import StockMapper from '../../mapper/StockMapper';
import { CurrencyProperties } from '../../common/RendererModel';
import { convertToCommaSymbol, convertToPercentage } from '../util/util';

interface TradeSummaryProps {
  tradeList: ResTradeModel[];
}

function TradeSummary({ tradeList }: TradeSummaryProps) {
  const calculateSumByType = (kind: TradeKind) => {
    const filteredList = tradeList.filter((trade) => trade.kind === kind);
    return Object.values(Currency)
      .map((currency) => {
        const sum = filteredList.reduce((acc, trade) => {
          return StockMapper.getStock(trade.stockSeq).currency === currency ? acc + trade.price * trade.quantity : acc;
        }, 0);
        return { currency, amount: sum };
      })
      .filter((currencySum) => currencySum.amount !== 0);
  };

  const buySum = calculateSumByType(TradeKind.BUY);
  const sellSum = calculateSumByType(TradeKind.SELL);

  const sellList = tradeList.filter((trade) => trade.kind === TradeKind.SELL);
  // {currency: 통화, sellAmount: 매도금액, sellGains: 매도차익, rate: 수익률}
  const sellGains = Object.values(Currency)
    .map((currency) => {
      const sellListByCurrency = sellList.filter((sell) => StockMapper.getStock(sell.stockSeq).currency === currency);
      if (sellListByCurrency.length === 0) {
        return null;
      }
      const sellAmount = _.sumBy(sellListByCurrency, (sell) => sell.price * sell.quantity);
      const sellGains = _.sumBy(sellListByCurrency, 'sellGains');
      const buyAmount = sellAmount - sellGains;
      const rate = (sellAmount - buyAmount) / buyAmount;

      return { currency, sellAmount, sellGains, rate };
    })
    .filter((sellGain) => sellGain !== null) as {
    currency: Currency;
    sellAmount: number;
    sellGains: number;
    rate: number;
  }[];

  return (
    <tbody>
      {buySum.map((currencySum) => (
        <tr key={currencySum.currency}>
          <td>
            <span className="account-buy">매수({CurrencyProperties[currencySum.currency].name})</span>
          </td>
          <td className="right">{convertToCommaSymbol(currencySum.amount, currencySum.currency)}</td>
        </tr>
      ))}
      {sellSum.map((currencySum) => (
        <tr key={currencySum.currency}>
          <td>
            <span className="account-sell">매도({CurrencyProperties[currencySum.currency].name})</span>
          </td>
          <td className="right">{convertToCommaSymbol(currencySum.amount, currencySum.currency)}</td>
        </tr>
      ))}
      {sellGains.map((currencySum) => (
        <tr key={currencySum.currency}>
          <td>매도차익({CurrencyProperties[currencySum.currency].name})</td>
          <td className="right">
            <span className={currencySum.sellGains > 0 ? 'account-buy' : 'account-sell'}>
              {convertToCommaSymbol(currencySum.sellGains, currencySum.currency)}({convertToPercentage(currencySum.rate)})
            </span>
          </td>
        </tr>
      ))}
    </tbody>
  );
}

export default TradeSummary;
