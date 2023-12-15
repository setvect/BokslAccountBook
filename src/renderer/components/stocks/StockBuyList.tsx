import React, { CSSProperties, useRef } from 'react';
import { Cell, Column, useSortBy, useTable } from 'react-table';
import { Button, ButtonGroup, Col, Container, Row } from 'react-bootstrap';
import { CurrencyProperties, ResStockBuyModel } from '../../common/BokslTypes';
import { convertToComma, convertToCommaDecimal, handleDeleteStockClick, downloadForTable, renderSortIndicator } from '../util/util';
import { getCodeValue } from '../../mapper/CodeMapper';
import { getStock } from '../../mapper/StockMapper';
import { getAccountName } from '../../mapper/AccountMapper';
import StockBuyModal, { StockBuyModalHandle } from './StockBuyModal';

function StockBuyList() {
  const StockBuyModalRef = useRef<StockBuyModalHandle>(null);

  const handleAddStockBuyClick = () => {
    if (!StockBuyModalRef.current) {
      return;
    }
    StockBuyModalRef.current.openStockBuyModal(0, () => {
      console.log('save');
    });
  };
  const editStockBuy = (stockBuySeq: number) => {
    if (!StockBuyModalRef.current) {
      return;
    }
    StockBuyModalRef.current.openStockBuyModal(stockBuySeq, () => {
      console.log('edit');
    });
  };

  const deleteStockBuy = (stockSeq: number) => {
    console.log(`${stockSeq}삭제`);
  };

  function renderActionButtons(record: ResStockBuyModel) {
    return (
      <ButtonGroup size="sm">
        <Button onClick={() => editStockBuy(record.stockBuySeq)} className="small-text-button" variant="secondary">
          수정
        </Button>
        <Button onClick={() => handleDeleteStockClick(() => deleteStockBuy(record.stockBuySeq))} className="small-text-button" variant="light">
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

  function printCurrency(row: ResStockBuyModel) {
    const stock = getStock(row.stockSeq);
    return (
      <div>
        {CurrencyProperties[stock.currency].symbol} {convertToCommaDecimal(row.buyAmount)}
      </div>
    );
  }

  function getConvertToCommaDecimal(row: ResStockBuyModel) {
    const stock = getStock(row.stockSeq);
    const { symbol } = CurrencyProperties[stock.currency];
    return `${symbol} ${convertToCommaDecimal(row.buyAmount / row.quantity)}`;
  }

  const columns: Column<ResStockBuyModel>[] = React.useMemo(
    () => [
      { Header: '종목명', accessor: 'stockSeq', Cell: ({ value }) => getStock(value).name },
      { Header: '계좌정보', accessor: 'accountSeq', Cell: ({ value }) => getAccountName(value) },
      { Header: '매수금액', accessor: 'buyAmount', Cell: ({ row }) => printCurrency(row.original) },
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
        buyAmount: 100_000,
        quantity: 10,
      },
      {
        stockBuySeq: 2,
        stockSeq: 2,
        accountSeq: 2,
        buyAmount: 2_000.59,
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
  const handleDownloadClick = () => {
    downloadForTable(tableRef, `주식 매수 내역.xls`);
  };

  return (
    <Container fluid className="ledger-table">
      <Row className="align-items-center">
        <Col sm={12} style={{ textAlign: 'right' }}>
          <Button onClick={() => handleAddStockBuyClick()} variant="success" className="me-2">
            주식 매수 등록
          </Button>
          <Button onClick={() => handleDownloadClick()} variant="primary" className="me-2">
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
      <StockBuyModal ref={StockBuyModalRef} />
    </Container>
  );
}

export default StockBuyList;
