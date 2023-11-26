import { Button, ButtonGroup, Col, Container, Row, Table } from 'react-bootstrap';
import { Cell, CellProps, Column, useSortBy, useTable } from 'react-table';
import React, { CSSProperties, useRef, useState } from 'react';
import moment from 'moment/moment';
import { AccountType, ResTradeDataModel, TradeKind, TradeKindProperties, TradeModalForm } from '../common/BokslTypes';
import TradeModal, { TradeModalHandle } from '../common/TradeModal';
import Search, { SearchModel } from './Search';
import { convertToComma, convertToPercentage } from '../util/util';

function renderActionButtons({ row }: CellProps<ResTradeDataModel>) {
  return (
    <ButtonGroup size="sm">
      <Button className="small-text-button" variant="secondary">
        수정 {row.original.id}
      </Button>
      <Button className="small-text-button" variant="light">
        삭제
      </Button>
    </ButtonGroup>
  );
}

function renderType({ row }: CellProps<ResTradeDataModel>) {
  const kindProperty = TradeKindProperties[row.original.type];
  return <span className={kindProperty.color}>{kindProperty.label}</span>;
}

function TableTrade() {
  const now = new Date();
  const tradeModalRef = useRef<TradeModalHandle>(null);

  const [range, setRange] = useState({
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
  });

  const handleTradeAdd = (kind: TradeKind) => {
    const item: TradeModalForm = {
      tradeDate: range.to,
      accountSeq: 0,
      stockSeq: 0,
      note: '',
      kind: TradeKind.SELL,
      quantity: 0,
      price: 0,
      tax: 0,
      fee: 0,
    };

    tradeModalRef.current?.openTradeModal(kind, item, () => {
      console.log('저장 완료 reload');
    });
  };

  const data = React.useMemo<ResTradeDataModel[]>(
    () => [
      {
        id: 1,
        type: TradeKind.BUY,
        memo: '물타기',
        item: '복슬철강',
        quantity: 2,
        price: 10000,
        total: 20000,
        profitLossAmount: null,
        returnRate: null,
        tax: 0,
        fee: 0,
        account: '복슬증권',
        date: '2021-01-01',
      },
      {
        id: 2,
        type: TradeKind.SELL,
        memo: '손절 ㅜㅜ',
        item: '복슬철강',
        quantity: 2,
        price: 13000,
        total: 26000,
        profitLossAmount: 6000,
        returnRate: 0.3254,
        tax: 0,
        fee: 0,
        account: '복슬증권',
        date: '2021-03-05',
      },
    ],
    [],
  );

  const columns: Column<ResTradeDataModel>[] = React.useMemo(
    () => [
      { Header: 'No', accessor: 'id' },
      { Header: '유형', id: 'type', Cell: renderType },
      { Header: '메모', accessor: 'memo' },
      { Header: '종목', accessor: 'item' },
      { Header: '수량', accessor: 'quantity', Cell: ({ value }) => convertToComma(value) },
      { Header: '단가', accessor: 'price', Cell: ({ value }) => convertToComma(value) },
      { Header: '합산금액', accessor: 'total', Cell: ({ value }) => convertToComma(value) },
      { Header: '매도차익', accessor: 'profitLossAmount', Cell: ({ value }) => convertToComma(value) },
      { Header: '손익률', accessor: 'returnRate', Cell: ({ value }) => convertToPercentage(value) },
      { Header: '거래세', accessor: 'tax', Cell: ({ value }) => convertToComma(value) },
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
  const renderCell = (cell: Cell<ResTradeDataModel>) => {
    const customStyles: CSSProperties = {};
    if (['quantity', 'price', 'total', 'tax', 'fee', 'profitLossAmount', 'returnRate'].includes(cell.column.id)) {
      customStyles.textAlign = 'right';
    }

    if (['id', 'type', 'actions'].includes(cell.column.id)) {
      customStyles.textAlign = 'center';
    }
    let className = '';
    if (['profitLossAmount', 'returnRate'].includes(cell.column.id)) {
      if (cell.row.original.profitLossAmount == null) {
        className = '';
      } else if (cell.row.original.profitLossAmount > 0) {
        className = 'account-buy';
      } else {
        className = 'account-sell';
      }
    }
    return (
      <td {...cell.getCellProps()} style={customStyles} className={className}>
        {cell.render('Cell')}
      </td>
    );
  };

  function renderSortIndicator(column: any) {
    if (!column.isSorted) {
      return null;
    }

    return column.isSortedDesc ? ' 🔽' : ' 🔼';
  }

  const handleSearch = (searchModel: SearchModel) => {
    setRange({ from: searchModel.from, to: searchModel.to });
  };

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<ResTradeDataModel>(
    {
      columns,
      data,
    },
    useSortBy,
  );

  return (
    <Container fluid className="ledger-table">
      <Row>
        <Col sm={9}>
          <Row>
            <Col sm={12} style={{ textAlign: 'right' }}>
              <Button onClick={() => handleTradeAdd(TradeKind.BUY)} variant="success" className="me-2">
                매수
              </Button>
              <Button onClick={() => handleTradeAdd(TradeKind.SELL)} variant="success" className="me-2">
                매도
              </Button>
            </Col>
            <table
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
              <Search onSearch={handleSearch} accountTypeList={[AccountType.BUY, AccountType.SELL, AccountType.EXCHANGE_SELL]} />
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
                      <span className="account-buy">매수</span>
                    </td>
                    <td className="right">10,000</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="account-sell">매도</span>
                    </td>
                    <td className="right">10,000</td>
                  </tr>
                  <tr>
                    <td>매도차익</td>
                    <td className="right">
                      <span className="account-buy">6,000(30.0%)</span>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
        </Col>
      </Row>
      <TradeModal ref={tradeModalRef} />
    </Container>
  );
}

export default TableTrade;
