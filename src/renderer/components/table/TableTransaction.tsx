import { Button, Col, Container, Row, Table } from 'react-bootstrap';
import { Column, useSortBy, useTable } from 'react-table';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import moment from 'moment/moment';
import { AccountType, CurrencyProperties } from '../../common/RendererModel';
import Search from './Search';
import { convertToCommaSymbol, downloadForTable, renderSortIndicator } from '../util/util';
import TransactionModal, { TransactionModalHandle } from '../common/TransactionModal';
import AccountMapper from '../../mapper/AccountMapper';
import { ResTransactionModel } from '../../../common/ResModel';
import { TransactionKind } from '../../../common/CommonType';
import CategoryMapper from '../../mapper/CategoryMapper';
import TransactionSummary from './TransactionSummary';
import IpcCaller from '../../common/IpcCaller';
import TransactionEditDelete from '../common/part/TransactionEditDelete';
import { ReqSearchModel } from '../../../common/ReqModel';
import TransactionCommon from '../common/part/TransactionCommon';

const CHECK_TYPES = [AccountType.SPENDING, AccountType.INCOME, AccountType.TRANSFER];

function TableTransaction() {
  const now = new Date();
  const [transactionList, setTransactionList] = useState<ResTransactionModel[]>([]);
  const transactionModalRef = useRef<TransactionModalHandle>(null);
  const [searchModel, setSearchModel] = useState<ReqSearchModel>({
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    checkType: new Set(CHECK_TYPES),
  });

  const handleTransactionAddClick = (kind: TransactionKind) => {
    transactionModalRef.current?.openTransactionModal(kind, 0, new Date());
  };

  const loadTransactionList = useCallback(async () => {
    setTransactionList(await IpcCaller.getTransactionList(searchModel));
  }, [searchModel]);

  const data = React.useMemo<ResTransactionModel[]>(() => transactionList, [transactionList]);

  const columns: Column<ResTransactionModel>[] = React.useMemo(
    () => [
      { Header: 'No', id: 'no', accessor: (row, index) => index + 1 },
      { Header: '유형', id: 'kind', Cell: TransactionCommon.renderType },
      { Header: '메모', accessor: 'note' },
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
      {
        Header: '기능',
        id: 'actions',
        Cell: ({ row }) => TransactionEditDelete({ transaction: row.original, onReload: loadTransactionList }),
      },
    ],
    [loadTransactionList],
  );

  const handleSearch = (searchModel: ReqSearchModel) => {
    setSearchModel(searchModel);
  };

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<ResTransactionModel>(
    {
      columns,
      data,
    },
    useSortBy,
  );

  const tableRef = useRef<HTMLTableElement>(null);
  const handleDownloadClick = () => {
    downloadForTable(tableRef, `가계부_내역_${moment(searchModel.from).format('YYYY.MM.DD')}_${moment(searchModel.to).format('YYYY.MM.DD')}.xls`);
  };

  useEffect(() => {
    (async () => {
      await loadTransactionList();
    })();
  }, [loadTransactionList]);

  return (
    <Container fluid className="ledger-table">
      <Row>
        <Col sm={9}>
          <Row>
            <Col sm={12} style={{ textAlign: 'right' }}>
              <Button onClick={() => handleTransactionAddClick(TransactionKind.SPENDING)} variant="success" className="me-2">
                지출
              </Button>
              <Button onClick={() => handleTransactionAddClick(TransactionKind.INCOME)} variant="success" className="me-2">
                수입
              </Button>
              <Button onClick={() => handleTransactionAddClick(TransactionKind.TRANSFER)} variant="success" className="me-2">
                이체
              </Button>
              <Button onClick={() => handleDownloadClick()} variant="primary" className="me-2">
                내보내기(엑셀)
              </Button>
            </Col>
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
                  return <tr {...row.getRowProps()}>{row.cells.map((cell) => TransactionCommon.renderCell(cell))}</tr>;
                })}
              </tbody>
            </table>
          </Row>
        </Col>
        <Col sm={3}>
          <Row>
            <Col sm={12}>
              <Search onSearch={handleSearch} accountTypeList={CHECK_TYPES} />
            </Col>
          </Row>
          <Row style={{ marginTop: '10px' }}>
            <Col sm={12}>
              <h5>
                {moment(searchModel.from).format('YYYY-MM-DD')} ~ {moment(searchModel.to).format('YYYY-MM-DD')} 내역
              </h5>
              <Table striped bordered hover variant="dark" className="table-th-center table-font-size">
                <tbody>
                  <TransactionSummary transactionList={transactionList} />
                </tbody>
              </Table>
            </Col>
          </Row>
        </Col>
      </Row>
      <TransactionModal ref={transactionModalRef} onSubmit={() => loadTransactionList()} />
    </Container>
  );
}

export default TableTransaction;
