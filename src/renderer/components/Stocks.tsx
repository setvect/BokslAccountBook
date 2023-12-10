import { Col, Container, Nav, Row, Tab } from 'react-bootstrap';
import React from 'react';
import StockList from './stocks/StockList';
import StockBuyList from './stocks/StockBuyList';

function Stocks() {
  return (
    <Container fluid style={{ height: '100%', padding: '20px' }} className="color-theme-content">
      <h2>주식 종목</h2>
      <Tab.Container defaultActiveKey="expense">
        <Row>
          <Col sm={12}>
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="expense">매수 종목</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="income">종목 관리</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
        </Row>
        <Row style={{ marginTop: '15px' }}>
          <Col sm={12}>
            <Tab.Content>
              <Tab.Pane eventKey="expense">
                <StockBuyList />
              </Tab.Pane>
              <Tab.Pane eventKey="income">
                <StockList />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
}

export default Stocks;
