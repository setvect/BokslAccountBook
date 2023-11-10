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

interface MenuProps {
  bodyHeight: { minHeight: string };
}

function Menu({ bodyHeight }: MenuProps) {
  return (
    <Col className="color-theme-left sidebar-style">
      <Nav className="flex-column" style={{ ...bodyHeight, padding: '20px 20px' }}>
        <Button className="text-left mb-2 menu-button custom-btn-navy">
          <FaCalendarAlt className="me-2" /> 가계부 쓰기(달력)
        </Button>
        <Button className="text-left mb-2 menu-button custom-btn">
          <FaTable className="me-2" /> 가계부 쓰기(표)
        </Button>
        <Button className="text-left mb-2 menu-button custom-btn">
          <FaChartLine className="me-2" /> 주식 매매
        </Button>
        <Button className="text-left mb-2 menu-button custom-btn">
          <FaBalanceScale className="me-2" /> 결산
        </Button>
        <Button className="text-left mb-2 menu-button custom-btn">
          <FaChartPie className="me-2" /> 통계
        </Button>
        <Button className="text-left mb-2 menu-button custom-btn">
          <FaTags className="me-2" /> 분류 관리
        </Button>
        <Button className="text-left mb-2 menu-button custom-btn">
          <FaUniversity className="me-2" /> 계좌 관리
        </Button>
        <Button className="text-left mb-2 menu-button custom-btn">
          <FaRegListAlt className="me-2" /> 매수 종목
        </Button>
        <Button className="text-left mb-2 menu-button custom-btn">
          <FaCamera className="me-2" /> 자산 스냅샷
        </Button>
        <Button className="text-left mb-2 menu-button custom-btn">
          <FaCode className="me-2" /> 코드 관리
        </Button>
      </Nav>
    </Col>
  );
}

export default Menu;
