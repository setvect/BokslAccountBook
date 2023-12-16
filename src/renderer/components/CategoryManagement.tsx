import { Col, Container, Nav, Row, Tab } from 'react-bootstrap';
import React from 'react';
import Category from './category/Category';
import { CategoryKind } from '../mapper/CategoryMapper';

function LedgerCalendar() {
  return (
    <Container fluid style={{ height: '100%', padding: '20px' }} className="color-theme-content">
      <h2>분류관리</h2>
      <Tab.Container defaultActiveKey="spending">
        <Row>
          <Col sm={12}>
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="spending">지출 항목</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="income">수입 항목</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="transfer">이체 항목</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
        </Row>
        <Row style={{ marginTop: '15px' }}>
          <Col sm={12}>
            <Tab.Content>
              <Tab.Pane eventKey="spending">
                <Category categoryKind={CategoryKind.SPENDING} />
              </Tab.Pane>
              <Tab.Pane eventKey="income">
                <Category categoryKind={CategoryKind.INCOME} />
              </Tab.Pane>
              <Tab.Pane eventKey="transfer">
                <Category categoryKind={CategoryKind.TRANSFER} />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
}

export default LedgerCalendar;
