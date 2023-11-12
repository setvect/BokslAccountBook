import { Button, Col, Container, Row } from 'react-bootstrap';
import React, { useRef, useState } from 'react';
import moment from 'moment';
import CalendarPart, { CalendarPartMethods } from './calendar/CalendarPart';

// 이벤트 객체에 icon 속성을 추가하기 위한 인
function LedgerCalendar(): React.ReactElement {
  // const [events, setEvents] = useState<Array<any>>([]);
  const [selectDate, setSelectDate] = useState<Date | null>(new Date());
  const handleChangeDate = (newSelectDate: Date) => {
    console.log('############', newSelectDate);
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
          <Button onClick={reloadLedger}>현재 달 다시 계산</Button>2 of 2
        </Col>
      </Row>
    </Container>
  );
}

export default LedgerCalendar;
