import { Button, Col, Container, Row, Table } from 'react-bootstrap';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import moment from 'moment';
import YearSelect from '../common/YearSelect';
import FinancialTransactionListModal, { FinancialTransactionListModalHandle } from './FinancialTransactionListModal';
import { convertToCommaSymbol, downloadForTable } from '../util/util';
import { Currency, TransactionKind } from '../../../common/CommonType';
import CurrencySelect from './CurrencySelect';
import IpcCaller from '../../common/IpcCaller';
import CategoryMapper from '../../mapper/CategoryMapper';
import { ResTransactionSummary } from '../../../common/ResModel';

type MonthlySum = { totalAmount: number; month: number };
type MonthlySumState = {
  [K in TransactionKind]?: MonthlySum[];
};

function FinancialTransaction() {
  const financialTransactionListModalRef = useRef<FinancialTransactionListModalHandle>(null);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [currency, setCurrency] = useState<Currency>(Currency.KRW);
  const [spendingSummary, setSpendingSummary] = useState<ResTransactionSummary[]>([]);
  const [incomeSummary, setIncomeSummary] = useState<ResTransactionSummary[]>([]);
  const [transferSummary, setTransferSummary] = useState<ResTransactionSummary[]>([]);
  const [monthlySum, setMonthlySum] = useState<MonthlySumState>({});

  const handleYearChange = (year: number) => {
    if (year === 0) {
      return;
    }
    setYear(year);
  };

  const handleCurrencyChange = (currency: Currency) => {
    setCurrency(currency);
  };

  const openList = (type: TransactionKind, year: number, month: number) => {
    financialTransactionListModalRef.current?.openModal(type, year, month, currency);
  };

  const tableRef = useRef<HTMLTableElement>(null);
  const handleDownloadClick = () => {
    downloadForTable(tableRef, `지출,수입,이체_결산내역_${year}.xls`);
  };

  const loadTransactionMonthlyFinancialSummary = useCallback(async () => {
    const from = new Date(year, 0, 1);
    const to = new Date(year, 11, 31);
    setSpendingSummary(
      await IpcCaller.getTransactionMonthlyFinancialSummary({
        from,
        to,
        kind: TransactionKind.SPENDING,
        currency,
      }),
    );
    setIncomeSummary(
      await IpcCaller.getTransactionMonthlyFinancialSummary({
        from,
        to,
        kind: TransactionKind.INCOME,
        currency,
      }),
    );
    setTransferSummary(
      await IpcCaller.getTransactionMonthlyFinancialSummary({
        from,
        to,
        kind: TransactionKind.TRANSFER,
        currency,
      }),
    );
  }, [year, currency]);

  useEffect(() => {
    (async () => {
      await loadTransactionMonthlyFinancialSummary();
    })();
  }, [loadTransactionMonthlyFinancialSummary]);

  const getMonthlySum = (summary: ResTransactionSummary[]): MonthlySum[] =>
    _(summary)
      .groupBy((item) => Number(moment(item.transactionDate).format('MM')))
      .map((items, monthStr) => ({
        month: Number(monthStr),
        totalAmount: _.sumBy(items, 'amount'),
      }))
      .value();

  useEffect(() => {
    const updatedMonthlySum: { [kind in TransactionKind]?: MonthlySum[] } = {
      [TransactionKind.SPENDING]: getMonthlySum(spendingSummary),
      [TransactionKind.INCOME]: getMonthlySum(incomeSummary),
      [TransactionKind.TRANSFER]: getMonthlySum(transferSummary),
    };

    setMonthlySum((prevMonthlySum) => ({ ...prevMonthlySum, ...updatedMonthlySum }));
  }, [incomeSummary, spendingSummary, transferSummary]);

  function getSpendingCategoryMonthAmount(parentSeq: number, month: number) {
    return convertToCommaSymbol(
      spendingSummary.find((item) => item.parentSeq === parentSeq && item.transactionDate.getMonth() + 1 === month)?.amount || 0,
      currency,
    );
  }

  function getMonthAmount(kind: TransactionKind, month: number) {
    return monthlySum[kind]?.find((item) => item.month === month)?.totalAmount || 0;
  }

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
              {_.uniqBy(spendingSummary, 'parentSeq')
                .map((item) => item.parentSeq)
                .map((parentSeq) => (
                  <tr key={`item_${parentSeq}`}>
                    <td>{CategoryMapper.getName(parentSeq)}</td>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <td key={`item1_${month}`} className="right">
                        {getSpendingCategoryMonthAmount(parentSeq, month)}
                      </td>
                    ))}
                  </tr>
                ))}
              <tr className="info">
                <td>지출합계</td>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <td key={`spending_${month}`} className="right">
                    <button type="button" className="link-button" onClick={() => openList(TransactionKind.SPENDING, year, month)}>
                      {convertToCommaSymbol(getMonthAmount(TransactionKind.SPENDING, month), currency)}
                    </button>
                  </td>
                ))}
              </tr>
              <tr className="info">
                <td>수입합계</td>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <td key={`income_${month}`} className="right">
                    <button type="button" className="link-button" onClick={() => openList(TransactionKind.INCOME, year, month)}>
                      {convertToCommaSymbol(getMonthAmount(TransactionKind.INCOME, month), currency)}
                    </button>
                  </td>
                ))}
              </tr>
              <tr className="info">
                <td>이체합계</td>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <td key={`transfer_${month}`} className="right">
                    <button type="button" className="link-button" onClick={() => openList(TransactionKind.TRANSFER, year, month)}>
                      {convertToCommaSymbol(getMonthAmount(TransactionKind.TRANSFER, month), currency)}
                    </button>
                  </td>
                ))}
              </tr>
              <tr className="success">
                <td>수입-지출</td>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <td key={`sum_${month}`} className="right">
                    {convertToCommaSymbol(getMonthAmount(TransactionKind.INCOME, month) - getMonthAmount(TransactionKind.SPENDING, month), currency)}
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
