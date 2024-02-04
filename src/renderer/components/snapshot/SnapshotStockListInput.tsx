import React, { CSSProperties, useRef } from 'react';
import { Cell, CellProps, Column, useSortBy, useTable } from 'react-table';
import { NumericFormat } from 'react-number-format';
import { CurrencyProperties } from '../../common/RendererModel';
import { convertToCommaSymbol, printColorAmount, printColorPercentage, renderSortIndicator } from '../util/util';
import StockBuyMapper from '../../mapper/StockBuyMapper';
import StockMapper from '../../mapper/StockMapper';
import AccountMapper from '../../mapper/AccountMapper';
import CodeMapper from '../../mapper/CodeMapper';
import { CodeKind } from '../../../common/CommonType';
import { ResStockEvaluateModel } from '../../../common/ResModel';

type SnapshotStockListInputProps = {
  stockEvaluateList: ResStockEvaluateModel[];
  onUpdateValue: (index: number, value: ResStockEvaluateModel) => void;
};

function SnapshotStockListInput({ stockEvaluateList, onUpdateValue }: SnapshotStockListInputProps) {
  const renderEvaluateAmountInput = (index: number, stockEvaluateModel: ResStockEvaluateModel) => {
    const currency = getCurrency(stockEvaluateModel.stockBuySeq);

    // 소수점 처리
    const { decimalPlace } = CurrencyProperties[currency];
    const value = stockEvaluateModel.evaluateAmount.toFixed(decimalPlace);

    return (
      <NumericFormat
        value={value}
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

  function getCurrency(stockBuySeq: number) {
    return StockMapper.getStock(StockBuyMapper.getStockBuy(stockBuySeq).stockSeq).currency;
  }

  // 종목, 연결계좌, 종류, 상장국가, 매수금액, 평가금액, 매도차익, 수익률
  const columns: Column<ResStockEvaluateModel>[] = React.useMemo(
    () => [
      {
        Header: '종목',
        id: 'stockName',
        accessor: (row) => StockMapper.getStock(StockBuyMapper.getStockBuy(row.stockBuySeq).stockSeq).name,
        Cell: ({ value }: CellProps<ResStockEvaluateModel, string>) => value,
      },
      {
        Header: '연결계좌',
        id: 'accountName',
        accessor: (row) => AccountMapper.getAccount(StockBuyMapper.getStockBuy(row.stockBuySeq).accountSeq).name,
        Cell: ({ value }: CellProps<ResStockEvaluateModel, string>) => value,
      },
      {
        Header: '주식종류',
        id: 'typeStockName',
        accessor: (row) =>
          CodeMapper.getValue(CodeKind.STOCK_TYPE, StockMapper.getStock(StockBuyMapper.getStockBuy(row.stockBuySeq).stockSeq).stockTypeCode),
        Cell: ({ value }: CellProps<ResStockEvaluateModel, string>) => value,
      },
      {
        Header: '상장국가',
        id: 'typeNationName',
        accessor: (row) =>
          CodeMapper.getValue(CodeKind.NATION_TYPE, StockMapper.getStock(StockBuyMapper.getStockBuy(row.stockBuySeq).stockSeq).nationCode),
        Cell: ({ value }: CellProps<ResStockEvaluateModel, string>) => value,
      },
      {
        Header: '통화',
        id: 'currency',
        accessor: (row) => CurrencyProperties[getCurrency(row.stockBuySeq)].name,
        Cell: ({ value }: CellProps<ResStockEvaluateModel, string>) => value,
      },
      {
        Header: '매수금액',
        id: 'buyAmount',
        Cell: ({ row }) => convertToCommaSymbol(row.original.buyAmount, getCurrency(row.original.stockBuySeq)),
      },
      {
        Header: '평가금액',
        id: 'evaluateAmount',
        Cell: ({ row }) => renderEvaluateAmountInput(row.index, row.original),
      },
      {
        Header: '매도차익',
        id: 'diffAmount',
        Cell: ({ row }) => printColorAmount(row.original.evaluateAmount - row.original.buyAmount, getCurrency(row.original.stockBuySeq)),
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
  const data = React.useMemo<ResStockEvaluateModel[]>(() => stockEvaluateList, [stockEvaluateList]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<ResStockEvaluateModel>(
    {
      columns,
      data,
      // 정렬 조건 유지
      // @ts-ignore
      autoResetSortBy: false,
    },
    useSortBy,
  );

  const renderCell = (cell: Cell<ResStockEvaluateModel>) => {
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
