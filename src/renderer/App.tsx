import React, { Suspense, useEffect, useRef, useState } from 'react';
import { MemoryRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { Col, Container, Row, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/theme-dark.css';
import './css/style.css';
import Menu from './Menu';

const LedgerCalendar = React.lazy(() => import('./components/LedgerCalendar'));
const LedgerTable = React.lazy(() => import('./components/LedgerTable'));
const FinancialSettlement = React.lazy(() => import('./components/FinancialSettlement'));
const Statistics = React.lazy(() => import('./components/Statistics'));
const CategoryManagement = React.lazy(() => import('./components/CategoryManagement'));
const AccountManagement = React.lazy(() => import('./components/AccountManagement'));
const Stocks = React.lazy(() => import('./components/Stocks'));
const AssetSnapshot = React.lazy(() => import('./components/AssetSnapshot'));
const CodeManagement = React.lazy(() => import('./components/CodeManagement'));

function Wait() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function RedirectToLedgerTable() {
  const navigate = useNavigate();
  useEffect(
    () => {
      navigate('/CodeManagement');
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  return null;
}
function Main() {
  return (
    <Container fluid style={{ minHeight: '100vh' }} data-bs-theme="dark">
      <Row style={{ minHeight: '100vh' }}>
        <Router>
          <Menu />
          <Col style={{ padding: '20px' }} className="color-theme-content-bg">
            {/* <RedirectToLedgerTable /> */}
            <Suspense fallback={<Wait />}>
              <Routes>
                <Route path="/" element={<LedgerCalendar />} />
                <Route path="/LedgerTable" element={<LedgerTable />} />
                <Route path="/FinancialSettlement" element={<FinancialSettlement />} />
                <Route path="/Statistics" element={<Statistics />} />
                <Route path="/CategoryManagement" element={<CategoryManagement />} />
                <Route path="/AccountManagement" element={<AccountManagement />} />
                <Route path="/Stocks" element={<Stocks />} />
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
