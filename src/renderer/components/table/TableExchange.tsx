import { Button, ButtonGroup, Col, Container, Row, Table } from 'react-bootstrap';
import { Cell, CellProps, Column, useSortBy, useTable } from 'react-table';
import React, { CSSProperties, useRef, useState } from 'react';
import moment from 'moment/moment';
import { Currency, ExchangeKind, ResExchangeModel } from '../../common/BokslTypes';
import Search, { SearchModel } from './Search';
import { convertToComma, convertToCommaDecimal, showDeleteDialog, downloadForTable, renderSortIndicator } from '../util/util';
import ExchangeModal, { ExchangeModalHandle } from '../common/ExchangeModal';

function TableExchange() {
  const now = new Date();
  const exchangeModalRef = useRef<ExchangeModalHandle>(null);

  const [range, setRange] = useState({
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
  });

  const handleExchangeAddClick = (kind: ExchangeKind) => {
    exchangeModalRef.current?.openExchangeModal(kind, 0, () => {
      console.log('저장 완료 reload');
    });
  };

  const data = React.useMemo<ResExchangeModel[]>(
    () => [
      {
        id: 1,
        type: ExchangeKind.SELL,
        memo: '환전 ㅋㅋㅋ',
        currencyToSell: Currency.USD,
        currencyToSellPrice: 500.58,
        currencyToBuy: Currency.KRW,
        currencyToBuyPrice: 500000,
        exchangeRate: 998.84565,
        fee: 5,
        account: '복슬증권',
        date: '2021-01-01',
      },
      {
        id: 2,
        type: ExchangeKind.BUY,
        memo: '원화 매수',
        currencyToSell: Currency.KRW,
        currencyToSellPrice: 500000,
        currencyToBuy: Currency.USD,
        currencyToBuyPrice: 500.58,
        exchangeRate: 998.84565,
        fee: 5,
        account: '복슬증권',
        date: '2021-01-01',
      },
    ],
    [],
  );

  const handleExchangeDeleteClick = (exchangeSeq: number) => {
    showDeleteDialog(() => {
      console.log(`${exchangeSeq}삭제`);
    });
  };

  const handleExchangeEditClick = (kind: ExchangeKind, exchangeSeq: number) => {
    exchangeModalRef.current?.openExchangeModal(kind, exchangeSeq, () => {
      console.log('저장 완료 reload');
    });
  };

  const renderActionButtons = ({ row }: CellProps<ResExchangeModel>) => {
    return (
      <ButtonGroup size="sm">
        <Button onClick={() => handleExchangeEditClick(ExchangeKind.BUY, 1)} className="small-text-button" variant="secondary">
          수정 {row.original.id}
        </Button>
        <Button onClick={() => handleExchangeDeleteClick(1)} className="small-text-button" variant="light">
          삭제
        </Button>
      </ButtonGroup>
    );
  };

  const columns: Column<ResExchangeModel>[] = React.useMemo(
    () => [
      { Header: 'No', accessor: 'id' },
      { Header: '내용', accessor: 'memo' },
      { Header: '매도통화', accessor: 'currencyToSell' },
      { Header: '매도금액', accessor: 'currencyToSellPrice', Cell: ({ value }) => convertToCommaDecimal(value) },
      { Header: '매수통화', accessor: 'currencyToBuy' },
      { Header: '매수금액', accessor: 'currencyToBuyPrice', Cell: ({ value }) => convertToCommaDecimal(value) },
      { Header: '환율', accessor: 'exchangeRate', Cell: ({ value }) => convertToCommaDecimal(value) },
      { Header: '수수료', accessor: 'fee', Cell: ({ value }) => convertToComma(value) },
      { Header: '거래계좌', accessor: 'account' },
      { Header: '날짜', accessor: 'date' },
      {
        Header: '기능',
        id: 'actions',
        Cell: renderActionButtons,
      },
    ],
    [],
  );
  const renderCell = (cell: Cell<ResExchangeModel>) => {
    const customStyles: CSSProperties = {};
    if (['currencyToSellPrice', 'currencyToBuyPrice', 'exchangeRate', 'fee'].includes(cell.column.id)) {
      customStyles.textAlign = 'right';
    }

    if (['id', 'actions'].includes(cell.column.id)) {
      customStyles.textAlign = 'center';
    }
    return (
      <td {...cell.getCellProps()} style={customStyles}>
        {cell.render('Cell')}
      </td>
    );
  };

  const handleSearch = (searchModel: SearchModel) => {
    setRange({ from: searchModel.from, to: searchModel.to });
  };

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<ResExchangeModel>(
    {
      columns,
      data,
    },
    useSortBy,
  );
  const tableRef = useRef<HTMLTableElement>(null);
  const handleDownloadClick = () => {
    downloadForTable(tableRef, `환전_내역_${moment(range.from).format('YYYY.MM.DD')}_${moment(range.to).format('YYYY.MM.DD')}.xls`);
  };

  return (
    <Container fluid className="ledger-table">
      <Row>
        <Col sm={9}>
          <Row>
            <Col sm={12} style={{ textAlign: 'right' }}>
              <Button onClick={() => handleExchangeAddClick(ExchangeKind.BUY)} variant="success" className="me-2">
                원화 매수
              </Button>
              <Button onClick={() => handleExchangeAddClick(ExchangeKind.SELL)} variant="success" className="me-2">
                원화 매도
              </Button>
              <Button onClick={() => handleDownloadClick()} variant="primary" className="me-2">
                내보내기(엑셀)
              </Button>
            </Col>
            <table
              ref={tableRef}
              {...getTableProps()}
              className="table-th-center table-font-size table table-dark table-striped table-bordered table-hover"
              style={{ marginTop: '10px' }}
            >
              <thead>
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th {...column.getHeaderProps((column as any).getSortByToggleProps())}>
                        {column.render('Header')}
                        <span>{renderSortIndicator(column)}</span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {rows.map((row) => {
                  prepareRow(row);
                  return <tr {...row.getRowProps()}>{row.cells.map((cell) => renderCell(cell))}</tr>;
                })}
              </tbody>
            </table>
          </Row>
        </Col>
        <Col sm={3}>
          <Row>
            <Col sm={12}>
              <Search onSearch={handleSearch} />
            </Col>
          </Row>
          <Row style={{ marginTop: '10px' }}>
            <Col sm={12}>
              <h5>
                {moment(range.from).format('YYYY-MM-DD')} ~ {moment(range.to).format('YYYY-MM-DD')} 내역
              </h5>
              <Table striped bordered hover variant="dark" className="table-th-center table-font-size">
                <tbody>
                  <tr>
                    <td>
                      <span className="account-buy">원화 매수</span>
                    </td>
                    <td className="right">10,000</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="account-sell">원화 매도</span>
                    </td>
                    <td className="right">10,000</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
        </Col>
      </Row>
      <ExchangeModal ref={exchangeModalRef} />
    </Container>
  );
}

export default TableExchange;
