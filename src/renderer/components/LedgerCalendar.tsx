import { Button, Col, Container, Row } from 'react-bootstrap';
import React, { useRef, useState } from 'react';
import CalendarPart, { CalendarPartHandle } from './calendar/CalendarPart';
import TransactionList from './calendar/TransactionList';
import TradeList from './calendar/TradeList';
import ExchangeList from './calendar/ExchangeList';
import SettlementMonth from './calendar/SettlementMonth';

// 이벤트 객체에 icon 속성을 추가하기 위한 인
function LedgerCalendar(): React.ReactElement {
  const [selectDate, setSelectDate] = useState<Date>(new Date());
  const [forceReload, setForceReload] = useState<boolean>(false);
  const handleChangeDate = (newSelectDate: Date) => {
    setSelectDate(newSelectDate);
  };
  const handleChange = () => {
    setForceReload(!forceReload);
  };

  const calendarPartRef = useRef<CalendarPartHandle>(null);
  const reloadLedger = () => {
    calendarPartRef.current?.reloadLedger();
    setForceReload(!forceReload);
  };

  return (
    <Container fluid style={{ height: '100%', padding: '20px' }} className="color-theme-content">
      <h2>가계부 쓰기(달력)</h2>
      <Row>
        <CalendarPart onChangeDate={handleChangeDate} onChange={handleChange} ref={calendarPartRef} />
        <Col>
          <TransactionList onChange={reloadLedger} selectDate={selectDate} forceReload={forceReload} />
          <TradeList onChange={reloadLedger} selectDate={selectDate} forceReload={forceReload} />
          <ExchangeList onChange={reloadLedger} selectDate={selectDate} forceReload={forceReload} />
          <SettlementMonth selectDate={selectDate} forceReload={forceReload} />
        </Col>
      </Row>
    </Container>
  );
}

export default LedgerCalendar;
