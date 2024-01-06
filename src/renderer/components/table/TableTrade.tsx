import { Button, ButtonGroup, Col, Container, Row, Table } from 'react-bootstrap';
import { Cell, CellProps, Column, useSortBy, useTable } from 'react-table';
import React, { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import moment from 'moment/moment';
import { AccountType, TradeKindProperties } from '../../common/RendererModel';
import TradeModal, { TradeModalHandle } from '../common/TradeModal';
import Search from './Search';
import { convertToComma, convertToCommaSymbol, convertToPercentage, downloadForTable, renderSortIndicator, showDeleteDialog } from '../util/util';
import AccountMapper from '../../mapper/AccountMapper';
import { ResSearchModel, ResTradeModel } from '../../../common/ResModel';
import { IPC_CHANNEL, TradeKind } from '../../../common/CommonType';
import StockMapper from '../../mapper/StockMapper';
import TradeSummary from './TradeSummary';
import StockBuyMapper from '../../mapper/StockBuyMapper';
import IpcCaller from '../../common/IpcCaller';

const CHECK_TYPES = [AccountType.BUY, AccountType.SELL];

function TableTrade() {
  const [tradeList, setTradeList] = useState<ResTradeModel[]>([]);
  const now = new Date();
  const tradeModalRef = useRef<TradeModalHandle>(null);

  const [searchModel, setSearchModel] = useState<ResSearchModel>({
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    checkType: new Set(CHECK_TYPES),
  });

  const handleTradeAddClick = (kind: TradeKind) => {
    tradeModalRef.current?.openTradeModal(kind, 0, new Date());
  };

  const handleTradeEditClick = (kind: TradeKind, tradeSeq: number) => {
    tradeModalRef.current?.openTradeModal(kind, tradeSeq, null);
  };

  const handleTradeDeleteClick = (tradeSeq: number) => {
    showDeleteDialog(async () => {
      await IpcCaller.deleteTrade(tradeSeq);
      await StockBuyMapper.loadList();
      await AccountMapper.loadList();
      await reloadTrade();
      return true;
    });
  };

  const renderActionButtons = ({ row }: CellProps<ResTradeModel>) => {
    return (
      <ButtonGroup size="sm">
        <Button onClick={() => handleTradeEditClick(row.original.kind, row.original.tradeSeq)} className="small-text-button" variant="secondary">
          수정
        </Button>
        <Button onClick={() => handleTradeDeleteClick(row.original.tradeSeq)} className="small-text-button" variant="light">
          삭제
        </Button>
      </ButtonGroup>
    );
  };
  const renderType = ({ row }: CellProps<ResTradeModel>) => {
    const kindProperty = TradeKindProperties[row.original.kind];
    return <span className={kindProperty.color}>{kindProperty.label}</span>;
  };

  function renderReturnRate(resTradeModel: ResTradeModel) {
    if (resTradeModel.kind === TradeKind.BUY) {
      return '';
    }

    const sellAmount = resTradeModel.quantity * resTradeModel.price;
    const rate = resTradeModel.sellGains / (sellAmount - resTradeModel.sellGains);

    if (resTradeModel.sellGains > 0) {
      return <span className="account-buy">{convertToPercentage(rate)}</span>;
    }
    return <span className="account-sell">{convertToPercentage(rate)}</span>;
  }

  const data = React.useMemo<ResTradeModel[]>(() => tradeList, [tradeList]);

  const columns: Column<ResTradeModel>[] = React.useMemo(
    () => [
      { Header: 'No', id: 'no', accessor: (row, index) => index + 1 },
      { Header: '유형', id: 'kind', Cell: renderType },
      { Header: '내용', accessor: 'note' },
      { Header: '종목', id: 'item', Cell: ({ row }) => StockMapper.getStock(row.original.stockSeq).name },
      { Header: '수량', accessor: 'quantity', Cell: ({ value }) => convertToComma(value) },
      {
        Header: '단가',
        accessor: 'price',
        Cell: ({ row }) => convertToCommaSymbol(row.original.price, StockMapper.getStock(row.original.stockSeq).currency),
      },
      {
        Header: '합산금액',
        id: 'total',
        Cell: ({ row }) => convertToCommaSymbol(row.original.quantity * row.original.price, StockMapper.getStock(row.original.stockSeq).currency),
      },
      {
        Header: '매도차익',
        id: 'sellGains',
        Cell: ({ row }) =>
          row.original.kind === TradeKind.SELL
            ? convertToCommaSymbol(row.original.sellGains, StockMapper.getStock(row.original.stockSeq).currency)
            : '',
      },
      {
        Header: '손익률(%)',
        id: 'returnRate',
        Cell: ({ row }) => renderReturnRate(row.original),
      },
      { Header: '거래세', accessor: 'tax', Cell: ({ value }) => convertToComma(value) },
      { Header: '수수료', accessor: 'fee', Cell: ({ value }) => convertToComma(value) },
      { Header: '계좌', accessor: 'accountSeq', Cell: ({ value }) => AccountMapper.getName(value) },
      { Header: '날짜', accessor: 'tradeDate', Cell: ({ value }) => moment(value).format('YYYY-MM-DD') },
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

    if (['no', 'kind', 'actions'].includes(cell.column.id)) {
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
    setSearchModel(searchModel);
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
    downloadForTable(tableRef, `주식거래_내역_${moment(searchModel.from).format('YYYY.MM.DD')}_${moment(searchModel.to).format('YYYY.MM.DD')}.xls`);
  };

  const reloadTrade = async () => {
    await callListTrade();
  };

  const callListTrade = useCallback(async () => {
    setTradeList(await IpcCaller.getTradeList(searchModel));
  }, [searchModel]);

  useEffect(() => {
    (async () => {
      await callListTrade();
    })();
  }, [callListTrade]);

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
              <Search onSearch={handleSearch} accountTypeList={CHECK_TYPES} />
            </Col>
          </Row>
          <Row style={{ marginTop: '10px' }}>
            <Col sm={12}>
              <h5>
                {moment(searchModel.from).format('YYYY-MM-DD')} ~ {moment(searchModel.to).format('YYYY-MM-DD')} 내역
              </h5>
              <Table striped bordered hover variant="dark" className="table-th-center table-font-size">
                <TradeSummary tradeList={tradeList} />
              </Table>
            </Col>
          </Row>
        </Col>
      </Row>
      <TradeModal ref={tradeModalRef} onSubmit={() => reloadTrade()} />
    </Container>
  );
}

export default TableTrade;
