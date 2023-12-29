import { Col, Container, Nav, Row, Tab } from 'react-bootstrap';
import React, { useState } from 'react';
import AccountList from './account/AccountList';
import AccountSummary from './account/AccountSummary';

function LedgerCalendar() {
  type ActiveTab = 'transaction' | 'variance';
  const [activeTab, setActiveTab] = useState<ActiveTab>('transaction');

  return (
    <Container fluid style={{ height: '100%', padding: '20px' }} className="color-theme-content">
      <h2>계좌관리</h2>
      <Tab.Container activeKey={activeTab} onSelect={(k) => k && setActiveTab(k as ActiveTab)}>
        <Row>
          <Col sm={12}>
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="transaction">계좌 목록</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="variance">계좌 통계</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
        </Row>
        <Row style={{ marginTop: '15px' }}>
          <Col sm={12}>
            <Tab.Content>
              <Tab.Pane eventKey="transaction">
                <AccountList />
              </Tab.Pane>
              <Tab.Pane eventKey="variance">
                <AccountSummary activeTab={activeTab} />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
}

export default LedgerCalendar;
