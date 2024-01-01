import { Button, ButtonGroup, Col, Container, Row, Table } from 'react-bootstrap';
import { Cell, CellProps, Column, useSortBy, useTable } from 'react-table';
import React, { CSSProperties, useRef, useState } from 'react';
import moment from 'moment/moment';
import { AccountType, TradeKindProperties } from '../../common/RendererModel';
import TradeModal, { TradeModalHandle } from '../common/TradeModal';
import Search from './Search';
import { convertToComma, convertToPercentage, downloadForTable, renderSortIndicator, showDeleteDialog } from '../util/util';
import AccountMapper from '../../mapper/AccountMapper';
import { ResSearchModel, ResTradeModel } from '../../../common/ResModel';
import { TradeKind } from '../../../common/CommonType';
import StockMapper from '../../mapper/StockMapper';

function TableTrade() {
  const now = new Date();
  const tradeModalRef = useRef<TradeModalHandle>(null);

  const [range, setRange] = useState({
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
  });

  const handleTradeAddClick = (kind: TradeKind) => {
    tradeModalRef.current?.openTradeModal(kind, 0, new Date(), () => {
      console.log('저장 완료 reload');
    });
  };

  const data = React.useMemo<ResTradeModel[]>(
    () => [
      {
        tradeSeq: 1,
        type: TradeKind.BUY,
        note: '물타기',
        stockSeq: 1,
        quantity: 2,
        price: 10000,
        total: 20000,
        sellGains: null,
        returnRate: null,
        tax: 0,
        fee: 0,
        accountSeq: 3,
        date: moment('2021-02-21').toDate(),
      },
      {
        tradeSeq: 2,
        type: TradeKind.SELL,
        note: '손절 ㅜㅜ',
        stockSeq: 1,
        quantity: 2,
        price: 13000,
        total: 26000,
        sellGains: 6000,
        returnRate: 0.3254,
        tax: 0,
        fee: 0,
        accountSeq: 4,
        date: moment('2021-03-27').toDate(),
      },
    ],
    [],
  );
  const handleTradeDeleteClick = (tradeSeq: number) => {
    showDeleteDialog(() => {
      console.log(`${tradeSeq}삭제`);
    });
  };

  const handleTradeEditClick = (kind: TradeKind, tradeSeq: number) => {
    tradeModalRef.current?.openTradeModal(kind, tradeSeq, null, () => {
      console.log('저장 완료 reload');
    });
  };

  const renderActionButtons = ({ row }: CellProps<ResTradeModel>) => {
    return (
      <ButtonGroup size="sm">
        <Button onClick={() => handleTradeEditClick(TradeKind.BUY, 1)} className="small-text-button" variant="secondary">
          수정 {row.original.tradeSeq}
        </Button>
        <Button onClick={() => handleTradeDeleteClick(1)} className="small-text-button" variant="light">
          삭제
        </Button>
      </ButtonGroup>
    );
  };
  const renderType = ({ row }: CellProps<ResTradeModel>) => {
    const kindProperty = TradeKindProperties[row.original.type];
    return <span className={kindProperty.color}>{kindProperty.label}</span>;
  };

  function renderReturnRate(resTradeModel: ResTradeModel) {
    if (resTradeModel.sellGains == null) {
      return '';
    }

    const buyPrice = resTradeModel.quantity * resTradeModel.price - resTradeModel.sellGains;
    const sellPrice = resTradeModel.quantity * resTradeModel.price;
    const rate = (sellPrice - buyPrice) / buyPrice;

    if (resTradeModel.sellGains > 0) {
      return <span className="account-buy">{convertToPercentage(rate)}</span>;
    }
    return <span className="account-sell">{convertToPercentage(rate)}</span>;
  }

  const columns: Column<ResTradeModel>[] = React.useMemo(
    () => [
      { Header: 'No', id: 'no', accessor: (row, index) => index + 1 },
      { Header: '유형', id: 'type', Cell: renderType },
      { Header: '내용', accessor: 'note' },
      { Header: '종목', id: 'item', Cell: ({ row }) => StockMapper.getStock(row.original.stockSeq).name },
      { Header: '수량', accessor: 'quantity', Cell: ({ value }) => convertToComma(value) },
      { Header: '단가', accessor: 'price', Cell: ({ value }) => convertToComma(value) },
      { Header: '합산금액', id: 'total', Cell: ({ row }) => convertToComma(row.original.quantity * row.original.price) },
      { Header: '매도차익', accessor: 'sellGains', Cell: ({ value }) => convertToComma(value) },
      {
        Header: '손익률(%)',
        id: 'returnRate',
        Cell: ({ row }) => renderReturnRate(row.original),
      },
      { Header: '거래세', accessor: 'tax', Cell: ({ value }) => convertToComma(value) },
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

  const renderCell = (cell: Cell<ResTradeModel>) => {
    const customStyles: CSSProperties = {};
    if (['quantity', 'price', 'total', 'tax', 'fee', 'sellGains', 'returnRate'].includes(cell.column.id)) {
      customStyles.textAlign = 'right';
    }

    if (['no', 'type', 'actions'].includes(cell.column.id)) {
      customStyles.textAlign = 'center';
    }
    let className = '';
    if (['sellGains', 'returnRate'].includes(cell.column.id)) {
      if (cell.row.original.sellGains == null) {
        className = '';
      } else if (cell.row.original.sellGains > 0) {
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

  const handleSearch = (searchModel: ResSearchModel) => {
    setRange({ from: searchModel.from, to: searchModel.to });
  };

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<ResTradeModel>(
    {
      columns,
      data,
    },
    useSortBy,
  );

  const tableRef = useRef<HTMLTableElement>(null);
  const handleDownloadClick = () => {
    downloadForTable(tableRef, `주식거래_내역_${moment(range.from).format('YYYY.MM.DD')}_${moment(range.to).format('YYYY.MM.DD')}.xls`);
  };

  return (
    <Container fluid className="ledger-table">
      <Row>
        <Col sm={9}>
          <Row>
            <Col sm={12} style={{ textAlign: 'right' }}>
              <Button onClick={() => handleTradeAddClick(TradeKind.BUY)} variant="success" className="me-2">
                매수
              </Button>
              <Button onClick={() => handleTradeAddClick(TradeKind.SELL)} variant="success" className="me-2">
                매도
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
              <Search onSearch={handleSearch} accountTypeList={[AccountType.BUY, AccountType.SELL]} />
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
