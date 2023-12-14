import { Button, ButtonGroup, Col, Container, Row, Table } from 'react-bootstrap';
import { Cell, CellProps, Column, useSortBy, useTable } from 'react-table';
import React, { CSSProperties, useRef, useState } from 'react';
import moment from 'moment/moment';
import { AccountType, ResTransactionModel, TransactionKind, TransactionKindProperties, TransactionForm } from '../../type/BokslTypes';
import Search, { SearchModel } from './Search';
import { convertToComma, downloadForTable, renderSortIndicator } from '../util/util';
import TransactionModal, { TransactionModalHandle } from '../common/TransactionModal';

function renderActionButtons({ row }: CellProps<ResTransactionModel>) {
  return (
    <ButtonGroup size="sm">
      <Button className="small-text-button" variant="secondary">
        수정 {row.original.id}
      </Button>
      <Button className="small-text-button" variant="light">
        삭제
      </Button>
    </ButtonGroup>
  );
}

function renderType({ row }: CellProps<ResTransactionModel>) {
  const kindProperty = TransactionKindProperties[row.original.type];
  return <span className={kindProperty.color}>{kindProperty.label}</span>;
}

function TableTransaction() {
  const now = new Date();
  const transactionModalRef = useRef<TransactionModalHandle>(null);

  const [range, setRange] = useState({
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
  });

  const handleTransactionAdd = (kind: TransactionKind) => {
    const item: TransactionForm = {
      transactionDate: range.to,
      categorySeq: 0,
      kind,
      note: '',
      money: 0,
      payAccount: 0,
      receiveAccount: 0,
      attribute: '',
      fee: 0,
    };

    transactionModalRef.current?.openTransactionModal(kind, item, () => {
      console.log('저장 완료 reload');
    });
  };

  const data = React.useMemo<ResTransactionModel[]>(
    () => [
      {
        id: 1,
        type: TransactionKind.EXPENSE,
        memo: '물타기',
        categoryMain: '교통비',
        categorySub: '대중교통비',
        price: 10000,
        fee: 0,
        payAccount: '복슬카드',
        receiveAccount: null,
        date: '2021-01-01',
      },
      {
        id: 2,
        type: TransactionKind.INCOME,
        memo: '복권당첨',
        categoryMain: '기타소득',
        categorySub: '불로소득',
        price: 3100000000,
        fee: 0,
        payAccount: null,
        receiveAccount: '복슬통장',
        date: '2021-01-01',
      },
      {
        id: 3,
        type: TransactionKind.TRANSFER,
        memo: '카드값',
        categoryMain: '대체거래',
        categorySub: '계좌이체',
        price: 1000000,
        fee: 0,
        payAccount: '복슬통장',
        receiveAccount: '복슬카드',
        date: '2021-02-01',
      },
    ],
    [],
  );

  const columns: Column<ResTransactionModel>[] = React.useMemo(
    () => [
      { Header: 'No', accessor: 'id' },
      { Header: '유형', id: 'type', Cell: renderType },
      { Header: '내용', accessor: 'memo' },
      { Header: '대분류', accessor: 'categoryMain' },
      { Header: '소분류', accessor: 'categorySub' },
      { Header: '금액', accessor: 'price', Cell: ({ value }) => convertToComma(value) },
      { Header: '수수료', accessor: 'fee', Cell: ({ value }) => convertToComma(value) },
      { Header: '출금계좌', accessor: 'payAccount' },
      { Header: '입금계좌', accessor: 'receiveAccount' },
      { Header: '날짜', accessor: 'date' },
      {
        Header: '기능',
        id: 'actions',
        Cell: renderActionButtons,
      },
    ],
    [],
  );
  const renderCell = (cell: Cell<ResTransactionModel>) => {
    const customStyles: CSSProperties = {};
    if (['price', 'fee'].includes(cell.column.id)) {
      customStyles.textAlign = 'right';
    }

    if (['id', 'type', 'actions'].includes(cell.column.id)) {
      customStyles.textAlign = 'center';
    }
    return (
      <td {...cell.getCellProps()} style={customStyles}>
        {cell.render('Cell')}
      </td>
    );
  };

  const handleSearch = (searchModel: SearchModel) => {
    setRange({ from: searchModel.from, to: searchModel.to });
  };

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<ResTransactionModel>(
    {
      columns,
      data,
    },
    useSortBy,
  );

  const tableRef = useRef<HTMLTableElement>(null);
  const handleDownload = () => {
    downloadForTable(tableRef, `가계부_내역_${moment(range.from).format('YYYY.MM.DD')}_${moment(range.to).format('YYYY.MM.DD')}.xls`);
  };

  return (
    <Container fluid className="ledger-table">
      <Row>
        <Col sm={9}>
          <Row>
            <Col sm={12} style={{ textAlign: 'right' }}>
              <Button onClick={() => handleTransactionAdd(TransactionKind.EXPENSE)} variant="success" className="me-2">
                지출
              </Button>
              <Button onClick={() => handleTransactionAdd(TransactionKind.INCOME)} variant="success" className="me-2">
                수입
              </Button>
              <Button onClick={() => handleTransactionAdd(TransactionKind.TRANSFER)} variant="success" className="me-2">
                이체
              </Button>
              <Button onClick={() => handleDownload()} variant="primary" className="me-2">
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
                  return <tr {...row.getRowProps()}>{row.cells.map((cell) => renderCell(cell))}</tr>;
                })}
              </tbody>
            </table>
          </Row>
        </Col>
        <Col sm={3}>
          <Row>
            <Col sm={12}>
              <Search onSearch={handleSearch} accountTypeList={[AccountType.EXPENSE, AccountType.INCOME, AccountType.TRANSFER]} />
            </Col>
          </Row>
          <Row style={{ marginTop: '10px' }}>
            <Col sm={12}>
              <h5>
                {moment(range.from).format('YYYY-MM-DD')} ~ {moment(range.to).format('YYYY-MM-DD')} 내역
              </h5>
              <Table striped bordered hover variant="dark" className="table-th-center table-font-size">
                <tbody>
                  <tr>
                    <td>
                      <span className="account-expense">지출</span>
                    </td>
                    <td className="right">10,000</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="account-income">수입</span>
                    </td>
                    <td className="right">10,000</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="account-income">수입</span> - <span className="account-expense">지출</span>
                    </td>
                    <td className="right">10,000</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="account-transfer"> 이체</span>
                    </td>
                    <td className="right">10,000</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
        </Col>
      </Row>
      <TransactionModal ref={transactionModalRef} />
    </Container>
  );
}

export default TableTransaction;
