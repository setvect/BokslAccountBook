import React, { CSSProperties, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Button, Modal, Row } from 'react-bootstrap';
import moment from 'moment';
import { AccountType, CurrencyProperties, TransactionKindProperties } from '../../common/RendererModel';
import { convertToCommaSymbol, downloadForTable, renderSortIndicator } from '../util/util';
import { Currency, TransactionKind } from '../../../common/CommonType';
import IpcCaller from '../../common/IpcCaller';
import { ResTransactionModel } from '../../../common/ResModel';
import { Cell, CellProps, Column, useSortBy, useTable } from 'react-table';
import CategoryMapper from '../../mapper/CategoryMapper';
import AccountMapper from '../../mapper/AccountMapper';
import _ from 'lodash';

export interface FinancialTransactionListModalHandle {
  openModal: (type: TransactionKind, year: number, month: number, currency: Currency) => void;
}

const FinancialTransactionListModal = forwardRef<FinancialTransactionListModalHandle, {}>((props, ref) => {
  const [showModal, setShowModal] = useState(false);
  const [transactionList, setTransactionList] = useState<ResTransactionModel[]>([]);
  const [type, setType] = useState<TransactionKind>(TransactionKind.SPENDING);
  const [from, setFrom] = useState<Date>(new Date());
  const [to, setTo] = useState<Date>(new Date());
  const [currency, setCurrency] = useState<Currency>(Currency.KRW);

  function getTransactionKindFromString(value: string) {
    return Object.values(AccountType).find((kind) => kind === value);
  }

  useImperativeHandle(ref, () => {
    return {
      openModal: async (kind: TransactionKind, year: number, month: number, currency: Currency) => {
        setType(kind);
        setFrom(new Date(year, month - 1, 1));
        setTo(new Date(year, month, 0));
        setCurrency(currency);

        const accountType = getTransactionKindFromString(kind.toString());
        const checkType = new Set<AccountType>();
        if (accountType) {
          checkType.add(accountType);
        }
        const searchCondition = {
          from: new Date(year, month - 1, 1),
          to: new Date(year, month, 0),
          checkType,
          currency,
        };

        const resTransactionModels = await IpcCaller.getTransactionList(searchCondition);
        setTransactionList(resTransactionModels);

        setShowModal(true);
      },
    };
  });
  const renderType = ({ row }: CellProps<ResTransactionModel>) => {
    const kindProperty = TransactionKindProperties[row.original.kind];
    return <span className={kindProperty.color}>{kindProperty.label}</span>;
  };

  const data = React.useMemo<ResTransactionModel[]>(() => transactionList, [transactionList]);
  const columns: Column<ResTransactionModel>[] = React.useMemo(
    () => [
      { Header: 'No', id: 'no', accessor: (row, index) => index + 1 },
      { Header: '유형', id: 'kind', Cell: renderType },
      { Header: '내용', accessor: 'note' },
      {
        Header: '분류',
        accessor: 'categorySeq',
        Cell: ({ row }) => CategoryMapper.getPathText(row.original.categorySeq),
      },
      {
        Header: '통화',
        accessor: 'currency',
        Cell: ({ value }) => CurrencyProperties[value].name,
      },
      {
        Header: '금액',
        accessor: 'amount',
        Cell: ({ row }) => convertToCommaSymbol(row.original.amount, row.original.currency),
      },
      {
        Header: '수수료',
        accessor: 'fee',
        Cell: ({ row }) => convertToCommaSymbol(row.original.fee, row.original.currency),
      },
      {
        Header: '출금계좌',
        accessor: 'payAccount',
        Cell: ({ value }) => (value ? AccountMapper.getName(value) : '-'),
      },
      {
        Header: '입금계좌',
        accessor: 'receiveAccount',
        Cell: ({ value }) => (value ? AccountMapper.getName(value) : '-'),
      },
      { Header: '날짜', accessor: 'transactionDate', Cell: ({ value }) => moment(value).format('YYYY-MM-DD') },
    ],
    [],
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<ResTransactionModel>(
    {
      columns,
      data,
    },
    useSortBy,
  );

  const renderCell = (cell: Cell<ResTransactionModel>) => {
    const customStyles: CSSProperties = {};
    if (['amount', 'fee'].includes(cell.column.id)) {
      customStyles.textAlign = 'right';
    }

    if (['no', 'kind', 'actions'].includes(cell.column.id)) {
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
    downloadForTable(
      tableRef,
      `${TransactionKindProperties[type].label}_결산내역_${moment(from).format('YYYY.MM.DD')}_${moment(to).format('YYYY.MM.DD')}.xls`,
    );
  };

  return (
    <Modal dialogClassName="modal-xl" show={showModal} onHide={() => setShowModal(false)} centered data-bs-theme="dark">
      <Modal.Header closeButton className="bg-dark text-white-50">
        <Modal.Title>
          {moment(from).format('YYYY.MM.DD')} ~ {moment(to).format('YYYY.MM.DD')} {TransactionKindProperties[type].label} 내역 (총:{' '}
          {convertToCommaSymbol(_.sumBy(transactionList, 'amount'), currency)})
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-white-50">
        <Row>
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
        </Row>
      </Modal.Body>
      <Modal.Footer className="bg-dark text-white-50">
        <Button variant="primary" onClick={() => handleDownloadClick()}>
          내보내기(엑셀)
        </Button>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
});
FinancialTransactionListModal.displayName = 'FinancialTransactionListModal';

export default FinancialTransactionListModal;
