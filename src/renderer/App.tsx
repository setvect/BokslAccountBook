import React, { useEffect, useRef, useState } from 'react';
import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import { Button, Col, Container, Nav, Navbar, NavDropdown, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/theme-dark.css';
import './css/style.css';
import {
  FaBalanceScale,
  FaCalendarAlt,
  FaCamera,
  FaChartLine,
  FaChartPie,
  FaCode,
  FaLock,
  FaPaw,
  FaRegListAlt,
  FaTable,
  FaTags,
  FaUniversity,
} from 'react-icons/fa';

function Hello() {
  // 추가: 전역 스타일을 위한 CSS-in-JS

  const navbarRef = useRef<HTMLElement>(null); // 타입을 HTMLElement로 지정
  const [navbarHeight, setNavbarHeight] = useState(0); // 상단바의 높이 상태
  useEffect(() => {
    // navbarRef.current가 존재하는지 확인하고, 존재한다면 높이를 설정합니다.
    if (navbarRef.current) {
      setNavbarHeight(navbarRef.current.clientHeight);
    }
  }, []); // 빈 의존성 배열을 사용하여 컴포넌트 마운트 시에만 실행

  const fullHeightMinusNavbar = {
    minHeight: `calc(100vh - ${navbarHeight}px)`,
  };

  return (
    <Container fluid style={fullHeightMinusNavbar}>
      {/* 상단 바 */}
      <Row>
        <Col style={{ paddingRight: 0, paddingLeft: 0 }}>
          <Navbar ref={navbarRef} variant="dark" expand="lg" className="color-theme-top">
            <Navbar.Brand href="#home" style={{ paddingLeft: '23px' }}>
              <FaPaw size={30} style={{ marginBottom: 5 }} color="#ffdb00" /> 복슬가계부
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                <Button size="sm" variant="link" href="#passwordChange" style={{ marginRight: '20px' }} title="비밀번호 수정">
                  <FaLock color="gray" />
                </Button>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
        </Col>
      </Row>

      {/* 본문 영역: 왼쪽 메뉴와 내용 영역 */}
      <Row style={fullHeightMinusNavbar}>
        {/* 왼쪽 메뉴 */}
        <Col className="color-theme-left sidebar-style">
          <Nav className="flex-column" style={{ ...fullHeightMinusNavbar, padding: '20px 20px' }}>
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

        {/* 메인 컨텐츠 영역 */}
        <Col style={{ ...fullHeightMinusNavbar, padding: '20px' }} className="color-theme-content-bg">
          <Container fluid style={{ height: '100%', padding: '20px' }} className="color-theme-content">
            <h2>Main Content Area</h2>
            <p>This is the main content area. Replace this text with your own content.</p>
            <p>This is the main content area. Replace this text with your own content.</p>
            <p>This is the main content area. Replace this text with your own content.</p>
            {/* 추가 컨텐츠 */}
          </Container>
        </Col>
      </Row>
    </Container>
  );
}

export default function App() {
  // CSS-in-JS를 사용하여 전역 스타일 적용
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
