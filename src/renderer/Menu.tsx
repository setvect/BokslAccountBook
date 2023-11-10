import { Button, Col, Nav } from 'react-bootstrap';
import {
  FaBalanceScale,
  FaCalendarAlt,
  FaCamera,
  FaChartLine,
  FaChartPie,
  FaCode,
  FaRegListAlt,
  FaTable,
  FaTags,
  FaUniversity,
} from 'react-icons/fa';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface MenuProps {
  bodyHeight: { minHeight: string };
}

const menuItems = [
  { path: '/', label: '가계부 쓰기(달력)', icon: <FaCalendarAlt className="me-2" /> },
  { path: '/LedgerTable', label: '가계부 쓰기(표)', icon: <FaTable className="me-2" /> },
  { path: '/StockTrading', label: '주식 매매', icon: <FaChartLine className="me-2" /> },
  { path: '/FinancialSettlement', label: '결산', icon: <FaBalanceScale className="me-2" /> },
  { path: '/Statistics', label: '통계', icon: <FaChartPie className="me-2" /> },
  { path: '/CategoryManagement', label: '분류 관리', icon: <FaTags className="me-2" /> },
  { path: '/AccountManagement', label: '계좌 관리', icon: <FaUniversity className="me-2" /> },
  { path: '/PurchasedStocks', label: '매수 종목', icon: <FaRegListAlt className="me-2" /> },
  { path: '/AssetSnapshot', label: '자산 스냅샷', icon: <FaCamera className="me-2" /> },
  { path: '/CodeManagement', label: '코드 관리', icon: <FaCode className="me-2" /> },
];

function Menu({ bodyHeight }: MenuProps) {
  const location = useLocation();

  const getButtonClass = (path: string) => {
    return location.pathname === path ? 'custom-btn-navy' : 'custom-btn';
  };

  return (
    <Col className="color-theme-left sidebar-style">
      <Nav className="flex-column" style={{ ...bodyHeight, padding: '20px 20px' }}>
        {menuItems.map((item) => (
          <Link to={item.path} key={item.path}>
            <Button className={`text-left mb-2 menu-button ${getButtonClass(item.path)}`}>
              {item.icon}
              {item.label}
            </Button>
          </Link>
        ))}
      </Nav>
    </Col>
  );
}

export default Menu;
