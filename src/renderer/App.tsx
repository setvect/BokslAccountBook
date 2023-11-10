import React, { Suspense, useEffect, useRef, useState } from 'react';
import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import { Col, Container, Row, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/theme-dark.css';
import './css/style.css';
import Menu from './Menu';

const LedgerCalendar = React.lazy(() => import('./page/LedgerCalendar'));
const LedgerTable = React.lazy(() => import('./page/LedgerTable'));
const StockTrading = React.lazy(() => import('./page/StockTrading'));
const FinancialSettlement = React.lazy(() => import('./page/FinancialSettlement'));
const Statistics = React.lazy(() => import('./page/Statistics'));
const CategoryManagement = React.lazy(() => import('./page/CategoryManagement'));
const AccountManagement = React.lazy(() => import('./page/AccountManagement'));
const PurchasedStocks = React.lazy(() => import('./page/PurchasedStocks'));
const AssetSnapshot = React.lazy(() => import('./page/AssetSnapshot'));
const CodeManagement = React.lazy(() => import('./page/CodeManagement'));

function Wait() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
}
function Main() {
  return (
    <Container fluid style={{ minHeight: '100vh' }}>
      <Row style={{ minHeight: '100vh' }}>
        <Router>
          <Menu />
          <Col style={{ padding: '20px' }} className="color-theme-content-bg">
            <Suspense fallback={<Wait />}>
              <Routes>
                <Route path="/" element={<LedgerCalendar />} />
                <Route path="/LedgerTable" element={<LedgerTable />} />
                <Route path="/StockTrading" element={<StockTrading />} />
                <Route path="/FinancialSettlement" element={<FinancialSettlement />} />
                <Route path="/Statistics" element={<Statistics />} />
                <Route path="/CategoryManagement" element={<CategoryManagement />} />
                <Route path="/AccountManagement" element={<AccountManagement />} />
                <Route path="/PurchasedStocks" element={<PurchasedStocks />} />
                <Route path="/AssetSnapshot" element={<AssetSnapshot />} />
                <Route path="/CodeManagement" element={<CodeManagement />} />
              </Routes>
            </Suspense>
          </Col>
        </Router>
      </Row>
    </Container>
  );
}

export default Main;
