import React, { useEffect, useRef, useState } from 'react';
import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/theme-dark.css';
import './css/style.css';
import TopBar from './TopBar';
import Menu from './Menu';
import CalendarPage from './page/CalendarPage';

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
        <Menu bodyHeight={bodyHeight} />
        <Col style={{ ...bodyHeight, padding: '20px' }} className="color-theme-content-bg">
          <Router>
            <Routes>
              <Route path="/" element={<CalendarPage />} />
            </Routes>
          </Router>
        </Col>
      </Row>
    </Container>
  );
}

export default function App() {
  // CSS-in-JS를 사용하여 전역 스타일 적용
  return <Main />;
}
