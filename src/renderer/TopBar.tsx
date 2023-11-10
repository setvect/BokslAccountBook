import React, { useEffect, useRef } from 'react';
import { Button, Col, Nav, Navbar, Row } from 'react-bootstrap';
import { FaLock, FaPaw } from 'react-icons/fa';

interface TopBarProps {
  setNavbarHeight: (height: number) => void;
}

function TopBar({ setNavbarHeight }: TopBarProps) {
  const navbarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (navbarRef.current) {
      setNavbarHeight(navbarRef.current.clientHeight);
    }
  }, [setNavbarHeight]);

  return (
    <Row>
      <Col style={{ paddingRight: 0, paddingLeft: 0 }}>
        <Navbar ref={navbarRef} variant="dark" expand="lg" className="color-theme-top">
          <Navbar.Brand href="#home" style={{ paddingLeft: '25px' }}>
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
  );
}

export default TopBar;
