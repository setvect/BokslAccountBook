import { Button, ButtonGroup, Col, Container, Row, Table } from 'react-bootstrap';
import { Cell, CellProps, Column, useSortBy, useTable } from 'react-table';
import React, { CSSProperties, useRef, useState } from 'react';
import moment from 'moment/moment';
import Search, { SearchModel } from './Search';
import { convertToComma, convertToCommaDecimal, downloadForTable, renderSortIndicator, showDeleteDialog } from '../util/util';
import ExchangeModal, { ExchangeModalHandle } from '../common/ExchangeModal';
import AccountMapper from '../../mapper/AccountMapper';
import { ResExchangeModel } from '../../../common/ResModel';
import { Currency, ExchangeKind } from '../../../common/CommonType';

function TableExchange() {
  const now = new Date();
  const exchangeModalRef = useRef<ExchangeModalHandle>(null);

  const [range, setRange] = useState({
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
  });

  const handleExchangeAddClick = (kind: ExchangeKind) => {
    exchangeModalRef.current?.openExchangeModal(kind, 0, new Date(), () => {
      console.log('저장 완료 reload');
    });
  };

  const data = React.useMemo<ResExchangeModel[]>(
    () => [
      {
        id: 1,
        type: ExchangeKind.SELL,
        note: '환전 ㅋㅋㅋ',
        sellCurrency: Currency.USD,
        sellPrice: 500.58,
        buyCurrency: Currency.KRW,
        buyPrice: 500000,
        fee: 5,
        accountSeq: 2,
        date: moment('2021-01-01').toDate(),
      },
      {
        id: 2,
        type: ExchangeKind.BUY,
        note: '원화 매수',
        sellCurrency: Currency.KRW,
        sellPrice: 500000,
        buyCurrency: Currency.USD,
        buyPrice: 500.58,
        fee: 5,
        accountSeq: 3,
        date: moment('2021-01-05').toDate(),
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
    exchangeModalRef.current?.openExchangeModal(kind, exchangeSeq, null, () => {
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

  function printExchangeRate(resExchangeModel: ResExchangeModel) {
    if (resExchangeModel.buyCurrency === Currency.KRW) {
      return convertToCommaDecimal(resExchangeModel.buyPrice / resExchangeModel.sellPrice);
    }
    if (resExchangeModel.sellCurrency === Currency.KRW) {
      return convertToCommaDecimal(resExchangeModel.sellPrice / resExchangeModel.buyPrice);
    }

    return '-';
  }

  const columns: Column<ResExchangeModel>[] = React.useMemo(
    () => [
      { Header: 'No', accessor: 'id' },
      { Header: '내용', accessor: 'note' },
      { Header: '매도통화', accessor: 'sellCurrency' },
      { Header: '매도금액', accessor: 'sellPrice', Cell: ({ value }) => convertToCommaDecimal(value) },
      { Header: '매수통화', accessor: 'buyCurrency' },
      { Header: '매수금액', accessor: 'buyPrice', Cell: ({ value }) => convertToCommaDecimal(value) },
      { Header: '환율', id: 'exchangeRate', Cell: ({ row }) => printExchangeRate(row.original) },
      { Header: '수수료', accessor: 'fee', Cell: ({ value }) => convertToComma(value) },
      { Header: '입금계좌', accessor: 'accountSeq', Cell: ({ value }) => AccountMapper.getAccountName(value) },
      { Header: '날짜', accessor: 'date', Cell: ({ value }) => moment(value).format('YYYY-MM-DD') },
      {
        Header: '기능',
        id: 'actions',
        Cell: renderActionButtons,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
