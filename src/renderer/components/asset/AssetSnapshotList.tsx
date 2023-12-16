import React, { CSSProperties, useRef } from 'react';
import { Cell, Column, useSortBy, useTable } from 'react-table';
import { Button, ButtonGroup, Col, Container, Row } from 'react-bootstrap';
import { Currency, ResAssetSnapshotModel } from '../../common/BokslTypes';
import { deleteConfirm, downloadForTable, printMultiCurrency, renderSortIndicator } from '../util/util';
import AssetSnapshotModal, { AssetSnapshotModelHandle } from './AssetSnapshotModel';

function AssetSnapshotList() {
  const AssetSnapshotModalRef = useRef<AssetSnapshotModelHandle>(null);

  const handleAddStockClick = () => {
    if (!AssetSnapshotModalRef.current) {
      return;
    }
    AssetSnapshotModalRef.current.openAssetSnapshotModal(0, () => {
      console.log('save');
    });
  };

  const handleEditStockClick = (stockSeq: number) => {
    if (!AssetSnapshotModalRef.current) {
      return;
    }
    AssetSnapshotModalRef.current.openAssetSnapshotModal(stockSeq, () => {
      console.log('edit');
    });
  };

  const deleteStock = (stockSeq: number) => {
    console.log(`${stockSeq}삭제`);
  };

  const handleDeleteClick = (stockSeq: number) => {
    deleteConfirm(() => deleteStock(stockSeq));
  };

  function renderActionButtons(record: ResAssetSnapshotModel) {
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
  }

  function printProfit(row: ResAssetSnapshotModel) {
    const value = row.evaluateAmount.map((e, i) => ({
      ...e,
      amount: e.amount - row.totalAmount[i].amount,
    }));
    return printMultiCurrency(value, true);
  }

  function printYield(row: ResAssetSnapshotModel) {
    return (
      <div>
        {row.totalAmount.map((total, index) => {
          const evaluate = row.evaluateAmount[index];
          const totalAmount = total.amount;
          const evaluateAmount = evaluate.amount;

          // 분모가 0인 경우를 처리
          if (totalAmount === 0) {
            return <div key={total.currency}>{total.currency}: N/A</div>;
          }

          const yieldValue = ((evaluateAmount - totalAmount) / totalAmount) * 100;
          return (
            <div key={total.currency} className={yieldValue > 0 ? 'account-buy' : 'account-sell'}>
              {total.currency}: {yieldValue.toFixed(2)}%
            </div>
          );
        })}
      </div>
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
        Cell: ({ row }) => printProfit(row.original),
      },
      {
        Header: '수익률(%)',
        id: 'profitRate',
        Cell: ({ row }) => printYield(row.original),
      },
      {
        Header: '주식매도확인일',
        accessor: 'stockSellCheckDate',
        Cell: ({ value }) => value && new Date(value).toLocaleDateString(),
      },
      {
        Header: '매도차익',
        accessor: 'stockSellProfitLossAmount',
        Cell: ({ value }) => printMultiCurrency(value, true),
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
            amount: 950000,
          },
          {
            currency: Currency.USD,
            amount: 1100,
          },
        ],
        stockSellCheckDate: new Date(2023, 5, 10),
        stockSellProfitLossAmount: [
          {
            currency: Currency.KRW,
            amount: 100000,
          },
          {
            currency: Currency.USD,
            amount: -100,
          },
        ],
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
      <AssetSnapshotModal ref={AssetSnapshotModalRef} />
    </Container>
  );
}

export default AssetSnapshotList;
