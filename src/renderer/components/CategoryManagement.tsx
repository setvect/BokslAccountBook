import { Col, Container, Nav, Row, Tab } from 'react-bootstrap';
import React from 'react';
import Category from './category/Category';

function LedgerCalendar() {
  return (
    <Container fluid style={{ height: '100%', padding: '20px' }} className="color-theme-content">
      <h2>분류관리</h2>
      <Tab.Container defaultActiveKey="expense">
        <Row>
          <Col sm={12}>
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="expense">지출 항목</Nav.Link>
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
              <Tab.Pane eventKey="expense">
                <Category categorySeq={10} />
              </Tab.Pane>
              <Tab.Pane eventKey="income">
                <Category categorySeq={20} />
              </Tab.Pane>
              <Tab.Pane eventKey="transfer">
                <Category categorySeq={30} />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
}

export default LedgerCalendar;
