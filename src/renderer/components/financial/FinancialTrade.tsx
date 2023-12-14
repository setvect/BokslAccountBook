import { Button, Col, Container, Row, Table } from 'react-bootstrap';
import React, { useRef } from 'react';
import YearSelect from '../common/YearSelect';
import { Currency, TradeKind } from '../../common/BokslTypes';
import { downloadForTable } from '../util/util';
import FinancialTradeListModal, { FinancialTradeListModalHandle } from './FinancialTradeListModal';
import CurrencySelect from './CurrencySelect';

function FinancialTrade() {
  const financialTradeListModalRef = useRef<FinancialTradeListModalHandle>(null);

  let currentYear = new Date().getFullYear();

  function changeYear(year: number) {
    currentYear = year;
  }

  function changeCurrency(currency: Currency) {
    console.log(currency);
  }

  function openList(type: TradeKind, year: number, month: number) {
    financialTradeListModalRef.current?.openModal(type, year, month);
  }
  const tableRef = useRef<HTMLTableElement>(null);
  const handleDownload = () => {
    downloadForTable(tableRef, `주식_결산내역_${currentYear}.xls`);
  };

  return (
    <Container fluid className="ledger-table">
      <Row>
        <Col>
          <YearSelect onChange={(year) => changeYear(year)} />
          <span style={{ marginLeft: '15px' }} />
          <CurrencySelect onChange={(currency) => changeCurrency(currency)} />
        </Col>
        <Col>
          <Button onClick={() => handleDownload()} variant="primary" style={{ float: 'right' }}>
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
                    {currentYear}년 {month}월
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="info">
                <td>매수</td>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <td key={`buy_${month}`} className="right">
                    <button type="button" className="link-button" onClick={() => openList(TradeKind.BUY, currentYear, month)}>
                      1,000
                    </button>
                  </td>
                ))}
              </tr>
              <tr className="info">
                <td>매도</td>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <td key={`sell_${month}`} className="right">
                    <button type="button" className="link-button" onClick={() => openList(TradeKind.SELL, currentYear, month)}>
                      1,000
                    </button>
                  </td>
                ))}
              </tr>
              <tr className="info">
                <td>거래세</td>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <td key={`tax_${month}`} className="right">
                    2,000
                  </td>
                ))}
              </tr>
              <tr className="info">
                <td>수수료</td>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <td key={`fee_${month}`} className="right">
                    2,000
                  </td>
                ))}
              </tr>
              <tr className="success">
                <td>매도차익</td>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <td key={`gain_${month}`} className="right">
                    2,000
                  </td>
                ))}
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
