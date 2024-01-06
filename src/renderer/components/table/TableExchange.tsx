import { Button, ButtonGroup, Col, Container, Row, Table } from 'react-bootstrap';
import { Cell, CellProps, Column, useSortBy, useTable } from 'react-table';
import React, { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import moment from 'moment/moment';
import Search from './Search';
import { convertToCommaDecimal, convertToCommaSymbol, downloadForTable, renderSortIndicator, showDeleteDialog } from '../util/util';
import ExchangeModal, { ExchangeModalHandle } from '../common/ExchangeModal';
import AccountMapper from '../../mapper/AccountMapper';
import { ResExchangeModel, ResSearchModel } from '../../../common/ResModel';
import { Currency, ExchangeKind } from '../../../common/CommonType';
import { AccountType, CurrencyProperties, ExchangeKindProperties } from '../../common/RendererModel';
import ExchangeSummary from './ExchangeSummary';
import IpcCaller from '../../common/IpcCaller';

const CHECK_TYPES = [AccountType.EXCHANGE_BUY, AccountType.EXCHANGE_SELL];

function TableExchange() {
  const now = new Date();
  const [exchangeList, setExchangeList] = useState<ResExchangeModel[]>([]);
  const exchangeModalRef = useRef<ExchangeModalHandle>(null);

  const [searchModel, setSearchModel] = useState<ResSearchModel>({
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    checkType: new Set(CHECK_TYPES),
  });

  const handleExchangeAddClick = (kind: ExchangeKind) => {
    exchangeModalRef.current?.openExchangeModal(kind, 0, new Date());
  };

  const handleExchangeEditClick = (kind: ExchangeKind, exchangeSeq: number) => {
    exchangeModalRef.current?.openExchangeModal(kind, exchangeSeq, null);
  };

  const handleExchangeDeleteClick = async (exchangeSeq: number) => {
    showDeleteDialog(async () => {
      await IpcCaller.deleteExchange(exchangeSeq);
      await reloadExchange();
    });
  };

  const renderActionButtons = ({ row }: CellProps<ResExchangeModel>) => {
    return (
      <ButtonGroup size="sm">
        <Button
          onClick={() => handleExchangeEditClick(ExchangeKind.EXCHANGE_BUY, row.original.exchangeSeq)}
          className="small-text-button"
          variant="secondary"
        >
          수정
        </Button>
        <Button onClick={() => handleExchangeDeleteClick(row.original.exchangeSeq)} className="small-text-button" variant="light">
          삭제
        </Button>
      </ButtonGroup>
    );
  };

  function printExchangeRate(resExchangeModel: ResExchangeModel) {
    if (resExchangeModel.buyCurrency === Currency.KRW) {
      return convertToCommaDecimal(resExchangeModel.buyAmount / resExchangeModel.sellAmount);
    }
    if (resExchangeModel.sellCurrency === Currency.KRW) {
      return convertToCommaDecimal(resExchangeModel.sellAmount / resExchangeModel.buyAmount);
    }
    return '-';
  }

  const renderType = ({ row }: CellProps<ResExchangeModel>) => {
    const kindProperty = ExchangeKindProperties[row.original.kind];
    return <span className={kindProperty.color}>{kindProperty.label}</span>;
  };

  const data = React.useMemo<ResExchangeModel[]>(() => exchangeList, [exchangeList]);

  const columns: Column<ResExchangeModel>[] = React.useMemo(
    () => [
      { Header: 'No', id: 'no', accessor: (row, index) => index + 1 },
      { Header: '유형', id: 'kind', Cell: renderType },
      { Header: '내용', accessor: 'note' },
      { Header: '매도통화', accessor: 'sellCurrency', Cell: ({ value }) => CurrencyProperties[value].name },
      {
        Header: '매도금액',
        id: 'sellAmount',
        Cell: ({ row }) => convertToCommaSymbol(row.original.sellAmount, row.original.sellCurrency),
      },
      { Header: '매수통화', accessor: 'buyCurrency', Cell: ({ value }) => CurrencyProperties[value].name },
      {
        Header: '매수금액',
        id: 'buyAmount',
        Cell: ({ row }) => convertToCommaSymbol(row.original.buyAmount, row.original.buyCurrency),
      },
      { Header: '환율', id: 'exchangeRate', Cell: ({ row }) => printExchangeRate(row.original) },
      { Header: '수수료', accessor: 'fee', Cell: ({ value }) => convertToCommaSymbol(value, Currency.KRW) },
      { Header: '입금계좌', accessor: 'accountSeq', Cell: ({ value }) => AccountMapper.getName(value) },
      { Header: '날짜', accessor: 'exchangeDate', Cell: ({ value }) => moment(value).format('YYYY-MM-DD') },
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
    if (['sellAmount', 'buyAmount', 'exchangeRate', 'fee'].includes(cell.column.id)) {
      customStyles.textAlign = 'right';
    }

    if (['no', 'kind', 'actions'].includes(cell.column.id)) {
      customStyles.textAlign = 'center';
    }
    return (
      <td {...cell.getCellProps()} style={customStyles}>
        {cell.render('Cell')}
      </td>
    );
  };

  const reloadExchange = async () => {
    await callListExchange();
  };

  const handleSearch = (searchModel: ResSearchModel) => {
    setSearchModel(searchModel);
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
    downloadForTable(tableRef, `환전_내역_${moment(searchModel.from).format('YYYY.MM.DD')}_${moment(searchModel.to).format('YYYY.MM.DD')}.xls`);
  };

  const callListExchange = useCallback(async () => {
    setExchangeList(await IpcCaller.getExchangeList(searchModel));
  }, [searchModel]);

  useEffect(() => {
    (async () => {
      await callListExchange();
    })();
  }, [callListExchange]);

  // @ts-ignore
  return (
    <Container fluid className="ledger-table">
      <Row>
        <Col sm={9}>
          <Row>
            <Col sm={12} style={{ textAlign: 'right' }}>
              <Button onClick={() => handleExchangeAddClick(ExchangeKind.EXCHANGE_BUY)} variant="success" className="me-2">
                원화 매수
              </Button>
              <Button onClick={() => handleExchangeAddClick(ExchangeKind.EXCHANGE_SELL)} variant="success" className="me-2">
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
              <Search onSearch={handleSearch} accountTypeList={CHECK_TYPES} />
            </Col>
          </Row>
          <Row style={{ marginTop: '10px' }}>
            <Col sm={12}>
              <h5>
                {moment(searchModel.from).format('YYYY-MM-DD')} ~ {moment(searchModel.to).format('YYYY-MM-DD')} 내역
              </h5>
              <Table striped bordered hover variant="dark" className="table-th-center table-font-size">
                <ExchangeSummary exchangeList={exchangeList} />
              </Table>
            </Col>
          </Row>
        </Col>
      </Row>
      <ExchangeModal ref={exchangeModalRef} onSubmit={() => reloadExchange()} />
    </Container>
  );
}

export default TableExchange;
