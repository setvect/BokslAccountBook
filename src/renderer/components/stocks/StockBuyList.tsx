import React, { CSSProperties, useRef, useState } from 'react';
import { Cell, Column, useSortBy, useTable } from 'react-table';
import { Button, ButtonGroup, Col, Container, Form, Row } from 'react-bootstrap';
import { Currency, CurrencyProperties, ResStockBuyModel } from '../common/BokslTypes';
import { convertToComma, convertToCommaDecimal, deleteConfirm, downloadForTable, printCurrency, renderSortIndicator } from '../util/util';
import { getCodeValue } from '../common/CodeMapper';
import StockModal, { StockModalHandle } from './StockModal';
import { getStock } from '../common/StockMapper';
import { getAccountName } from '../common/AccountMapper';

function StockBuyList() {
  const [showEnabledOnly, setShowEnabledOnly] = useState(true);

  const stockModalRef = useRef<StockModalHandle>(null);

  const editStock = (stockSeq: number) => {
    if (!stockModalRef.current) {
      return;
    }
    stockModalRef.current.openStockModal(stockSeq, () => {
      console.log('edit');
    });
  };

  const deleteStock = (stockSeq: number) => {
    console.log(`${stockSeq}삭제`);
  };

  function renderActionButtons(record: ResStockBuyModel) {
    return (
      <ButtonGroup size="sm">
        <Button onClick={() => editStock(record.stockBuySeq)} className="small-text-button" variant="secondary">
          수정
        </Button>
        <Button onClick={() => deleteConfirm(() => deleteStock(record.stockBuySeq))} className="small-text-button" variant="light">
          삭제
        </Button>
      </ButtonGroup>
    );
  }

  function printExternalLink(value: string) {
    return (
      <a href={value} target="_blank" rel="noopener noreferrer">
        상세정보
      </a>
    );
  }

  function getConvertToCommaDecimal(row: ResStockBuyModel) {
    const { symbol } = CurrencyProperties[row.purchaseAmount.currency];
    return `${symbol} ${convertToCommaDecimal(row.purchaseAmount.amount / row.quantity)}`;
  }

  const columns: Column<ResStockBuyModel>[] = React.useMemo(
    () => [
      { Header: '종목명', accessor: 'stockSeq', Cell: ({ value }) => getStock(value).name },
      { Header: '계좌정보', accessor: 'accountSeq', Cell: ({ value }) => getAccountName(value) },
      { Header: '매수금액', accessor: 'purchaseAmount', Cell: ({ value }) => printCurrency(value) },
      { Header: '수량', accessor: 'quantity', Cell: ({ value }) => convertToComma(value) },
      {
        Header: '평균매수가',
        id: 'avgPrice',
        Cell: ({ row }) => getConvertToCommaDecimal(row.original),
      },
      {
        Header: '종목유형',
        id: 'stockTypeCode',
        accessor: 'stockSeq',
        Cell: ({ value }) => getCodeValue('KIND_CODE', getStock(value).stockTypeCode),
      },
      {
        Header: '상장국가',
        id: 'nationCode',
        accessor: 'stockSeq',
        Cell: ({ value }) => getCodeValue('TYPE_NATION', getStock(value).nationCode),
      },
      {
        Header: '상세정보',
        id: 'link',
        accessor: 'stockSeq',
        Cell: ({ value }) => printExternalLink(getStock(value).link),
      },
      {
        Header: '기능',
        id: 'actions',
        Cell: ({ row }) => renderActionButtons(row.original),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const data = React.useMemo<ResStockBuyModel[]>(
    () => [
      {
        stockBuySeq: 1,
        stockSeq: 1,
        accountSeq: 1,
        purchaseAmount: { currency: Currency.KRW, amount: 100_000 },
        quantity: 10,
      },
      {
        stockBuySeq: 2,
        stockSeq: 2,
        accountSeq: 2,
        purchaseAmount: { currency: Currency.USD, amount: 2_000.59 },
        quantity: 20,
      },
    ],
    [],
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<ResStockBuyModel>(
    {
      columns,
      data,
    },
    useSortBy,
  );
  const renderCell = (cell: Cell<ResStockBuyModel>) => {
    const customStyles: CSSProperties = {};

    if (['purchaseAmount', 'quantity', 'avgPrice'].includes(cell.column.id)) {
      customStyles.textAlign = 'right';
    }
    if (['actions'].includes(cell.column.id)) {
      customStyles.textAlign = 'center';
    }

    return (
      <td {...cell.getCellProps()} style={customStyles}>
        {cell.render('Cell')}
      </td>
    );
  };

  const tableRef = useRef<HTMLTableElement>(null);
  const downloadList = () => {
    downloadForTable(tableRef, `주식 매수 내역.xls`);
  };

  const handleEnable = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowEnabledOnly(event.target.checked);
  };
  return (
    <Container fluid className="ledger-table">
      <Row className="align-items-center">
        <Col xs="auto" className="ms-auto">
          <Form.Check onChange={handleEnable} checked={showEnabledOnly} type="checkbox" id="account-enable-only" label="활성 계좌만 보기" />
        </Col>
        <Col xs="auto">
          <Button onClick={() => downloadList()} variant="primary" className="me-2">
            내보내기(엑셀)
          </Button>
        </Col>
      </Row>
      <Row style={{ marginTop: '15px' }}>
        <Col>
          <table
            {...getTableProps()}
            className="table-th-center table-font-size table table-dark table-striped table-bordered table-hover"
            style={{ marginTop: '10px' }}
            ref={tableRef}
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
        </Col>
      </Row>
      <StockModal ref={stockModalRef} />
    </Container>
  );
}

export default StockBuyList;
