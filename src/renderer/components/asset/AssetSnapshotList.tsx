import React, { CSSProperties, useRef } from 'react';
import { Cell, Column, useSortBy, useTable } from 'react-table';
import { Button, ButtonGroup, Col, Container, Row } from 'react-bootstrap';
import { ResAssetSnapshotModel } from '../../common/RendererTypes';
import {
  calcYield,
  convertToComma,
  downloadForTable,
  printColorAmount,
  printColorPercentage,
  renderSortIndicator,
  showDeleteDialog,
} from '../util/util';
import AssetSnapshotModal, { AssetSnapshotModelHandle } from './AssetSnapshotModel';
import AssetSnapshotReadModal, { AssetSnapshotReadModelHandle } from './AssetSnapshotReadModel';

function AssetSnapshotList() {
  const assetSnapshotModalRef = useRef<AssetSnapshotModelHandle>(null);
  const assetSnapshotReadModalRef = useRef<AssetSnapshotReadModelHandle>(null);

  const handleAddStockClick = () => {
    if (!assetSnapshotModalRef.current) {
      return;
    }
    assetSnapshotModalRef.current.openAssetSnapshotModal(0, () => {
      console.log('save');
    });
  };

  const handleEditStockClick = (stockSeq: number) => {
    if (!assetSnapshotModalRef.current) {
      return;
    }
    assetSnapshotModalRef.current.openAssetSnapshotModal(stockSeq, () => {
      console.log('edit');
    });
  };

  const deleteStock = (stockSeq: number) => {
    console.log(`${stockSeq}삭제`);
  };

  const handleDeleteClick = (stockSeq: number) => {
    showDeleteDialog(() => deleteStock(stockSeq));
  };

  const renderActionButtons = (record: ResAssetSnapshotModel) => {
    return (
      <ButtonGroup size="sm">
        <Button onClick={() => handleEditStockClick(record.assetSnapshotSeq)} className="small-text-button" variant="secondary">
          수정
        </Button>
        <Button onClick={() => handleDeleteClick(record.assetSnapshotSeq)} className="small-text-button" variant="light">
          삭제
        </Button>
      </ButtonGroup>
    );
  };

  const printLink = (record: ResAssetSnapshotModel) => {
    return (
      <Button
        variant="link"
        onClick={() => {
          assetSnapshotReadModalRef.current?.openAssetSnapshotReadModal(record.assetSnapshotSeq);
        }}
        className="link-button"
      >
        {record.name}
      </Button>
    );
  };
  const columns: Column<ResAssetSnapshotModel>[] = React.useMemo(
    () => [
      { Header: '설명', accessor: 'name', Cell: ({ row }) => printLink(row.original) },
      { Header: '합산자산(원)', accessor: 'totalAmount', Cell: ({ value }) => convertToComma(value) },
      { Header: '평가자산(원)', accessor: 'evaluateAmount', Cell: ({ value }) => convertToComma(value) },
      {
        Header: '수익금(원)',
        id: 'profit',
        Cell: ({ row }) => printColorAmount(row.original.evaluateAmount - row.original.totalAmount),
      },
      {
        Header: '수익률(%)',
        id: 'profitRate',
        Cell: ({ row }) => printColorPercentage(calcYield(row.original.totalAmount, row.original.evaluateAmount)),
      },
      {
        Header: '주식매도확인일',
        accessor: 'stockSellCheckDate',
        Cell: ({ value }) => value && new Date(value).toLocaleDateString(),
      },
      {
        Header: '매도차익(원)',
        accessor: 'stockSellProfitLossAmount',
        Cell: ({ value }) => convertToComma(value),
      },
      { Header: '등록일', accessor: 'regDate', Cell: ({ value }) => value && new Date(value).toLocaleDateString() },
      {
        Header: '기능',
        id: 'actions',
        Cell: ({ row }) => renderActionButtons(row.original),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const data = React.useMemo<ResAssetSnapshotModel[]>(
    () => [
      {
        assetSnapshotSeq: 1,
        name: '2023년 1월',
        totalAmount: 1000000,
        evaluateAmount: 950000,
        stockSellCheckDate: new Date(2023, 5, 10),
        stockSellProfitLossAmount: 100000,
        regDate: new Date(),
      },
    ],
    [],
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<ResAssetSnapshotModel>(
    {
      columns,
      data,
    },
    useSortBy,
  );
  const renderCell = (cell: Cell<ResAssetSnapshotModel>) => {
    const customStyles: CSSProperties = {};

    if (['evaluateAmount', 'totalAmount', 'profit', 'profitRate', 'stockSellProfitLossAmount'].includes(cell.column.id)) {
      customStyles.textAlign = 'right';
    }
    if (['enableF', 'actions'].includes(cell.column.id)) {
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
    downloadForTable(tableRef, `주식 종목.xls`);
  };

  return (
    <Container fluid className="ledger-table">
      <Row className="align-items-center" style={{ textAlign: 'right' }}>
        <Col>
          <Button onClick={handleAddStockClick} variant="success" className="me-2">
            자산 스냅샷 등록
          </Button>
          <Button onClick={handleDownloadClick} variant="primary" className="me-2">
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
      <AssetSnapshotModal ref={assetSnapshotModalRef} />
      <AssetSnapshotReadModal ref={assetSnapshotReadModalRef} />
    </Container>
  );
}

export default AssetSnapshotList;
