import { Col, Container, Nav, Row, Tab } from 'react-bootstrap';
import React from 'react';
import FinancialTransaction from './financial/FinancialTransaction';
import FinancialTrade from './financial/FinancialTrade';
import FinancialExchange from './financial/FinancialExchange';

function LedgerCalendar() {
  return (
    <Container fluid style={{ height: '100%', padding: '20px' }} className="color-theme-content">
      <h2>결산</h2>
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
                <FinancialTransaction />
              </Tab.Pane>
              <Tab.Pane eventKey="trade">
                <FinancialTrade />
              </Tab.Pane>
              <Tab.Pane eventKey="exchange">
                <FinancialExchange />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
}

export default LedgerCalendar;
