import React from 'react';
import _ from 'lodash';
import { ResExchangeModel } from '../../../common/ResModel';
import { Currency, ExchangeKind } from '../../../common/CommonType';
import { convertToCommaSymbol } from '../util/util';

interface ExchangeSummaryProps {
  exchangeList: ResExchangeModel[];
}

function ExchangeSummary({ exchangeList }: ExchangeSummaryProps) {
  const totalBuyAmount = _.sumBy(_.filter(exchangeList, { kind: ExchangeKind.EXCHANGE_BUY }), 'buyAmount');
  const totalSellAmount = _.sumBy(_.filter(exchangeList, { kind: ExchangeKind.EXCHANGE_SELL }), 'sellAmount');

  return (
    <tbody>
      <tr>
        <td>
          <span className="account-buy">원화 매수</span>
        </td>
        <td className="right">{convertToCommaSymbol(totalBuyAmount, Currency.KRW)}</td>
      </tr>
      <tr>
        <td>
          <span className="account-sell">원화 매도</span>
        </td>
        <td className="right">{convertToCommaSymbol(totalSellAmount, Currency.KRW)}</td>
      </tr>
    </tbody>
  );
}

export default ExchangeSummary;
