import React, { CSSProperties, useRef } from 'react';
import { Cell, Column, useSortBy, useTable } from 'react-table';
import { Button, ButtonGroup, Col, Container, Row } from 'react-bootstrap';
import { Currency, ResAssetSnapshotModel } from '../common/BokslTypes';
import { deleteConfirm, downloadForTable, printMultiCurrency, renderSortIndicator } from '../util/util';
import AssetSnapshotModal, { AssetSnapshotModelHandle } from './AssetSnapshotModel';

function AssetSnapshotList() {
  const AssetSnapshotModalRef = useRef<AssetSnapshotModelHandle>(null);

  const addStock = () => {
    if (!AssetSnapshotModalRef.current) {
      return;
    }
    AssetSnapshotModalRef.current.openStockModal(0, () => {
      console.log('save');
    });
  };

  const editStock = (stockSeq: number) => {
    if (!AssetSnapshotModalRef.current) {
      return;
    }
    AssetSnapshotModalRef.current.openStockModal(stockSeq, () => {
      console.log('edit');
    });
  };

  const deleteStock = (stockSeq: number) => {
    console.log(`${stockSeq}삭제`);
  };

  function renderActionButtons(record: ResAssetSnapshotModel) {
    return (
      <ButtonGroup size="sm">
        <Button onClick={() => editStock(record.assetSnapshotSeq)} className="small-text-button" variant="secondary">
          수정
        </Button>
        <Button onClick={() => deleteConfirm(() => deleteStock(record.assetSnapshotSeq))} className="small-text-button" variant="light">
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

  const columns: Column<ResAssetSnapshotModel>[] = React.useMemo(
    () => [
      { Header: '설명', accessor: 'name' },
      { Header: '합산자산', accessor: 'totalAmount', Cell: ({ value }) => printMultiCurrency(value) },
      { Header: '평가자산', accessor: 'evaluateAmount', Cell: ({ value }) => printMultiCurrency(value) },
      {
        Header: '수익금',
        id: 'profit',
        Cell: ({ row }) =>
          printMultiCurrency(
            row.original.evaluateAmount.map((e, i) => ({
              ...e,
              amount: e.amount - row.original.totalAmount[i].amount,
            })),
          ),
      },
      {
        Header: '주식매도확인일',
        accessor: 'stockSellCheckDate',
        Cell: ({ value }) => value && new Date(value).toLocaleDateString(),
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
        totalAmount: [
          {
            currency: Currency.KRW,
            amount: 1000000,
          },
          {
            currency: Currency.USD,
            amount: 1000,
          },
        ],
        evaluateAmount: [
          {
            currency: Currency.KRW,
            amount: 1000000,
          },
          {
            currency: Currency.USD,
            amount: 1000,
          },
        ],
        stockSellCheckDate: new Date(),
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

    if (['evaluateAmount', 'totalAmount'].includes(cell.column.id)) {
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
  const downloadList = () => {
    downloadForTable(tableRef, `주식 종목.xls`);
  };

  return (
    <Container fluid className="ledger-table">
      <Row className="align-items-center" style={{ textAlign: 'right' }}>
        <Col>
          <Button onClick={() => addStock()} variant="success" className="me-2">
            자산 스냅샷 등록
          </Button>
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
      <AssetSnapshotModal ref={AssetSnapshotModalRef} />
    </Container>
  );
}

export default AssetSnapshotList;
