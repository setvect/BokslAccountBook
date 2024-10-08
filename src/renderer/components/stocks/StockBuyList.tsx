import React, { CSSProperties, useRef, useState, useMemo } from 'react';
import { Cell, Column, useSortBy, useTable } from 'react-table';
import { Button, ButtonGroup, Col, Container, Row, Form } from 'react-bootstrap';
import { CurrencyProperties } from '../../common/RendererModel';
import { convertToComma, convertToCommaSymbol, downloadForTable, printExternalLink, renderSortIndicator, showDeleteDialog } from '../util/util';
import CodeMapper from '../../mapper/CodeMapper';
import StockMapper from '../../mapper/StockMapper';
import AccountMapper from '../../mapper/AccountMapper';
import StockBuyModal, { StockBuyModalHandle } from './StockBuyModal';
import StockBuyMapper from '../../mapper/StockBuyMapper';
import { ResStockBuyModel } from '../../../common/ResModel';
import { CodeKind } from '../../../common/CommonType';
import IpcCaller from '../../common/IpcCaller';

function StockBuyList() {
  const [stockBuyList, setStockBuyList] = useState<ResStockBuyModel[]>(StockBuyMapper.getList());
  const StockBuyModalRef = useRef<StockBuyModalHandle>(null);
  const [filterName, setFilterName] = useState('');

  const handleAddStockBuyClick = () => {
    if (!StockBuyModalRef.current) {
      return;
    }
    StockBuyModalRef.current.openStockBuyModal(0);
  };
  const editStockBuy = (stockBuySeq: number) => {
    if (!StockBuyModalRef.current) {
      return;
    }
    StockBuyModalRef.current.openStockBuyModal(stockBuySeq);
  };

  const deleteStockBuy = async (stockBuySeq: number) => {
    await IpcCaller.deleteStockBuy(stockBuySeq);
    await StockBuyMapper.loadList();
    setStockBuyList(StockBuyMapper.getList());
    return true;
  };

  const handleDeleteStockBuyClick = (stockBuySeq: number) => {
    showDeleteDialog(() => deleteStockBuy(stockBuySeq));
  };

  const renderActionButtons = (record: ResStockBuyModel) => {
    return (
      <ButtonGroup size="sm">
        <Button onClick={() => editStockBuy(record.stockBuySeq)} className="small-text-button" variant="secondary">
          수정
        </Button>
        <Button onClick={() => handleDeleteStockBuyClick(record.stockBuySeq)} className="small-text-button" variant="light">
          삭제
        </Button>
      </ButtonGroup>
    );
  };

  const printCurrency = (row: ResStockBuyModel) => {
    const stock = StockMapper.getStock(row.stockSeq);
    return convertToCommaSymbol(row.buyAmount, stock.currency);
  };

  const getConvertToCommaDecimal = (row: ResStockBuyModel) => {
    const stock = StockMapper.getStock(row.stockSeq);
    const { symbol } = CurrencyProperties[stock.currency];
    if (row.quantity === 0) {
      return `${symbol} 0`;
    }
    return convertToCommaSymbol(row.buyAmount / row.quantity, stock.currency);
  };

  const columns: Column<ResStockBuyModel>[] = React.useMemo(
    () => [
      { Header: 'No', id: 'no', accessor: (row, index) => index + 1 },
      { Header: '종목명', accessor: 'stockSeq', Cell: ({ value }) => StockMapper.getStock(value).name },
      { Header: '계좌정보', accessor: 'accountSeq', Cell: ({ value }) => AccountMapper.getName(value) },
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
        Cell: ({ value }) => CodeMapper.getValue(CodeKind.STOCK_TYPE, StockMapper.getStock(value).stockTypeCode),
      },
      {
        Header: '상장국가',
        id: 'nationCode',
        accessor: 'stockSeq',
        Cell: ({ value }) => CodeMapper.getValue(CodeKind.NATION_TYPE, StockMapper.getStock(value).nationCode),
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

  const filteredData = useMemo(() => {
    return stockBuyList.filter((stockBuy) => StockMapper.getStock(stockBuy.stockSeq).name.toLowerCase().includes(filterName.toLowerCase()));
  }, [stockBuyList, filterName]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<ResStockBuyModel>(
    {
      columns,
      data: filteredData,
    },
    useSortBy,
  );
  const renderCell = (cell: Cell<ResStockBuyModel>) => {
    const customStyles: CSSProperties = {};

    if (['quantity', 'avgPrice', 'buyAmount'].includes(cell.column.id)) {
      customStyles.textAlign = 'right';
    }
    if (['no', 'actions'].includes(cell.column.id)) {
      customStyles.textAlign = 'center';
    }

    return (
      <td {...cell.getCellProps()} style={customStyles}>
        {cell.render('Cell')}
      </td>
    );
  };

  const reloadStockBuy = async () => {
    await StockBuyMapper.loadList();
    setStockBuyList(StockBuyMapper.getList());
  };

  const tableRef = useRef<HTMLTableElement>(null);
  const handleDownloadClick = () => {
    downloadForTable(tableRef, `주식 매수 내역.xls`);
  };

  const handleNameFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(event.target.value);
  };

  return (
    <Container fluid className="ledger-table">
      <Row className="align-items-center">
        <Col xs="auto">
          <Form.Control type="text" placeholder="종목명으로 검색" value={filterName} onChange={handleNameFilterChange} />
        </Col>
        <Col xs="auto" className="ms-auto">
          &nbsp;
        </Col>
        <Col xs="auto" style={{ textAlign: 'right' }}>
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
      <StockBuyModal ref={StockBuyModalRef} onSubmit={() => reloadStockBuy()} />
    </Container>
  );
}

export default StockBuyList;
