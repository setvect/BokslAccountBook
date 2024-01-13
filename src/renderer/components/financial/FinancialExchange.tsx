import { Button, Col, Container, Row, Table } from 'react-bootstrap';
import React, { useEffect, useRef, useState } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import moment from 'moment';
import _ from 'lodash';
import YearSelect from '../common/YearSelect';
import { convertToCommaSymbol, downloadForTable } from '../util/util';

import { Currency, ExchangeKind } from '../../../common/CommonType';
import { ResExchangeModel } from '../../../common/ResModel';
import { ReqSearchModel } from '../../../common/ReqModel';
import { AccountType } from '../../common/RendererModel';
import IpcCaller from '../../common/IpcCaller';

type ExchangeSummary = {
  kind: ExchangeKind;
  currency: Currency;
  month: number;
  buyCurrency: Currency;
  buyTotalAmount: number;
  sellCurrency: Currency;
  sellTotalAmount: number;
};

function FinancialExchange() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [exchangeSummaryList, setExchangeSummaryList] = useState<ExchangeSummary[]>([]);

  const handleYearChange = (year: number) => {
    setYear(year);
  };

  const tableRef = useRef<HTMLTableElement>(null);
  const handleDownloadClick = () => {
    downloadForTable(tableRef, `환전_결산내역_${year}.xls`);
  };
  const calculateExchangeSummary = (list: ResExchangeModel[]): ExchangeSummary[] => {
    return _(list)
      .groupBy((exchange) => {
        const month = moment(exchange.exchangeDate).format('MM');
        const currency = exchange.kind === ExchangeKind.EXCHANGE_BUY ? exchange.sellCurrency : exchange.buyCurrency;
        return `${exchange.kind}|${currency}|${month}`;
      })
      .map((groupedExchanges, key) => {
        const [kind, currency, month] = key.split('|');
        const buyTotalAmount = _.sumBy(groupedExchanges, (exchange) => exchange.buyAmount);
        const sellTotalAmount = _.sumBy(groupedExchanges, (exchange) => exchange.sellAmount);
        return {
          kind: kind as ExchangeKind,
          currency: currency as Currency,
          month: Number(month),
          buyCurrency: groupedExchanges[0].buyCurrency,
          buyTotalAmount,
          sellCurrency: groupedExchanges[0].sellCurrency,
          sellTotalAmount,
        };
      })
      .value();
  };

  const getAmount = (kind: ExchangeKind, month: number, currency: Currency) => {
    const result = exchangeSummaryList.find((e) => e.kind === kind && e.month === month && e.currency === currency);
    const buyAmount = result ? result.buyTotalAmount : 0;
    const sellAmount = result ? result.sellTotalAmount : 0;
    if (buyAmount === 0 && sellAmount === 0) {
      return '0';
    }
    // 외국 통화 -> 원화
    if (kind === ExchangeKind.EXCHANGE_BUY) {
      return `${convertToCommaSymbol(sellAmount, currency)}->${convertToCommaSymbol(buyAmount, Currency.KRW)}`;
    }
    // 원화 -> 외국 통화
    if (kind === ExchangeKind.EXCHANGE_SELL) {
      return `${convertToCommaSymbol(sellAmount, Currency.KRW)}->${convertToCommaSymbol(buyAmount, currency)}`;
    }
    return '';
  };

  useEffect(() => {
    (async () => {
      const searchModel: ReqSearchModel = {
        from: new Date(year, 0, 1),
        to: new Date(year, 11, 31),
        checkType: new Set<AccountType>([AccountType.EXCHANGE_BUY, AccountType.EXCHANGE_SELL]),
      };
      const list = await IpcCaller.getExchangeList(searchModel);
      setExchangeSummaryList(calculateExchangeSummary(list));
    })();
  }, [year]);

  return (
    <Container fluid className="ledger-table">
      <Row>
        <Col>
          <YearSelect onChange={(year) => handleYearChange(year)} />
        </Col>
        <Col>
          <Button onClick={handleDownloadClick} variant="primary" style={{ float: 'right' }}>
            내보내기(엑셀)
          </Button>
        </Col>
      </Row>
      <Row style={{ marginTop: '15px' }}>
        <Col>
          <Table striped bordered hover className="table-th-center table-font-size" ref={tableRef}>
            <thead>
              <tr>
                <th>항목</th>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <th key={`head_${month}`}>
                    {year}년 {month}월
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.values(Currency)
                .filter((currency) => currency !== Currency.KRW)
                .map((currency) => {
                  return (
                    <tr key={`buy_${currency}`}>
                      <td>
                        {currency} <FaArrowRight style={{ marginTop: '-2px' }} /> {Currency.KRW}
                      </td>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <td key={`buy_${month}`} className="right">
                          {getAmount(ExchangeKind.EXCHANGE_BUY, month, currency)}
                        </td>
                      ))}
                    </tr>
                  );
                })}

              {Object.values(Currency)
                .filter((currency) => currency !== Currency.KRW)
                .map((currency) => (
                  <tr key={`sell_${currency}`}>
                    <td>
                      {Currency.KRW} <FaArrowRight style={{ marginTop: '-2px' }} /> {currency}
                    </td>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                      return (
                        <td key={`sell_${month}`} className="right">
                          {getAmount(ExchangeKind.EXCHANGE_SELL, month, currency)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}

export default FinancialExchange;
