import React, { useEffect, useRef } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { Container, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/theme-dark.css';
import './css/style.css';
import AboutBokslAccountBookModal, { AboutBokslAccountBookModalHandle } from './AboutBokslAccountBook';
import { IPC_CHANNEL } from '../common/CommonType';
import Login from './components/Login';
import Main from './Main';

function App() {
  const aboutBokslAccountBookModalRef = useRef<AboutBokslAccountBookModalHandle>(null);

  useEffect(() => {
    const handleAboutBoksl = () => {
      aboutBokslAccountBookModalRef.current?.openAboutBokslAccountModal();
    };

    const removeListener = window.electron.ipcRenderer.on(IPC_CHANNEL.about_boksl, handleAboutBoksl);

    // 클린업 함수
    return () => {
      removeListener();
    };
  }, []);

  return (
    <Container fluid style={{ minHeight: '100vh' }} data-bs-theme="dark">
      <Row style={{ minHeight: '100vh' }}>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/main/*" element={<Main />} />
          </Routes>
        </Router>
      </Row>
      <AboutBokslAccountBookModal ref={aboutBokslAccountBookModalRef} />
    </Container>
  );
}

export default App;
