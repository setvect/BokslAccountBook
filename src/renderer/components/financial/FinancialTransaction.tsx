import { Button, Col, Container, Row, Table } from 'react-bootstrap';
import React, { useRef } from 'react';
import YearSelect from '../common/YearSelect';
import FinancialTransactionListModal, { FinancialTransactionListModalHandle } from './FinancialTransactionListModal';
import { TransactionKind } from '../../common/BokslTypes';
import { downloadForTable } from '../util/util';

function FinancialTransaction() {
  const financialTransactionListModalRef = useRef<FinancialTransactionListModalHandle>(null);

  let currentYear = new Date().getFullYear();
  function handleYearChange(year: number) {
    currentYear = year;
  }

  function openList(type: TransactionKind, year: number, month: number) {
    financialTransactionListModalRef.current?.openModal(type, year, month);
  }

  const tableRef = useRef<HTMLTableElement>(null);
  const handleDownloadClick = () => {
    downloadForTable(tableRef, `지출,수입,이체_결산내역_${currentYear}.xls`);
  };

  return (
    <Container fluid className="ledger-table">
      <Row>
        <Col>
          <YearSelect onChange={(year) => handleYearChange(year)} />
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
                    {currentYear}년 {month}월
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <td key={`item1_${month}`} className="right">
                    1,000
                  </td>
                ))}
              </tr>
              <tr className="info">
                <td>지출합계</td>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <td key={`expense_${month}`} className="right">
                    <button type="button" className="link-button" onClick={() => openList(TransactionKind.EXPENSE, currentYear, month)}>
                      1,000
                    </button>
                  </td>
                ))}
              </tr>
              <tr className="info">
                <td>수입합계</td>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <td key={`income_${month}`} className="right">
                    <button type="button" className="link-button" onClick={() => openList(TransactionKind.INCOME, currentYear, month)}>
                      1,000
                    </button>
                  </td>
                ))}
              </tr>
              <tr className="info">
                <td>이체합계</td>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <td key={`transfer_${month}`} className="right">
                    <button type="button" className="link-button" onClick={() => openList(TransactionKind.TRANSFER, currentYear, month)}>
                      2,000
                    </button>
                  </td>
                ))}
              </tr>
              <tr className="success">
                <td>수입-지출</td>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <td key={`sum_${month}`} className="right">
                    2,000
                  </td>
                ))}
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
      <FinancialTransactionListModal ref={financialTransactionListModalRef} />
    </Container>
  );
}

export default FinancialTransaction;
