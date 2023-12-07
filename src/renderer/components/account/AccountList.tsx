import React, { CSSProperties, useRef } from 'react';
import { Cell, Column, useSortBy, useTable } from 'react-table';
import { FaCheckCircle, FaRegCircle } from 'react-icons/fa';
import { Currency, CurrencyProperties, ResAccountModel, ResBalanceModel } from '../common/BokslTypes';
import { convertToComma, renderSortIndicator } from '../util/util';

function AccountList() {
  function printMultiCurrency(value: ResBalanceModel[]) {
    return (
      <div>
        {value.map((balance) => (
          <div key={balance.currency}>
            {CurrencyProperties[balance.currency].symbol} {convertToComma(balance.amount)}
          </div>
        ))}
      </div>
    );
  }

  function printEnable(value: boolean) {
    return value ? <FaCheckCircle color="yellow" /> : <FaRegCircle />;
  }

  const columns: Column<ResAccountModel>[] = React.useMemo(
    () => [
      { Header: '자산종류', accessor: 'kindName' },
      { Header: '계좌성격', accessor: 'accountTypeName' },
      { Header: '이름', accessor: 'name' },
      { Header: '잔고', accessor: 'balance', Cell: ({ value }) => printMultiCurrency(value) },
      { Header: '주식 매수가', accessor: 'stockBuyPrice', Cell: ({ value }) => printMultiCurrency(value) },
      { Header: '이율', accessor: 'interestRate' },
      { Header: '계좌번호', accessor: 'accountNumber' },
      { Header: '월 납입액', accessor: 'monthlyPay' },
      { Header: '만기일', accessor: 'expDate' },
      { Header: '메모', accessor: 'note' },
      { Header: '활성', accessor: 'enableF', Cell: ({ value }) => printEnable(value) },
    ],
    [],
  );
  const data = React.useMemo<ResAccountModel[]>(
    () => [
      {
        kindName: '은행통장',
        accountTypeName: '저축자산',
        name: '복슬통장',
        balance: [
          { currency: Currency.KRW, amount: 1000000 },
          { currency: Currency.USD, amount: 1000 },
        ],
        stockBuyPrice: [
          { currency: Currency.KRW, amount: 500000 },
          { currency: Currency.USD, amount: 500 },
        ],
        interestRate: '1.0%',
        accountNumber: '123-456-789',
        monthlyPay: '-',
        expDate: '-',
        note: '복슬이 사랑해',
        enableF: true,
      },
    ],
    [],
  );
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<ResAccountModel>(
    {
      columns,
      data,
    },
    useSortBy,
  );
  const renderCell = (cell: Cell<ResAccountModel>) => {
    const customStyles: CSSProperties = {};
    if (['balance', 'stockBuyPrice'].includes(cell.column.id)) {
      customStyles.textAlign = 'right';
    }

    if (['kindName', 'accountTypeName', 'enableF'].includes(cell.column.id)) {
      customStyles.textAlign = 'center';
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

export default AccountList;
