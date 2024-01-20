import React, { CSSProperties, useEffect, useRef } from 'react';
import { Cell, Column, useSortBy, useTable } from 'react-table';
import { NumericFormat } from 'react-number-format';
import { CurrencyProperties, StockEvaluateModel } from '../../common/RendererModel';
import { convertToComma, printColorAmount, printColorPercentage, renderSortIndicator } from '../util/util';
import StockBuyMapper from '../../mapper/StockBuyMapper';
import StockMapper from '../../mapper/StockMapper';
import AccountMapper from '../../mapper/AccountMapper';
import CodeMapper from '../../mapper/CodeMapper';
import { CodeKind } from '../../../common/CommonType';

type SnapshotStockListInputProps = {
  stockEvaluateList: StockEvaluateModel[];
  onUpdateValue: (index: number, value: StockEvaluateModel) => void;
};

function SnapshotStockListInput({ stockEvaluateList, onUpdateValue }: SnapshotStockListInputProps) {
  const renderEvaluateAmountInput = (index: number, evaluateAmount: number) => {
    return (
      <NumericFormat
        value={evaluateAmount}
        thousandSeparator
        maxLength={15}
        className="form-control"
        style={{ textAlign: 'right' }}
        onValueChange={(values) => {
          const newEvaluateAmount = values.floatValue ?? 0;
          onUpdateValue(index, { ...stockEvaluateList[index], evaluateAmount: newEvaluateAmount });
        }}
      />
    );
  };

  // 종목, 연결계좌, 종류, 상장국가, 매수금액, 평가금액, 매도차익, 수익률
  const columns: Column<StockEvaluateModel>[] = React.useMemo(
    () => [
      {
        Header: '종목',
        id: 'stockName',
        accessor: 'stockBuySeq',
        Cell: ({ value }) => StockMapper.getStock(StockBuyMapper.getStockBuy(value).stockSeq).name,
      },
      {
        Header: '연결계좌',
        id: 'accountName',
        accessor: 'stockBuySeq',
        Cell: ({ value }) => AccountMapper.getAccount(StockBuyMapper.getStockBuy(value).accountSeq).name,
      },
      {
        Header: '주식종류',
        id: 'typeStockName',
        accessor: 'stockBuySeq',
        Cell: ({ value }) => CodeMapper.getValue(CodeKind.STOCK_TYPE, StockMapper.getStock(StockBuyMapper.getStockBuy(value).stockSeq).stockTypeCode),
      },
      {
        Header: '상장국가',
        id: 'typeNationName',
        accessor: 'stockBuySeq',
        Cell: ({ value }) => CodeMapper.getValue(CodeKind.NATION_TYPE, StockMapper.getStock(StockBuyMapper.getStockBuy(value).stockSeq).nationCode),
      },
      {
        Header: '통화',
        id: 'currency',
        accessor: 'stockBuySeq',
        Cell: ({ value }) => CurrencyProperties[StockMapper.getStock(StockBuyMapper.getStockBuy(value).stockSeq).currency].name,
      },
      { Header: '매수금액', accessor: 'buyAmount', Cell: ({ value }) => convertToComma(value) },
      {
        Header: '평가금액',
        id: 'evaluateAmount',
        accessor: 'evaluateAmount',
        Cell: ({ value, row }) => renderEvaluateAmountInput(row.index, value),
      },
      {
        Header: '매도차익',
        id: 'diffAmount',
        Cell: ({ row }) => printColorAmount(row.original.evaluateAmount - row.original.buyAmount),
      },
      {
        Header: '수익률',
        id: 'diffRate',
        Cell: ({ row }) => printColorPercentage((row.original.evaluateAmount - row.original.buyAmount) / row.original.buyAmount),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const data = React.useMemo<StockEvaluateModel[]>(() => stockEvaluateList, [stockEvaluateList]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<StockEvaluateModel>(
    {
      columns,
      data,
      // 정렬 조건 유지
      // @ts-ignore
      autoResetSortBy: false,
    },
    useSortBy,
  );

  const renderCell = (cell: Cell<StockEvaluateModel>) => {
    const customStyles: CSSProperties = {};

    if (['buyAmount', 'diffAmount', 'diffRate'].includes(cell.column.id)) {
      customStyles.textAlign = 'right';
    }

    if (['diffAmount', 'diffRate'].includes(cell.column.id)) {
      customStyles.width = '130px';
    }
    if (['evaluateAmount'].includes(cell.column.id)) {
      customStyles.width = '200px';
    }

    return (
      <td {...cell.getCellProps()} style={customStyles}>
        {cell.render('Cell')}
      </td>
    );
  };

  const tableRef = useRef<HTMLTableElement>(null);

  return (
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
  );
}

SnapshotStockListInput.displayName = 'SnapshotStockListInput';
export default SnapshotStockListInput;
