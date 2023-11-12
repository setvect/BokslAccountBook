import { Col, Container, Row } from 'react-bootstrap';
import React from 'react';
import CalendarPart from './calendar/CalendarPart';

// 이벤트 객체에 icon 속성을 추가하기 위한 인
function LedgerCalendar(): React.ReactElement {
  return (
    <Container fluid style={{ height: '100%', padding: '20px' }} className="color-theme-content">
      <h2>달력</h2>
      <Row>
        <CalendarPart />
        <Col>2 of 2</Col>
      </Row>
    </Container>
  );
}

export default LedgerCalendar;
