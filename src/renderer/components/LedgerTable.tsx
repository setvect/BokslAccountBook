import { Col, Container, Nav, Row, Tab } from 'react-bootstrap';
import React from 'react';
import TableTransaction from './table/TableTransaction';
import TableTrade from './table/TableTrade';
import TableExchange from './table/TableExchange';

function LedgerCalendar() {
  return (
    <Container fluid style={{ height: '100%', padding: '20px' }} className="color-theme-content">
      <h2>가계부 작성(표)</h2>
      <Tab.Container defaultActiveKey="transaction">
        <Row>
          <Col sm={12}>
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="transaction">지출/수입/이체</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="trade">주식 매매</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="exchange">환전</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
        </Row>
        <Row style={{ marginTop: '15px' }}>
          <Col sm={12}>
            <Tab.Content>
              <Tab.Pane eventKey="transaction">
                <TableTransaction />
              </Tab.Pane>
              <Tab.Pane eventKey="trade">
                <TableTrade />
              </Tab.Pane>
              <Tab.Pane eventKey="exchange">
                <TableExchange />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
}

export default LedgerCalendar;
