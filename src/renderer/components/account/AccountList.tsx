import React, { CSSProperties, useMemo, useRef, useState } from 'react';
import { Cell, Column, useSortBy, useTable } from 'react-table';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { downloadForTable, printEnable, printMultiCurrency, renderSortIndicator, toBr } from '../util/util';
import AccountModal, { AccountModalHandle } from './AccountModal';
import AccountReadModal, { AccountReadModalHandle } from './AccountReadModal';
import AccountMapper from '../../mapper/AccountMapper';
import CodeMapper from '../../mapper/CodeMapper';
import { ResAccountModel } from '../../../common/ResModel';
import { CodeKind } from '../../../common/CommonType';

function AccountList() {
  const [showEnabledOnly, setShowEnabledOnly] = useState(true);
  const [accountList, setAccountList] = useState<ResAccountModel[]>(AccountMapper.getList());
  const [filterName, setFilterName] = useState('');

  const accountModalRef = useRef<AccountModalHandle>(null);
  const accountReadModalRef = useRef<AccountReadModalHandle>(null);
  const printLink = (record: ResAccountModel) => {
    return (
      <Button
        variant="link"
        onClick={() => {
          accountReadModalRef.current?.openAccountReadModal(record.accountSeq);
        }}
        className="link-button"
      >
        {record.name}
      </Button>
    );
  };

  const columns: Column<ResAccountModel>[] = React.useMemo(
    () => [
      { Header: 'No', id: 'no', accessor: (row, index) => index + 1 },
      {
        Header: '자산종류',
        accessor: 'assetType',
        Cell: ({ value }) => CodeMapper.getValue(CodeKind.ASSET_TYPE, value),
      },
      {
        Header: '계좌성격',
        accessor: 'accountType',
        Cell: ({ value }) => CodeMapper.getValue(CodeKind.ACCOUNT_TYPE, value),
      },
      {
        Header: '이름',
        accessor: 'name',
        Cell: ({ row }) => printLink(row.original),
      },
      { Header: '잔고', accessor: 'balance', Cell: ({ value }) => printMultiCurrency(value) },
      { Header: '주식 매수가', accessor: 'stockBuyPrice', Cell: ({ value }) => printMultiCurrency(value) },
      { Header: '이율', accessor: 'interestRate' },
      { Header: '계좌번호', accessor: 'accountNumber' },
      { Header: '월 납입액', accessor: 'monthlyPay' },
      { Header: '만기일', accessor: 'expDate' },
      { Header: '메모', accessor: 'note', Cell: ({ value }) => toBr(value) },
      { Header: '주식계좌', accessor: 'stockF', Cell: ({ value }) => printEnable(value) },
      { Header: '활성', accessor: 'enableF', Cell: ({ value }) => printEnable(value) },
    ],
    [],
  );

  const filteredData = useMemo(() => {
    let filtered = showEnabledOnly ? accountList.filter((account) => account.enableF) : accountList;
    if (filterName) {
      filtered = filtered.filter((account) => account.name.toLowerCase().includes(filterName.toLowerCase()));
    }
    return filtered;
  }, [accountList, showEnabledOnly, filterName]);

  const handleNameFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(event.target.value);
  };

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<ResAccountModel>(
    {
      columns,
      data: filteredData,
    },
    useSortBy,
  );
  const renderCell = (cell: Cell<ResAccountModel>) => {
    const customStyles: CSSProperties = {};
    if (['balance', 'stockBuyPrice'].includes(cell.column.id)) {
      customStyles.textAlign = 'right';
    }

    if (['no', 'kindName', 'accountTypeName', 'stockF', 'enableF'].includes(cell.column.id)) {
      customStyles.textAlign = 'center';
    }

    if (cell.column.id === 'note') {
      customStyles.width = '270px';
    }

    return (
      <td {...cell.getCellProps()} style={customStyles}>
        {cell.render('Cell')}
      </td>
    );
  };

  const reloadAccount = async () => {
    await AccountMapper.loadList();
    setAccountList(AccountMapper.getList());
  };

  const handleEnableChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowEnabledOnly(event.target.checked);
  };

  const tableRef = useRef<HTMLTableElement>(null);
  const handleDownloadClick = () => {
    downloadForTable(tableRef, `계좌목록.xls`);
  };

  const handleAccountAddClick = () => {
    if (!accountModalRef.current) {
      return;
    }
    accountModalRef.current.openAccountModal(0);
  };

  return (
    <Container fluid className="ledger-table">
      <Row className="align-items-center">
        <Col xs="auto">
          <Form.Control type="text" placeholder="이름으로 검색" value={filterName} onChange={handleNameFilterChange} />
        </Col>
        <Col xs="auto" className="ms-auto">
          <Form.Check onChange={handleEnableChange} checked={showEnabledOnly} type="checkbox" id="account-enable-only" label="활성 계좌만 보기" />
        </Col>
        <Col xs="auto">
          <Button onClick={handleAccountAddClick} variant="success" className="me-2">
            계좌 등록
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
      <AccountModal ref={accountModalRef} onSubmit={reloadAccount} />
      <AccountReadModal ref={accountReadModalRef} onChange={reloadAccount} />
    </Container>
  );
}

export default AccountList;
