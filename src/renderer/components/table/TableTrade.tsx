import { Button, ButtonGroup, Col, Container, Form, FormControl, Row, Table } from 'react-bootstrap';
import React, { ChangeEvent, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import Select, { GroupBase } from 'react-select';
import moment from 'moment/moment';
import Swal from 'sweetalert2';
import { useTable, useSortBy } from 'react-table';
import { OptionType, TradeKind, TradeModalForm } from '../common/BokslTypes';
import darkThemeStyles from '../common/BokslConstant';
import TradeModal, { TradeModalHandle } from '../common/TradeModal';

interface TableData {
  id: number;
  type: string;
  memo: string;
  item: string;
  quantity: number;
  price: number;
  total: number;
  profit: string;
  tax: number;
  fee: number;
  account: string;
  date: string;
}

function TableTrade() {
  const now = new Date();
  const tradeModalRef = useRef<TradeModalHandle>(null);

  const [searchModel, setSearchModel] = useState({
    memo: '',
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    account: 2,
    buy: true,
    sell: true,
    transfer: true,
  });

  const [range, setRange] = useState({
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
  });

  const handleMonthChange = (months: number) => {
    let newMonth;
    if (months === 0) {
      newMonth = new Date(now.getFullYear(), now.getMonth() + months, 1);
    } else {
      newMonth = new Date(searchModel.from.getFullYear(), searchModel.from.getMonth() + months, 1);
    }

    setSearchModel({
      ...searchModel,
      from: new Date(newMonth.getFullYear(), newMonth.getMonth(), 1),
      to: new Date(newMonth.getFullYear(), newMonth.getMonth() + 1, 0),
    });
  };

  const options = [
    { value: 1, label: '계좌 1' },
    { value: 2, label: '계좌 2' },
    { value: 3, label: '계좌 3' },
  ];

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setSearchModel((prevValues) => ({
      ...prevValues,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSearch = () => {
    if (searchModel.from > searchModel.to) {
      Swal.fire({
        title: '시작일이 종료일보다 큽니다.!',
        icon: 'warning',
        confirmButtonText: '확인',
        showClass: {
          popup: '',
          backdrop: '',
          icon: '',
        },
      });
      return;
    }

    setRange({ from: searchModel.from, to: searchModel.to });
    console.log(searchModel);
  };

  const handleTradeAdd = (kind: TradeKind) => {
    const item: TradeModalForm = {
      tradeDate: range.to,
      accountSeq: 0,
      stockSeq: 0,
      note: '',
      kind: TradeKind.SELL,
      quantity: 0,
      price: 0,
      tax: 0,
      fee: 0,
    };

    tradeModalRef.current?.openTradeModal(kind, item, () => {
      console.log('저장 완료 reload');
    });
  };

  const data: TableData[] = [
    {
      id: 1,
      type: '매수',
      memo: '물타기',
      item: '복슬철강',
      quantity: 2,
      price: 10000,
      total: 20000,
      profit: '-',
      tax: 0,
      fee: 0,
      account: '복슬증권',
      date: '2021-01-01',
    },
    {
      id: 2,
      type: '매도',
      memo: '손절 ㅜㅜ',
      item: '복슬철강',
      quantity: 2,
      price: 13000,
      total: 26000,
      profit: '6,000(30.0%)',
      tax: 0,
      fee: 0,
      account: '복슬증권',
      date: '2021-03-05',
    },
    // 추가 데이터...
  ];

  const columns = React.useMemo(
    () => [
      { Header: 'No', accessor: 'id' },
      { Header: '유형', accessor: 'type' },
      { Header: '메모', accessor: 'memo' },
      { Header: '종목', accessor: 'item' },
      { Header: '수량', accessor: 'quantity' },
      { Header: '단가', accessor: 'price' },
      { Header: '합산금액', accessor: 'total' },
      { Header: '매도차익', accessor: 'profit' },
      { Header: '거래세', accessor: 'tax' },
      { Header: '수수료', accessor: 'fee' },
      { Header: '거래계좌', accessor: 'account' },
      { Header: '날짜', accessor: 'date' },
      {
        Header: '기능',
        id: 'actions',
        accessor: 'actions',
        Cell: ({ row }: { row: any }) => (
          <ButtonGroup size="sm">
            <Button className="small-text-button" variant="secondary">
              수정
            </Button>
            <Button className="small-text-button" variant="light">
              삭제
            </Button>
          </ButtonGroup>
        ),
      },
    ],
    [],
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<TableData>({ columns, data }, useSortBy);

  return (
    <Container fluid className="ledger-table">
      <Row>
        <Col sm={9}>
          <Row>
            <Col sm={12} style={{ textAlign: 'right' }}>
              <Button onClick={() => handleTradeAdd(TradeKind.BUY)} variant="success" className="me-2">
                매수
              </Button>
              <Button onClick={() => handleTradeAdd(TradeKind.SELL)} variant="success" className="me-2">
                매도
              </Button>
            </Col>
            <table
              {...getTableProps()}
              className="table table-striped table-bordered table-hover table-th-center table-font-size"
              style={{ marginTop: '10px' }}
            >
              <thead>
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                        {column.render('Header')}
                        <span>{column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}</span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {rows.map((row) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map((cell) => {
                        return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Row>
        </Col>
        <Col sm={3}>
          <Row>
            <Col sm={12}>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  시작일
                </Form.Label>
                <Col sm={9}>
                  <DatePicker
                    selected={searchModel.from}
                    dateFormat="yyyy-MM-dd"
                    onChange={(date: Date) => {
                      setSearchModel({ ...searchModel, from: date });
                    }}
                    className="form-control form-control-sm"
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  종료일
                </Form.Label>
                <Col sm={9}>
                  <DatePicker
                    selected={searchModel.to}
                    dateFormat="yyyy-MM-dd"
                    onChange={(date: Date) => {
                      setSearchModel({ ...searchModel, to: date });
                    }}
                    className="form-control form-control-sm"
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  계좌
                </Form.Label>
                <Col sm={9}>
                  <Select<OptionType, false, GroupBase<OptionType>>
                    value={options.find((option) => option.value === searchModel.account)}
                    onChange={(selectedOption) =>
                      setSearchModel({
                        ...searchModel,
                        account: selectedOption ? selectedOption.value : 0,
                      })
                    }
                    options={options}
                    placeholder="계좌 선택"
                    className="react-select-container"
                    styles={darkThemeStyles}
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  메모
                </Form.Label>
                <Col sm={9}>
                  <FormControl name="memo" value={searchModel.memo} onChange={handleChange} maxLength={30} />
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  유형
                </Form.Label>
                <Col sm={9}>
                  <div style={{ display: 'inline-block', marginTop: '7px' }}>
                    <Form.Check
                      inline
                      label="매수"
                      type="checkbox"
                      id="checkbox-expense"
                      name="expense"
                      checked={searchModel.buy}
                      onChange={handleChange}
                    />
                    <Form.Check
                      inline
                      label="매도"
                      type="checkbox"
                      id="checkbox-income"
                      name="income"
                      checked={searchModel.sell}
                      onChange={handleChange}
                    />
                  </div>
                </Col>
              </Form.Group>
              <Row>
                <Col sm={12}>
                  <Button onClick={handleSearch} size="sm" variant="primary" className="me-2">
                    검색
                  </Button>
                  <Button size="sm" variant="primary" className="me-2" onClick={() => handleMonthChange(-1)}>
                    이전달
                  </Button>
                  <Button size="sm" variant="primary" className="me-2" onClick={() => handleMonthChange(0)}>
                    이번달
                  </Button>
                  <Button size="sm" variant="primary" className="me-2" onClick={() => handleMonthChange(1)}>
                    다음달
                  </Button>
                </Col>
              </Row>
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
                      <span className="account-buy">매수</span>
                    </td>
                    <td className="right">10,000</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="account-sell">매도</span>
                    </td>
                    <td className="right">10,000</td>
                  </tr>
                  <tr>
                    <td>매도차익</td>
                    <td className="right">
                      <span className="account-buy">6,000(30.0%)</span>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
        </Col>
      </Row>
      <TradeModal ref={tradeModalRef} />
    </Container>
  );
}

export default TableTrade;
