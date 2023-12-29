import { Button, Col, Nav, Navbar, Row } from 'react-bootstrap';
import { FaBalanceScale, FaBook, FaCalendarAlt, FaCamera, FaChartPie, FaPaw, FaRegListAlt, FaTable, FaTags, FaUniversity } from 'react-icons/fa';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { path: 'LedgerCalendar', label: '가계부 쓰기(달력)', icon: <FaCalendarAlt className="me-2" /> },
  { path: 'LedgerTable', label: '가계부 쓰기(표)', icon: <FaTable className="me-2" /> },
  { path: 'FinancialSettlement', label: '결산', icon: <FaBalanceScale className="me-2" /> },
  { path: 'Statistics', label: '통계', icon: <FaChartPie className="me-2" /> },
  { path: 'AccountManagement', label: '계좌 관리', icon: <FaUniversity className="me-2" /> },
  { path: 'Stocks', label: '주식 종목', icon: <FaRegListAlt className="me-2" /> },
  { path: 'AssetSnapshot', label: '자산 스냅샷', icon: <FaCamera className="me-2" /> },
  { path: 'CategoryManagement', label: '분류 관리', icon: <FaTags className="me-2" /> },
  { path: 'CodeManagement', label: '코드 관리', icon: <FaBook className="me-2" /> },
];

function Menu() {
  const location = useLocation();

  const getButtonClass = (path: string) => {
    return location.pathname === `/main/${path}` ? 'custom-btn-navy' : 'custom-btn';
  };

  return (
    <Col className="color-theme-left sidebar-style">
      <Row>
        <Col style={{ paddingRight: 0, paddingLeft: 0, paddingTop: 17 }}>
          <Navbar variant="dark" expand="lg">
            <Navbar.Brand style={{ paddingLeft: '37px', fontSize: '25px' }}>
              <Link to="/main/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <FaPaw size={30} style={{ marginBottom: 3 }} color="#ffee77" /> 복슬가계부
              </Link>
            </Navbar.Brand>
          </Navbar>
        </Col>
      </Row>

      <Nav className="flex-column menu" style={{ padding: '10px 20px' }}>
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
