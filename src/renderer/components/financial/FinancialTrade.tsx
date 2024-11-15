import { Button, Col, Container, Row, Table } from 'react-bootstrap';
import React, { useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import moment from 'moment/moment';
import YearSelect from '../common/YearSelect';
import { convertToCommaSymbol, downloadForTable } from '../util/util';
import FinancialTradeListModal, { FinancialTradeListModalHandle } from './FinancialTradeListModal';
import CurrencySelect from './CurrencySelect';
import { Currency, TradeKind } from '../../../common/CommonType';
import IpcCaller from '../../common/IpcCaller';
import { ReqSearchModel } from '../../../common/ReqModel';
import { AccountType } from '../../common/RendererModel';
import { ResTradeModel } from '../../../common/ResModel';

function FinancialTrade() {
  const financialTradeListModalRef = useRef<FinancialTradeListModalHandle>(null);
  const [tradeList, setTradeList] = useState<ResTradeModel[]>([]);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [currency, setCurrency] = useState<Currency>(Currency.KRW);

  const handleYearChange = (year: number) => {
    setYear(year);
  };

  const handleCurrencyChange = (currency: Currency) => {
    setCurrency(currency);
  };

  const openList = (type: AccountType, year: number, month: number) => {
    financialTradeListModalRef.current?.openModal(type, year, month, currency);
  };
  const tableRef = useRef<HTMLTableElement>(null);
  const handleDownloadClick = () => {
    downloadForTable(tableRef, `주식_결산내역_${year}.xls`);
  };

  const tradeAmountByMonth = (kind: AccountType) => {
    return _(tradeList)
      .filter((trade) => trade.kind.toString() === kind.toString())
      .groupBy((trade) => Number(moment(trade.tradeDate).format('MM')))
      .reduce(
        (acc, trade, monthStr) => {
          acc[Number(monthStr)] = _.sum(trade.map((t) => t.quantity * t.price));
          return acc;
        },
        {} as Record<number, number>,
      );
  };

  const tradeTaxByMonth = () => {
    return _(tradeList)
      .groupBy((trade) => Number(moment(trade.tradeDate).format('MM')))
      .reduce(
        (acc, trade, monthStr) => {
          acc[Number(monthStr)] = _(trade).sumBy('tax');
          return acc;
        },
        {} as Record<number, number>,
      );
  };
  const tradeFeeByMonth = () => {
    return _(tradeList)
      .groupBy((trade) => Number(moment(trade.tradeDate).format('MM')))
      .reduce(
        (acc, trade, monthStr) => {
          acc[Number(monthStr)] = _(trade).sumBy('fee');
          return acc;
        },
        {} as Record<number, number>,
      );
  };

  const tradeSellGainsByMonth = () => {
    return _(tradeList)
      .filter((trade) => trade.kind === TradeKind.SELL)
      .groupBy((trade) => Number(moment(trade.tradeDate).format('MM')))
      .reduce(
        (acc, trade, monthStr) => {
          acc[Number(monthStr)] = _(trade).sumBy('sellGains');
          return acc;
        },
        {} as Record<number, number>,
      );
  };

  useEffect(() => {
    (async () => {
      const searchModel: ReqSearchModel = {
        from: new Date(year, 0, 1),
        to: new Date(year, 11, 31),
        checkType: new Set<AccountType>([AccountType.BUY, AccountType.SELL]),
        currency,
      };
      setTradeList(await IpcCaller.getTradeList(searchModel));
    })();
  }, [currency, year]);

  return (
    <Container fluid className="ledger-table">
      <Row>
        <Col>
          <YearSelect onChange={(year) => handleYearChange(year)} />
          <span style={{ marginLeft: '15px' }} />
          <CurrencySelect onChange={(currency) => handleCurrencyChange(currency)} />
        </Col>
        <Col>
          <Button onClick={() => handleDownloadClick()} variant="primary" style={{ float: 'right' }}>
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
              <tr className="info">
                <td>매수</td>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                  const amountByMonthly = tradeAmountByMonth(AccountType.BUY);
                  return (
                    <td key={`buy_${month}`} className="right">
                      <button type="button" className="link-button" onClick={() => openList(AccountType.BUY, year, month)}>
                        {convertToCommaSymbol(amountByMonthly[month] || 0, currency)}
                      </button>
                    </td>
                  );
                })}
              </tr>
              <tr className="info">
                <td>매도</td>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                  const amountByMonthly = tradeAmountByMonth(AccountType.SELL);
                  return (
                    <td key={`sell_${month}`} className="right">
                      <button type="button" className="link-button" onClick={() => openList(AccountType.SELL, year, month)}>
                        {convertToCommaSymbol(amountByMonthly[month] || 0, currency)}
                      </button>
                    </td>
                  );
                })}
              </tr>
              <tr className="info">
                <td>거래세</td>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                  const taxByMonthly = tradeTaxByMonth();
                  return (
                    <td key={`tax_${month}`} className="right">
                      {convertToCommaSymbol(taxByMonthly[month] || 0, currency)}
                    </td>
                  );
                })}
              </tr>
              <tr className="info">
                <td>수수료</td>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                  const feeByMonthly = tradeFeeByMonth();
                  return (
                    <td key={`fee_${month}`} className="right">
                      {convertToCommaSymbol(feeByMonthly[month] || 0, currency)}
                    </td>
                  );
                })}
              </tr>
              <tr className="success">
                <td>매도차익</td>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                  const sellGainsByMonthly = tradeSellGainsByMonth();
                  return (
                    <td key={`gain_${month}`} className="right">
                      {convertToCommaSymbol(sellGainsByMonthly[month] || 0, currency)}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
      <FinancialTradeListModal ref={financialTradeListModalRef} />
    </Container>
  );
}

export default FinancialTrade;
