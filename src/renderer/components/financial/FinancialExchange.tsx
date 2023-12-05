import { Button, Col, Container, Row, Table } from 'react-bootstrap';
import React, { useRef } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import YearSelect from '../common/YearSelect';
import { downloadForTable } from '../util/util';
import { Currency } from '../common/BokslTypes';

function FinancialExchange() {
  let currentYear = new Date().getFullYear();

  function changeYear(year: number) {
    currentYear = year;
  }

  const tableRef = useRef<HTMLTableElement>(null);
  const handleDownload = () => {
    downloadForTable(tableRef, `환전_결산내역_${currentYear}.xls`);
  };

  return (
    <Container fluid className="ledger-table">
      <Row>
        <Col>
          <YearSelect onChange={(year) => changeYear(year)} />
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
              {Object.values(Currency)
                .filter((currency) => currency !== Currency.KRW)
                .map((currency) => (
                  <tr>
                    <td>
                      {Currency.KRW} <FaArrowRight style={{ marginTop: '-2px' }} /> {currency}
                    </td>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <td key={`buy_${month}`} className="right">
                        52.00
                      </td>
                    ))}
                  </tr>
                ))}

              {Object.values(Currency)
                .filter((currency) => currency !== Currency.KRW)
                .map((currency) => (
                  <tr>
                    <td>
                      {currency} <FaArrowRight style={{ marginTop: '-2px' }} /> {Currency.KRW}
                    </td>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <td key={`buy_${month}`} className="right">
                        52.00
                      </td>
                    ))}
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
