import { Button, ButtonGroup, Col, Container, Form, FormControl, Row, Table } from 'react-bootstrap';
import React, { ChangeEvent, useState } from 'react';
import DatePicker from 'react-datepicker';
import Select, { GroupBase } from 'react-select';
import moment from 'moment/moment';
import { AccountProperties, AccountType, OptionType } from '../common/BokslTypes';
import darkThemeStyles from '../common/BokslConstant';
import Swal from 'sweetalert2';

function TableTransaction() {
  const now = new Date();

  const [searchModel, setSearchModel] = useState({
    memo: '',
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    account: 2,
    expense: true,
    income: true,
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

  return (
    <Container fluid className="ledger-table">
      <Row>
        <Col sm={9}>
          <Row>
            <Col sm={12} style={{ textAlign: 'right' }}>
              <Button variant="success" className="me-2">
                지출
              </Button>
              <Button variant="success" className="me-2">
                수입
              </Button>
              <Button variant="success" className="me-2">
                이체
              </Button>
            </Col>
            <Table striped bordered hover responsive="md" variant="dark" className="table-th-center table-font-size" style={{ marginTop: '10px' }}>
              <thead>
                <tr>
                  <th>No</th>
                  <th>유형</th>
                  <th>메모</th>
                  <th>대분류</th>
                  <th>소분류</th>
                  <th>날짜</th>
                  <th>금액</th>
                  <th>수수료</th>
                  <th>출금계좌</th>
                  <th>입금계좌</th>
                  <th>날짜</th>
                  <th>기능</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td style={{ color: AccountProperties[AccountType.EXPENSE].color }}>지출</td>
                  <td>전철비</td>
                  <td>교통비</td>
                  <td>대중교통비</td>
                  <td>2021-01-01</td>
                  <td className="right">10,000</td>
                  <td className="right">0</td>
                  <td>[카드]복슬카드</td>
                  <td>&nbsp;</td>
                  <td>2021-01-01</td>
                  <td style={{ textAlign: 'center' }}>
                    <ButtonGroup size="sm">
                      <Button className="small-text-button" variant="secondary">
                        수정
                      </Button>
                      <Button className="small-text-button" variant="light">
                        삭제
                      </Button>
                    </ButtonGroup>
                  </td>
                </tr>
                <tr>
                  <td>2</td>
                  <td style={{ color: AccountProperties[AccountType.INCOME].color }}>수입</td>
                  <td>복권당첨</td>
                  <td>기타소득</td>
                  <td>복권소득</td>
                  <td>2021-01-01</td>
                  <td className="right">3,100,000,000</td>
                  <td className="right">0</td>
                  <td>&nbsp;</td>
                  <td>복슬통장</td>
                  <td>2021-01-01</td>
                  <td style={{ textAlign: 'center' }}>
                    <ButtonGroup size="sm">
                      <Button className="small-text-button" variant="secondary">
                        수정
                      </Button>
                      <Button className="small-text-button" variant="light">
                        삭제
                      </Button>
                    </ButtonGroup>
                  </td>
                </tr>
                <tr>
                  <td>3</td>
                  <td style={{ color: AccountProperties[AccountType.TRANSFER].color }}>이체</td>
                  <td>카드값</td>
                  <td>대체거래</td>
                  <td>계좌이체</td>
                  <td>2021-01-01</td>
                  <td className="right">1,000,000</td>
                  <td className="right">0</td>
                  <td>복슬통장</td>
                  <td>복슬카드</td>
                  <td>2021-01-01</td>
                  <td style={{ textAlign: 'center' }}>
                    <ButtonGroup size="sm">
                      <Button className="small-text-button" variant="secondary">
                        수정
                      </Button>
                      <Button className="small-text-button" variant="light">
                        삭제
                      </Button>
                    </ButtonGroup>
                  </td>
                </tr>
              </tbody>
            </Table>
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
                      label="지출"
                      type="checkbox"
                      id="checkbox-expense"
                      name="expense"
                      checked={searchModel.expense}
                      onChange={handleChange}
                    />
                    <Form.Check
                      inline
                      label="수입"
                      type="checkbox"
                      id="checkbox-income"
                      name="income"
                      checked={searchModel.income}
                      onChange={handleChange}
                    />
                    <Form.Check
                      inline
                      label="이체"
                      type="checkbox"
                      id="checkbox-transfer"
                      name="transfer"
                      checked={searchModel.transfer}
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
                      <span style={{ color: AccountProperties[AccountType.EXPENSE].color }}>지출</span>
                    </td>
                    <td className="right">10,000</td>
                  </tr>
                  <tr>
                    <td>
                      <span style={{ color: AccountProperties[AccountType.INCOME].color }}>수입</span>
                    </td>
                    <td className="right">10,000</td>
                  </tr>
                  <tr>
                    <td>
                      <span style={{ color: AccountProperties[AccountType.INCOME].color }}>수입</span> -{' '}
                      <span style={{ color: AccountProperties[AccountType.EXPENSE].color }}>지출</span>
                    </td>
                    <td className="right">10,000</td>
                  </tr>
                  <tr>
                    <td>
                      <span style={{ color: AccountProperties[AccountType.TRANSFER].color }}> 이체</span>
                    </td>
                    <td className="right">10,000</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default TableTransaction;
