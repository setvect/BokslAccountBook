import React, { CSSProperties, useRef } from 'react';
import { Cell, Column, useSortBy, useTable } from 'react-table';
import { Button, ButtonGroup, Col, Container, Row } from 'react-bootstrap';
import { CurrencyProperties, ResStockBuyModel } from '../../common/RendererTypes';
import { convertToComma, convertToCommaDecimal, downloadForTable, printExternalLink, renderSortIndicator, showDeleteDialog } from '../util/util';
import CodeMapper, { CodeKind } from '../../mapper/CodeMapper';
import StockMapper from '../../mapper/StockMapper';
import AccountMapper from '../../mapper/AccountMapper';
import StockBuyModal, { StockBuyModalHandle } from './StockBuyModal';
import StockBuyMapper from '../../mapper/StockBuyMapper';

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

  const renderActionButtons = (record: ResStockBuyModel) => {
    return (
      <ButtonGroup size="sm">
        <Button onClick={() => editStockBuy(record.stockBuySeq)} className="small-text-button" variant="secondary">
          수정
        </Button>
        <Button onClick={() => showDeleteDialog(() => deleteStockBuy(record.stockBuySeq))} className="small-text-button" variant="light">
          삭제
        </Button>
      </ButtonGroup>
    );
  };

  const printCurrency = (row: ResStockBuyModel) => {
    const stock = StockMapper.getStock(row.stockSeq);
    return (
      <div>
        {CurrencyProperties[stock.currency].symbol} {convertToCommaDecimal(row.buyAmount)}
      </div>
    );
  };

  const getConvertToCommaDecimal = (row: ResStockBuyModel) => {
    const stock = StockMapper.getStock(row.stockSeq);
    const { symbol } = CurrencyProperties[stock.currency];
    return `${symbol} ${convertToCommaDecimal(row.buyAmount / row.quantity)}`;
  };

  const columns: Column<ResStockBuyModel>[] = React.useMemo(
    () => [
      { Header: '종목명', accessor: 'stockSeq', Cell: ({ value }) => StockMapper.getStock(value).name },
      { Header: '계좌정보', accessor: 'accountSeq', Cell: ({ value }) => AccountMapper.getAccountName(value) },
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
        Cell: ({ value }) => CodeMapper.getCodeValue(CodeKind.TYPE_STOCK, StockMapper.getStock(value).stockTypeCode),
      },
      {
        Header: '상장국가',
        id: 'nationCode',
        accessor: 'stockSeq',
        Cell: ({ value }) => CodeMapper.getCodeValue(CodeKind.TYPE_NATION, StockMapper.getStock(value).nationCode),
      },
      {
        Header: '상세정보',
        id: 'link',
        accessor: 'stockSeq',
        Cell: ({ value }) => printExternalLink('상세정보', StockMapper.getStock(value).link),
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
  const data = React.useMemo<ResStockBuyModel[]>(() => StockBuyMapper.getStockBuyList(), []);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<ResStockBuyModel>(
    {
      columns,
      data,
    },
    useSortBy,
  );
  const renderCell = (cell: Cell<ResStockBuyModel>) => {
    const customStyles: CSSProperties = {};

    if (['purchaseAmount', 'quantity', 'avgPrice', 'buyAmount'].includes(cell.column.id)) {
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
