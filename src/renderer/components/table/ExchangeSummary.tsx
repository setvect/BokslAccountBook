import { Table } from 'react-bootstrap';
import React from 'react';
import { ResExchangeModel } from '../../../common/ResModel';
import { Currency, ExchangeKind } from '../../../common/CommonType';
import _ from 'lodash';
import { convertToCommaSymbol } from '../util/util';

interface ExchangeSummaryProps {
  exchangeList: ResExchangeModel[];
}

function ExchangeSummary({ exchangeList }: ExchangeSummaryProps) {
  const totalBuyAmount = _.sumBy(
    exchangeList.filter((exchange) => exchange.kind === ExchangeKind.EXCHANGE_BUY),
    'buyAmount',
  );
  const totalSellAmount = _.sumBy(
    exchangeList.filter((exchange) => exchange.kind === ExchangeKind.EXCHANGE_SELL),
    'sellAmount',
  );

  return (
    <Table striped bordered hover variant="dark" className="table-th-center table-font-size">
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
    </Table>
  );
}

export default ExchangeSummary;
