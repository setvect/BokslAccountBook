import React, { useEffect, useRef, useState } from 'react';
import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/theme-dark.css';
import './css/style.css';
import TopBar from './TopBar';
import Menu from './Menu';
import LedgerCalendar from './page/LedgerCalendar';
import LedgerTable from './page/LedgerTable';
import StockTrading from './page/StockTrading';
import FinancialSettlement from './page/FinancialSettlement';
import Statistics from './page/Statistics';
import CategoryManagement from './page/CategoryManagement';
import AccountManagement from './page/AccountManagement';
import PurchasedStocks from './page/PurchasedStocks';
import AssetSnapshot from './page/AssetSnapshot';
import CodeManagement from './page/CodeManagement';

function Main() {
  const navbarRef = useRef<HTMLElement>(null);
  const [navbarHeight, setNavbarHeight] = useState(0);
  useEffect(() => {
    if (navbarRef.current) {
      setNavbarHeight(navbarRef.current.clientHeight);
    }
  }, []);

  const bodyHeight = {
    minHeight: `calc(100vh - ${navbarHeight}px)`,
  };

  return (
    <Container fluid style={bodyHeight}>
      <TopBar setNavbarHeight={setNavbarHeight} />

      <Row style={bodyHeight}>
        <Router>
          <Menu bodyHeight={bodyHeight} />
          <Col style={{ ...bodyHeight, padding: '20px' }} className="color-theme-content-bg">
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
          </Col>
        </Router>
      </Row>
    </Container>
  );
}

export default Main;
