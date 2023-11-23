import { Button, ButtonGroup, Col, Container, Row, Table } from 'react-bootstrap';
import React, { useRef, useState } from 'react';
import moment from 'moment';
import CalendarPart, { CalendarPartMethods } from './calendar/CalendarPart';
import { AccountProperties, AccountType } from './common/BokslTypes';

// 이벤트 객체에 icon 속성을 추가하기 위한 인
function LedgerCalendar(): React.ReactElement {
  const [selectDate, setSelectDate] = useState<Date | null>(new Date());
  const handleChangeDate = (newSelectDate: Date) => {
    setSelectDate(newSelectDate);
  };

  const calendarPartRef = useRef<CalendarPartMethods>(null);
  const reloadLedger = () => {
    calendarPartRef.current?.reloadLedger();
  };

  return (
    <Container fluid style={{ height: '100%', padding: '20px' }} className="color-theme-content">
      <h2>달력</h2>
      <Row>
        <CalendarPart onChangeDate={handleChangeDate} ref={calendarPartRef} />
        <Col>
          <h3>{moment(selectDate).format('YYYY년 MM월 DD일')} 내역</h3>
          <Button onClick={reloadLedger}>현재 달 다시 계산</Button>
          <Table striped bordered hover variant="dark" className="table-th-center table-font-size">
            <thead>
              <tr>
                <th>유형</th>
                <th>분류</th>
                <th>내용</th>
                <th>금액</th>
                <th>출금계좌</th>
                <th>입금계좌</th>
                <th>기능</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ color: AccountProperties[AccountType.EXPENSE].color }}>지출</td>
                <td>교통비 &gt; 대중교통비 </td>
                <td>전철비</td>
                <td style={{ textAlign: 'right' }}>10,000</td>
                <td>[카드]복슬카드</td>
                <td>&nbsp;</td>
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
                <td style={{ color: AccountProperties[AccountType.INCOME].color }}>수입</td>
                <td>기타소득 &gt; 불로소득 </td>
                <td>복권당첨</td>
                <td style={{ textAlign: 'right' }}>3,100,000,000</td>
                <td></td>
                <td>복슬통장</td>
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
                <td style={{ color: AccountProperties[AccountType.TRANSFER].color }}>이체</td>
                <td>대체거래 &gt; 계좌이체 </td>
                <td>카드값</td>
                <td style={{ textAlign: 'right' }}>1,000,000</td>
                <td>복슬통장</td>
                <td>복슬카드</td>
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
        </Col>
      </Row>
    </Container>
  );
}

export default LedgerCalendar;
