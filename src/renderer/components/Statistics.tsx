import { Col, Container, Nav, Row, Tab } from 'react-bootstrap';
import React from 'react';
import StatisticsTransaction from './statistics/StatisticsTransaction';

function LedgerCalendar() {
  return (
    <div className="chart-container">
      <Container fluid style={{ height: '100%', padding: '20px' }} className="color-theme-content">
        <h2>통계</h2>
        <Tab.Container defaultActiveKey="transaction">
          <Row>
            <Col sm={12}>
              <Nav variant="tabs">
                <Nav.Item>
                  <Nav.Link eventKey="transaction">지출/수입/이체</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="variance">자산변동</Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
          </Row>
          <Row style={{ marginTop: '15px' }}>
            <Col sm={12}>
              <Tab.Content>
                <Tab.Pane eventKey="transaction">
                  <StatisticsTransaction />
                </Tab.Pane>
                <Tab.Pane eventKey="variance">aaa</Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </Container>
    </div>
  );
}

export default LedgerCalendar;
