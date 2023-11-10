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
import { Link } from 'react-router-dom';

interface MenuProps {
  bodyHeight: { minHeight: string };
}

function Menu({ bodyHeight }: MenuProps) {
  return (
    <Col className="color-theme-left sidebar-style">
      <Nav className="flex-column" style={{ ...bodyHeight, padding: '20px 20px' }}>
        <Link to="/">
          <Button className="text-left mb-2 menu-button custom-btn-navy">
            <FaCalendarAlt className="me-2" /> 가계부 쓰기(달력)
          </Button>
        </Link>
        <Link to="/LedgerTable">
          <Button className="text-left mb-2 menu-button custom-btn">
            <FaTable className="me-2" /> 가계부 쓰기(표)
          </Button>
        </Link>
        <Link to="/StockTrading">
          <Button className="text-left mb-2 menu-button custom-btn">
            <FaChartLine className="me-2" /> 주식 매매
          </Button>
        </Link>
        <Link to="/FinancialSettlement">
          <Button className="text-left mb-2 menu-button custom-btn">
            <FaBalanceScale className="me-2" /> 결산
          </Button>
        </Link>
        <Link to="/Statistics">
          <Button className="text-left mb-2 menu-button custom-btn">
            <FaChartPie className="me-2" /> 통계
          </Button>
        </Link>
        <Link to="/CategoryManagement">
          <Button className=" text-left mb-2 menu-button custom-btn">
            <FaTags className=" me-2" /> 분류 관리
          </Button>
        </Link>
        <Link to="/AccountManagement">
          <Button className="text-left mb-2 menu-button custom-btn">
            <FaUniversity className="me-2" /> 계좌 관리
          </Button>
        </Link>
        <Link to="/PurchasedStocks">
          <Button className=" text-left mb-2 menu-button custom-btn">
            <FaRegListAlt className=" me-2" /> 매수 종목
          </Button>
        </Link>
        <Link to="/AssetSnapshot">
          <Button className="text-left mb-2 menu-button custom-btn">
            <FaCamera className="me-2" /> 자산 스냅샷
          </Button>
        </Link>
        <Link to="/CodeManagement">
          <Button className=" text-left mb-2 menu-button custom-btn">
            <FaCode className=" me-2" /> 코드 관리
          </Button>
        </Link>
      </Nav>
    </Col>
  );
}

export default Menu;
