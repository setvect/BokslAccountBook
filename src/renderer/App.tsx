import React, { useEffect, useRef, useState } from 'react';
import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import { Col, Container, Nav, Navbar, NavDropdown, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

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
          <Navbar ref={navbarRef} bg="dark" variant="dark" expand="lg">
            <Navbar.Brand href="#home">복슬가계부</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link href="#home">Home</Nav.Link>
                <Nav.Link href="#link">Link</Nav.Link>
                <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                  <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                  <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                  <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
        </Col>
      </Row>

      {/* 본문 영역: 왼쪽 메뉴와 내용 영역 */}
      <Row style={fullHeightMinusNavbar}>
        {/* 왼쪽 메뉴 */}
        <Col xs={2} id="sidebar-wrapper" style={{ ...fullHeightMinusNavbar, padding: 0 }}>
          <Nav className="flex-column" style={{ ...fullHeightMinusNavbar, background: '#eee' }}>
            {/* 메뉴 내용 */}
            <Nav.Item>
              <Nav.Link href="#dashboard">Dashboard</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link href="#orders">Orders</Nav.Link>
            </Nav.Item>
            {/* 추가 메뉴 아이템 */}
          </Nav>
        </Col>

        {/* 메인 컨텐츠 영역 */}
        <Col xs={10} id="page-content-wrapper" style={{ ...fullHeightMinusNavbar, padding: 0 }}>
          <Container fluid style={{ height: '100%' }}>
            <h2>Main Content Area</h2>
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
