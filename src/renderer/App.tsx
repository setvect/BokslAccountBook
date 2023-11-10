import React, { useEffect, useRef, useState } from 'react';
import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/theme-dark.css';
import './css/style.css';
import TopBar from './TopBar';
import Menu from './Menu';

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

  const bodyHeight = {
    minHeight: `calc(100vh - ${navbarHeight}px)`,
  };

  return (
    <Container fluid style={bodyHeight}>
      {/* 상단 바 */}
      <TopBar setNavbarHeight={setNavbarHeight} />

      {/* 본문 영역: 왼쪽 메뉴와 내용 영역 */}
      <Row style={bodyHeight}>
        <Menu bodyHeight={bodyHeight} />

        {/* 메인 컨텐츠 영역 */}
        <Col style={{ ...bodyHeight, padding: '20px' }} className="color-theme-content-bg">
          <Container fluid style={{ height: '100%', padding: '20px' }} className="color-theme-content">
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
